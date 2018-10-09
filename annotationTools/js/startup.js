/** @file This file contains the scripts used when LabelMe starts up. */

/** Main entry point for the annotation tool. */
function StartupLabelMe() {
  console.time('startup');

  // Check browser:
  GetBrowserInfo();

  if(IsNetscape() || (IsMicrosoft() && (bversion>=4.5)) || IsSafari() || IsChrome()) {

    if (IsNetscape()){
      $('#label_buttons_contrast').css('left', '545px');
    }
    if (IsSafari()){
      $('#label_buttons_contrast').css('left', '525px');
    }
    // Write "start up" messages:
    WriteLogMsg('*start_loading');
    console.log('LabelMe: starting up...');
    
    // Initialize global variables:
    main_handler = new handler();
    main_canvas = new canvas('myCanvas_bg');
    main_media = new image('imcanvas');
    // Parse the input URL.  Returns false if the URL does not set the 
    // annotation folder or image filename.  If false is returned, the 
    // function fetches a new image and sets the URL to reflect the 
    // fetched image.
    if(!main_media.GetFileInfo().ParseURL()) return;

    if(video_mode) {
      $('#generic_buttons').remove();
      $.getScript("annotationTools/js/video.js", function(){
        main_media = new video('videoplayer');
        main_media.GetFileInfo().ParseURL();
        console.log("Video mode...");
        
        function main_media_onload_helper(){
          var anno_file = main_media.GetFileInfo().GetFullName();
          anno_file = 'VLMAnnotations/' + anno_file + '.xml' + '?' + Math.random();
          ReadXML(anno_file,LoadAnnotationSuccess,LoadAnnotation404);
        }
        main_media.GetNewVideo(main_media_onload_helper);
      });
    }
    else if (threed_mode){
      // 3D Code Starts here
    }
    else {
      // This function gets run after image is loaded:
      function main_media_onload_helper() {
          // Set the image dimensions:
          console.log('Imageloaded')
          main_media.SetImageDimensions();
              
          // Read the XML annotation file:
          var anno_file = main_media.GetFileInfo().GetFullName();
          anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
          ReadXML(anno_file,LoadAnnotationSuccess,LoadAnnotation404);
          main_media.GetFileInfo().PreFetchImage();

          $("#imcanvas").show();
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
function LoadNewMedia(){
	
      main_canvas = new canvas('myCanvas_bg');
      function main_media_onload_helper() {
	      // Set the image dimensions:
	       main_media.SetImageDimensions();

	      // Read the XML annotation file:
	      var anno_file = main_media.GetFileInfo().GetFullName();
	      anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
	      ReadXML(anno_file,LoadAnnotationSuccess,LoadAnnotation404);
	      main_media.Zoom('fitted');
	      main_media.GetFileInfo().PreFetchImage();
          };

      // Get the image:
      main_media.GetNewImage(main_media_onload_helper);
}
/** This function gets called if the annotation has been successfully loaded.
  * @param {string} xml - the xml regarding the current file
*/
function LoadAnnotationSuccess(xml) {
  
  console.time('load success');

  // Set global variable:
  LM_xml = xml;

  // Set AllAnnotations array:
  SetAllAnnotationsArray();

  console.time('attach main_canvas');
  // Attach valid annotations to the main_canvas:
  for(var pp = 0; pp < LMnumberOfObjects(LM_xml); pp++) {
    var isDeleted = LMgetObjectField(LM_xml, pp, 'deleted');
    if((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted)) {
      // Attach to main_canvas:
      main_canvas.AttachAnnotation(new annotation(pp));
      if (!video_mode && LMgetObjectField(LM_xml, pp, 'x') == null){
        main_canvas.annotations[main_canvas.annotations.length -1].SetType(1);
        main_canvas.annotations[main_canvas.annotations.length -1].scribble = new scribble(pp);
      }
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

/** Sets AllAnnotations array from LM_xml */
function SetAllAnnotationsArray() {
  var obj_elts = LM_xml.getElementsByTagName("object");
  var num_obj = obj_elts.length;
  
  num_orig_anno = num_obj;

  console.time('initialize XML');
  // Initialize any empty tags in the XML file:
  for(var pp = 0; pp < num_obj; pp++) {
    var curr_obj = $(LM_xml).children("annotation").children("object").eq(pp);

    // Initialize object name if empty in the XML file:
    if(curr_obj.children("name").length == 0) LMsetObjectField(LM_xml, pp, "name","");

    // Set object IDs:
    LMsetObjectField(LM_xml, pp, "id", pp.toString());


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
  
  console.timeEnd('loop annotated');
}

/** Annotation file does not exist, so load template. */
function LoadAnnotation404(jqXHR,textStatus,errorThrown) {
  if(jqXHR.status==404) 
    ReadXML(main_media.GetFileInfo().GetTemplatePath(),LoadTemplateSuccess,LoadTemplate404);
  else if (jqXHR.status == 200){
    var resp = jqXHR.responseText;
    var NOT_SAFE_IN_XML_1_0 = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;
    resp =resp.replace(/[\u001a]/gm,'');
    resp = resp.replace(NOT_SAFE_IN_XML_1_0,'');
    LoadAnnotationSuccess(jQuery.parseXML(resp));
  }
  else 
    alert(jqXHR.status);
}

/** Annotation template does not exist for this folder, so load default */
function LoadTemplate404(jqXHR,textStatus,errorThrown) {
  if(jqXHR.status==404)
    ReadXML('annotationCache/XMLTemplates/labelme.xml',LoadTemplateSuccess,function(jqXHR) {
  alert(jqXHR.status);
      });
  else
    alert(jqXHR.status);
}

/** Actions after template load success 
  * @param {string} xml - the xml regarding the current file
*/
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

/** Finish the startup process: */
function FinishStartup() {
  // Load the annotation list on the right side of the page:
  if(view_ObjList) RenderObjectList();
  if (loaded_once) return; 
  loaded_once = true;
  // Add actions:
  console.log('LabelMe: setting actions');
  if($('#img_url')){
    if (!video_mode) $('#img_url').attr('onclick','javascript:location.href=main_media.GetFileInfo().GetImagePath();');
    else $('#img_url').attr('onclick','javascript:location.href=main_media.GetFileInfo().GetVideoPath();');
  } 
  $('#changeuser').attr("onclick","javascript:show_enterUserNameDIV(); return false;");
  $('#userEnter').attr("onkeyup","javascript:var c; if(event.keyCode)c=event.keyCode; if(event.which)c=event.which; if(c==13 || c==27) changeAndDisplayUserName(c);");
  $('#xml_url').attr("onclick","javascript:GetXMLFile();");
  $('#prevImage').attr("onclick","javascript:ShowPrevImage()");
  $('#nextImage').attr("onclick","javascript:ShowNextImage()");
  $('#lessContrast').attr("onclick","javascript:main_media.AugmentContrast()");
  $('#moreContrast').attr("onclick","javascript:main_media.ReduceContrast()");
  if (video_mode){
    $('#nextImage').attr("title", "Next Video");
    $('#img_url').attr("title", "Download Video");
  } 
  $('#zoomin').attr("onclick","javascript:main_media.Zoom(1.15)");
  $('#zoomout').attr("onclick","javascript:main_media.Zoom(1.0/1.15)");
  $('#fit').attr("onclick","javascript:main_media.Zoom('fitted')");
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

  InitializeAnnotationTools('label_buttons_drawing','main_media');
  
  // Set action when the user presses a key:
  document.onkeyup = main_handler.KeyPress;
  
  // Collect statistics:
  ref = document.referrer;

  // Write "finished" messages:
  WriteLogMsg('*done_loading_' + main_media.GetFileInfo().GetImagePath());
  console.log('LabelMe: finished loading');

  console.timeEnd('startup');
}

// Initialize the segmentation tool. This function is called when the field 
// scribble of the url is true
function InitializeAnnotationTools(tag_button, tag_canvas){

    if (scribble_mode){
	 scribble_canvas = new Scribble_canvas(tag_canvas);
    }
    var html_str = '<div id= "polygonDiv" class="annotatemenu">Polygon<br></br>Tool \
        <button id="polygon" class="labelBtnDraw" type="button" title="Start Polygon" onclick="SetPolygonDrawingMode(false)" > \
        <img id="polygonModeImg" src="Icons/polygon.png"  width="28" height="38" /> \
        </button> \
        <button id="erase" class="labelBtnDraw" type="button" title="Delete last segment" onclick="main_handler.EraseSegment()" > \
        <img src="Icons/erase.png"  width="28" height="38" /> \
        </button> ';
        if (bbox_mode) html_str += ' <button id="bounding_box" class="labelBtnDraw" type="button" title="Start bounding box" onclick="SetPolygonDrawingMode(true)" > \
        <img src="Icons/bounding.png"  width="28" height="38" /> \
        </button> ';
    html_str += '</div>';

    if (!video_mode){
      html_str += '<div id= "segmDiv" class="annotatemenu">Mask<br></br>Tool \
        <button id="ScribbleObj" class="labelBtnDraw" type="button" title="Use the red pencil to mark areas inside the object you want to segment" onclick="scribble_canvas.setCurrentDraw(OBJECT_DRAWING)" > \
        <img src="Icons/object.png" width="28" height="38" /></button> \
        <button id="ScribbleBg" class="labelBtnDraw" type="button" title="Use the blue pencil to mark areas outside the object" onclick="scribble_canvas.setCurrentDraw(BG_DRAWING)" > \
        <img src="Icons/background.png" width="28" height="38" /></button> \
        <button id="ScribbleRubber" class="labelBtnDraw" type="button" title="ScribbleRubber" onclick="scribble_canvas.setCurrentDraw(RUBBER_DRAWING)" > \
        <img src="Icons/erase.png" width="28" height="38" /> \
        </button><input type="button" class="segbut"  id="donebtn" value="Done" title="Press this button after you are done with the scribbling." onclick="scribble_canvas.segmentImage(1)"/> \
        <p> </p><div id="loadspinner" style="display: none;"><img src="Icons/segment_loader.gif"/> </div></div>';
     

      var html_str2 = '<button xmlns="http://www.w3.org/1999/xhtml" id="img_url" class="labelBtn" type="button" title="Download Pack" onclick="javascript:GetPackFile();"> \
          <img src="Icons/download_all.png" height="30" /> \
          </button>';

      var html_str3 = '<form action="annotationTools/php/getpackfile.php" method="post" id="packform"> \
          <input type="hidden" id= "folder" name="folder" value="provesfinal" /> \
          <input type="hidden" id= "name" name="name" value="img2.jpg" /> \
         </form>';

      $('#tool_buttons').append(html_str3);
      $('#help').before(html_str2); 
    }
    $('#'+tag_button).append(html_str);  
    if (document.getElementById("polygon")) document.getElementById("polygon").setAttribute('style', 'background-color: #faa');
    if (document.getElementById("segmDiv")){
      document.getElementById("segmDiv").setAttribute('style', 'opacity: 1');
      document.getElementById("segmDiv").setAttribute('style', 'border-color: #000');
    }
    if (document.getElementById("polygonDiv")){
      document.getElementById("polygonDiv").setAttribute('style', 'opacity: 1');
      document.getElementById("polygonDiv").setAttribute('style', 'border-color: #f00');
    }
    if (video_mode) SetPolygonDrawingMode(true);
    
}

// Switch between polygon and scribble mode. If a polygon is open or the user 
// is in the middle of the segmentation an alert appears to indicate so.
function SetDrawingMode(mode){
    if (drawing_mode == mode || active_canvas == QUERY_CANVAS) return;
    if (mode == 0){
        if (scribble_canvas.annotationid != -1){
            alert("You can't change drawing mode while editting scribbles.");
            return;
        }

        document.getElementById("segmDiv").setAttribute('style', 'border-color: #000');
        document.getElementById("polygonDiv").setAttribute('style', 'border-color: #f00');
        scribble_canvas.scribble_image = "";
        scribble_canvas.cleanscribbles();
        scribble_canvas.CloseCanvas();
    }
    if (mode == 1) {
        if(draw_anno) {
        alert("Need to close current polygon first.");
        return;
    }
    
    document.getElementById("segmDiv").setAttribute('style', 'border-color: #f00');
    document.getElementById("polygonDiv").setAttribute('style', 'border-color: #000');
    scribble_canvas.startSegmentationMode();
    }
    drawing_mode = mode;
}

function SetPolygonDrawingMode(bounding){
  if (active_canvas == QUERY_CANVAS) return;
  if(draw_anno) {
      alert("Need to close current polygon first.");
      return;
  }
  var buttons = document.getElementsByClassName("labelBtnDraw");
  for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('style', 'background-color: #fff');
  if (!bounding) document.getElementById("polygon").setAttribute('style', 'background-color: #faa');
  else document.getElementById("bounding_box").setAttribute('style', 'background-color: #faa');
  bounding_box = bounding;
  SetDrawingMode(0);
}
