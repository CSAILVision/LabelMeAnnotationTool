// This file contains the scripts used when LabelMe starts up.

// Main entry point for the annotation tool.
function StartupLabelMe() {
  console.time('startup');

  // Check browser:
  GetBrowserInfo();
  if(IsNetscape() || (IsMicrosoft() && (bversion>=4.5)) || IsSafari() || IsChrome()) {
    // Write "start up" messages:
    WriteLogMsg('*start_loading');
    console.log('LabelMe: starting up...');
    
    // Initialize global variables:
    main_handler = new handler();
    main_canvas = new canvas('myCanvas_bg');
    main_media = new image('im');
    // Parse the input URL.  Returns false if the URL does not set the 
    // annotation folder or image filename.  If false is returned, the 
    // function fetches a new image and sets the URL to reflect the 
    // fetched image.
    if(!main_media.GetFileInfo().ParseURL()) return;

    if(video_mode) {
      main_media = new video('videoplayer');
      main_media.GetFileInfo().ParseURL();
      console.log("Video mode...");
      var anno_file = main_media.GetFileInfo().GetFullName();
      main_media.GetNewVideo();
      anno_file = 'VLMAnnotations/' + anno_file + '.xml' + '?' + Math.random();
      ReadXML(anno_file,LoadAnnotationSuccess,LoadAnnotation404);
    }
    else {
      // This function gets run after image is loaded:
      function main_media_onload_helper() {
	// Set the image dimensions:
	main_media.SetImageDimensions();
      
	// Read the XML annotation file:
	var anno_file = main_media.GetFileInfo().GetFullName();
	anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
	ReadXML(anno_file,LoadAnnotationSuccess,LoadAnnotation404);
      };

      // Get the image:
      main_media.GetNewImage(main_media_onload_helper);
    }
  }
  else {
    // Invalid browser, so display error page.
    $('body').remove();
    $('html').append('<body><p><img src="Icons/LabelMe.gif" /></p><br /><p>Sorry!  This page only works with Mozilla Firefox, Chrome, and Internet Explorer.  We may support other browsers in the future.</p><p><a href="http://www.mozilla.org">Download Mozilla Firefox?</a></p></body>');
  }
}

// This function gets called if the annotation has been successfully loaded.
function LoadAnnotationSuccess(xml) {
  console.time('load success');

  // Set global variable:
  LM_xml = xml;
console.log( "LoadAnnotationSuccess CALLED SUCCESS!!!!" );
  if (video_mode){
    FinishStartup();
    return;
  }
  var obj_elts = LM_xml.getElementsByTagName("object");
  var num_obj = obj_elts.length;
  
  AllAnnotations = Array(num_obj);
  num_orig_anno = num_obj;

  console.time('initialize XML');
  // Initialize any empty tags in the XML file:
  for(var pp = 0; pp < num_obj; pp++) {
    var curr_obj = $(LM_xml).children("annotation").children("object").eq(pp);

    // Initialize object name if empty in the XML file:
    if(curr_obj.children("name").length == 0) curr_obj.append($("<name></name>"));

    // Set object IDs:
    if(curr_obj.children("id").length > 0) curr_obj.children("id").text(""+pp);
    else curr_obj.append($("<id>" + pp + "</id>"));

    /*************************************************************/
    /*************************************************************/
    // Scribble: 
    // Initialize username if empty in the XML file. Check first if we 
    // have a polygon or a segmentation:
    if(curr_obj.children("polygon").length == 0) { // Segmentation
      if(curr_obj.children("segm").children("username").length == 0) {
        curr_obj.children("segm").append($("<username>anonymous</username>"));
      }
    }
    else if(curr_obj.children("polygon").children("username").length == 0) curr_obj.children("polygon").append($("<username>anonymous</username>"));
    /*************************************************************/
    /*************************************************************/
  }
  console.timeEnd('initialize XML');

  console.time('addPartFields()');
  // Add part fields (this calls a funcion inside object_parts.js)
  addPartFields(); // makes sure all the annotations have all the fields.
  console.timeEnd('addPartFields()');

  console.time('loop annotated');
  // Loop over annotated objects
  for(var pp = 0; pp < num_obj; pp++) {
    AllAnnotations[pp] = new annotation(pp);
    
    /*************************************************************/
    /*************************************************************/
    // Scribble: 
    // If annotation is polygon, insert polygon:
    if(obj_elts[pp].getElementsByTagName("polygon").length > 0){
      var pt_elts = obj_elts[pp].getElementsByTagName("polygon")[0].getElementsByTagName("pt");
      var numpts = pt_elts.length;
      AllAnnotations[pp].CreatePtsX(numpts);
      AllAnnotations[pp].CreatePtsY(numpts);
      for(ii=0; ii < numpts; ii++) {
        AllAnnotations[pp].GetPtsX()[ii] = parseInt(pt_elts[ii].getElementsByTagName("x")[0].firstChild.nodeValue);
        AllAnnotations[pp].GetPtsY()[ii] = parseInt(pt_elts[ii].getElementsByTagName("y")[0].firstChild.nodeValue);
      }
    }
    // Otherwise, insert segmentation:
    else if (scribble_mode){
      AllAnnotations[pp].SetType(1);
      AllAnnotations[pp].SetImName(obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("mask")[0].firstChild.nodeValue);
      AllAnnotations[pp].SetScribbleName(obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("scribble_name")[0].firstChild.nodeValue);
      var xc1 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("xmin")[0].firstChild.nodeValue);
      var yc1 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("ymin")[0].firstChild.nodeValue);
      var xc2 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("xmax")[0].firstChild.nodeValue);
      var yc2 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("ymax")[0].firstChild.nodeValue);
      var xc3 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("xmin")[0].firstChild.nodeValue);
      var yc3 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("ymin")[0].firstChild.nodeValue);
      var xc4 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("xmax")[0].firstChild.nodeValue);
      var yc4 = parseInt (obj_elts[pp].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("ymax")[0].firstChild.nodeValue);
  
      AllAnnotations[pp].SetImageCorners(xc1,yc1,xc2,yc2);
      AllAnnotations[pp].SetCorners(xc3,yc3,xc4,yc4);
    }
    /*************************************************************/
    /*************************************************************/

  }
  console.timeEnd('loop annotated');

  // Remove all current annotations before showing the new ones
  // (in case we're reading the last frame, see CopyPreviousAnnotations())
  main_canvas.RemoveAllAnnotations();
  
  console.time('attach main_canvas');
  // Attach valid annotations to the main_canvas:
  for(var pp = 0; pp < num_obj; pp++) {
    var isDeleted = AllAnnotations[pp].GetDeleted();
    if((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted)) {
      // Attach to main_canvas:
      main_canvas.AttachAnnotation(AllAnnotations[pp]);
    }
  }
  console.timeEnd('attach main_canvas');

  console.time('RenderAnnotations()');
  // Render the annotations:
  main_canvas.RenderAnnotations();
  console.timeEnd('RenderAnnotations()');

  console.timeEnd('load success');

  // Finish the startup scripts:
  FinishStartup();
}

// Annotation file does not exist, so load template:
function LoadAnnotation404(jqXHR,textStatus,errorThrown) {
console.log( "Startup.js::LoadAnnotation404 CALLED FAILED.... will call ReadXML with template xml!!!!" );
 
 if(jqXHR.status==404) 
    ReadXML(main_media.GetFileInfo().GetTemplatePath(),LoadTemplateSuccess,LoadTemplate404);
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
  LM_xml.getElementsByTagName("filename")[0].firstChild.nodeValue = '\n'+main_media.GetFileInfo().GetImName()+'\n';
  LM_xml.getElementsByTagName("folder")[0].firstChild.nodeValue = '\n'+main_media.GetFileInfo().GetDirName()+'\n';

  // Set global variable:
  num_orig_anno = 0;

  // Finish the startup scripts:
  FinishStartup();
}

// Finish the startup process:
function FinishStartup() {
  // Load the annotation list on the right side of the page:
  if(view_ObjList) RenderObjectList();
  
  // We only want to do the following once.
  // It can be called after loading the last frame.  
  if (typeof(ref)==='undefined')
  {		
	  // Add actions:
	  console.log('LabelMe: setting actions');
	  if($('#img_url')) $('#img_url').attr('onclick','javascript:console.log(\'bobo\');location.href=main_image.GetFileInfo().GetImagePath();');
	  $('#changeuser').attr("onclick","javascript:show_enterUserNameDIV(); return false;");
	  $('#userEnter').attr("onkeyup","javascript:var c; if(event.keyCode)c=event.keyCode; if(event.which)c=event.which; if(c==13 || c==27) changeAndDisplayUserName(c);");
	  $('#xml_url').attr("onclick","javascript:GetXMLFile();");
	  $('#nextImage').attr("onclick","javascript:ShowNextImage()");
	  $('#prevImage').attr("onclick","javascript:ShowPreviousImage()");	
	  $('#copyPrevious').attr("onclick","javascript:CopyPreviousAnnotations()");
	  $('#copyLastValid').attr("onclick","javascript:CopyLastValid()");	  
	  $('#zoomin').attr("onclick","javascript:main_image.Zoom(1.5)");
	  $('#zoomout').attr("onclick","javascript:main_image.Zoom(1.0/1.5)");
	  $('#fit').attr("onclick","javascript:main_image.Zoom('fitted')");
	  $('#erase').attr("onclick","javascript:main_handler.EraseSegment()");
	  $('#myCanvas_bg_div').attr("onmousedown","javascript:StartDrawEvent(event);return false;");
	  $('#myCanvas_bg_div').attr("oncontextmenu","javascript:return false;");
	  $('#myCanvas_bg_div').attr("onmouseover","javascript:unselectObjects();");
	  $('#select_canvas_div').attr("oncontextmenu","javascript:return false;");
	  $('#query_canvas_div').attr("onmousedown","javascript:event.preventDefault();WaitForInput();return false;");
	  $('#query_canvas_div').attr("onmouseup","javascript:event.preventDefault();");
	  $('#query_canvas_div').attr("oncontextmenu","javascript:return false;");

	  // Initialize the username:
	  initUserName();
	  
	  // Enable scribble mode:
	  if(scribble_mode) InitializeScribbleMode('label_buttons_drawing',' main_media');
	  
	  // Set action when the user presses a key:
	  document.onkeyup = main_handler.KeyPress;
	  
	  // Collect statistics:
	  ref = document.referrer;

	  // Write "finished" messages:
	  WriteLogMsg('*done_loading_' +  main_media.GetFileInfo().GetImagePath());
	  console.log('LabelMe: finished loading');
  }
  else{
	  WriteLogMsg('*done_loading_last_frame_' +  main_media.GetFileInfo().GetImagePath());
	  console.log('LabelMe: finished loading last frame');	  
  }
}
