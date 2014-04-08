// This file contains the scripts used when LabelMe starts up.

// Main entry point for the annotation tool.
function StartupLabelMe() {
  // Write "start up" messages:
  WriteLogMsg('*start_loading');
  console.log('LabelMe: starting up...');

  // Initialize global variables:
  main_handler = new handler();
  main_canvas = new canvas('myCanvas_bg');
  main_select_canvas = new canvas('select_canvas');
  main_draw_canvas = new canvas('draw_canvas');
  main_query_canvas = new canvas('query_canvas');
  main_image = new image('im');
  
  // This function gets run after image is loaded:
  function main_image_onload_helper() {
    // Set the image dimensions:
    main_image.SetImageDimensions();
    
    // Read the XML annotation file:
    var anno_file = main_image.GetFileInfo().GetFullName();
    anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
    ReadXML(anno_file,LoadAnnotationSuccess,LoadAnnotation404);
  };

  // Get the image:
  main_image.GetNewImage(main_image_onload_helper);
}

// This function gets called if the annotation has been successfully loaded.
function LoadAnnotationSuccess(xml) {
  // Set global variable:
  LM_xml = xml;

  var obj_elts = LM_xml.getElementsByTagName("object");
  var num_obj = obj_elts.length;
  
  AllAnnotations = Array(num_obj);
  num_orig_anno = num_obj;

  // Initialize any empty tags in the XML file:
  for(var pp = 0; pp < num_obj; pp++) {
    var curr_obj = $(LM_xml).children("annotation").children("object").eq(pp);

    // Initialize object name if empty in the XML file:
    if(curr_obj.children("name").length == 0) curr_obj.append($("<name></name>"));

    // Set object IDs:
    if(curr_obj.children("id").length > 0) curr_obj.children("id").text(""+pp);
    else curr_obj.append($("<id>" + pp + "</id>"));

    // Initialize username if empty in the XML file:
    if(curr_obj.children("polygon").children("username").length == 0) curr_obj.children("polygon").append($("<username>anonymous</username>"));
  }
    
  // Add part fields (this calls a funcion inside object_parts.js)
  addPartFields(); // makes sure all the annotations have all the fields.
  
  // Loop over annotated objects
  for(var pp = 0; pp < num_obj; pp++) {
    AllAnnotations[pp] = new annotation(pp);
    
    // insert polygon
    var pt_elts = obj_elts[pp].getElementsByTagName("polygon")[0].getElementsByTagName("pt");
    var numpts = pt_elts.length;
    AllAnnotations[pp].CreatePtsX(numpts);
    AllAnnotations[pp].CreatePtsY(numpts);
    for(ii=0; ii < numpts; ii++) {
      AllAnnotations[pp].GetPtsX()[ii] = parseInt(pt_elts[ii].getElementsByTagName("x")[0].firstChild.nodeValue);
      AllAnnotations[pp].GetPtsY()[ii] = parseInt(pt_elts[ii].getElementsByTagName("y")[0].firstChild.nodeValue);
    }
  }

  // Add annotations to the main_canvas:
  for(var pp=0; pp < AllAnnotations.length; pp++) {
    var isDeleted = AllAnnotations[pp].GetDeleted();
    if(((pp<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || (pp>=num_orig_anno)) {
      main_canvas.AttachAnnotation(AllAnnotations[pp],'polygon');
    }
  }

  // Render the polygons on the main_canvas:
  main_canvas.RenderAnnotations();

  // Finish the startup scripts:
  FinishStartup();
}

// Finish the startup process:
function FinishStartup() {
  // Load the annotation list on the right side of the page:
  if(view_ObjList) LoadAnnotationList();

  // Add actions:
  console.log('LabelMe: setting actions');
  if($('#img_url')) $('#img_url').attr('onclick','javascript:console.log(\'bobo\');location.href=main_image.GetFileInfo().GetImagePath();');
  $('#body').attr('onmouseup',"javascript:main_handler.MainPageMouseUp(event);");

  // Initialize the username:
  initUserName();
  
  // Set action when the user presses a key:
  document.onkeyup = main_handler.KeyPress;
  
  // Collect statistics:
  ref = document.referrer;

  // Write "finished" messages:
  WriteLogMsg('*done_loading_' + main_image.GetFileInfo().GetImagePath());
  console.log('LabelMe: finished loading');
}

// Annotation file does not exist, so load template:
function LoadAnnotation404(jqXHR,textStatus,errorThrown) {
  if(jqXHR.status==404) 
    ReadXML(main_image.GetFileInfo().GetTemplatePath(),LoadTemplateSuccess,LoadTemplate404);
  else
    alert(jqXHR.status);
}

// Annotation template does not exist for this folder, so load default 
// LabelMe template:
function LoadTemplate404(jqXHR,textStatus,errorThrown) {
  if(jqXHR.status==404)
    ReadXML('annotationCache/XMLTemplates/labelme.xml',LoadTemplateSuccess,function(jqXHR) {
	alert(jqXHR.status);
      });
  else
    alert(jqXHR.status);
}

// Actions after template load success:
function LoadTemplateSuccess(xml) {
  // Set global variable:
  LM_xml = xml;

  // Set folder and image filename:
  LM_xml.getElementsByTagName("filename")[0].firstChild.nodeValue = '\n'+main_image.GetFileInfo().GetImName()+'\n';
  LM_xml.getElementsByTagName("folder")[0].firstChild.nodeValue = '\n'+main_image.GetFileInfo().GetDirName()+'\n';

  // Set global variable:
  num_orig_anno = 0;

  // Finish the startup scripts:
  FinishStartup();
}
