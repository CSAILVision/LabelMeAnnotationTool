/** @file This file contains the scripts for when the edit event is activated. */


var select_anno = null;
var adjust_event = null;

/**
  * This function is called with the edit event is started.  It can be
  * triggered when the user (1) clicks a polygon, (2) clicks the object in
  * the object list, (3) deletes a verified polygon.
  * @param {int} anno_id - the id of the annotation being edited

*/
function StartEditEvent(anno_id,event) {
  console.log('LabelMe: Starting edit event...');
  if(event) event.stopPropagation();
  if((IsUserAnonymous() || (!IsCreator(LMgetObjectField(LM_xml, anno_id, 'username')))) && (!IsUserAdmin()) && (anno_id<num_orig_anno) && !action_RenameExistingObjects && !action_ModifyControlExistingObjects && !action_DeleteExistingObjects) {
    PermissionError();
    return;
  }
  active_canvas = SELECTED_CANVAS;
  edit_popup_open = 1;
  
  // Turn off automatic flag and write to XML file:
  if(LMgetObjectField(LM_xml, anno_id, 'automatic')) {
    // Insert data for server logfile:
    old_name = LMgetObjectField(LM_xml,AllAnnotations[anno_id].anno_id,'name');
    new_name = old_name;
    InsertServerLogData('cpts_not_modified');
    
    // Set <automatic> in XML:
    $(LM_xml).children("annotation").children("object").eq(anno_id).children("automatic").text('0');
    
    // Write XML to server:
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
  }
  
  // Move select_canvas to front:
  $('#select_canvas').css('z-index','0');
  $('#select_canvas_div').css('z-index','0');
  
  var anno = main_canvas.DetachAnnotation(anno_id);
  
  editedControlPoints = 0;
    
  if(username_flag) submit_username();
  
  select_anno = anno;
  select_anno.SetDivAttach('select_canvas');
  FillPolygon(select_anno.DrawPolygon(main_media.GetImRatio()));
  
  // Get location where popup bubble will appear:
  var pt = main_media.SlideWindow(Math.round(anno.GetPtsX()[0]*main_media.GetImRatio()),Math.round(anno.GetPtsY()[0]*main_media.GetImRatio()));

  // Make edit popup appear.
  main_media.ScrollbarsOff();
  if(LMgetObjectField(LM_xml, anno, 'verified')) {
    edit_popup_open = 1;
    var innerHTML = "<b>This annotation has been blocked.</b><br />";
    var dom_bubble = CreatePopupBubble(pt[0],pt[1],innerHTML,'main_section');
    CreatePopupBubbleCloseButton(dom_bubble,StopEditEvent);
  }
  else {
    // Set object list choices for points and lines:
    var doReset = SetObjectChoicesPointLine(anno.GetPtsX().length);
    
    // Popup edit bubble:
    WriteLogMsg('*Opened_Edit_Popup');
    mkEditPopup(pt[0],pt[1],anno);
    
    // If annotation is point or line, then 
    if(doReset) object_choices = '...';
  }
}

/** This function is called when the edit event is finished.  It can be
 * triggered when the user (1) clicks the close edit bubble button, 
 * (2) zooms, (3) submits an object label in the popup bubble, 
 * (4) presses the delete button in the popup bubble, (5) clicks the 
 * object in the object list, (6) presses the ESC key.
 */
function StopEditEvent() {
  // Update the global variables for the active canvas and edit popup bubble:

  active_canvas = REST_CANVAS;
  edit_popup_open = 0;
  // Move select_canvas to back:
  $('#select_canvas').css('z-index','-2');
  $('#select_canvas_div').css('z-index','-2');
  
  // Remove polygon from the select canvas:
  if (!video_mode) select_anno.DeletePolygon();
  else $('#'+select_anno.polygon_id).remove();
  var anno = select_anno;
  select_anno = null;

  // Write logfile message:
  WriteLogMsg('*Closed_Edit_Popup');

  // Close the edit popup bubble:
  CloseEditPopup();
  // Turn on the image scrollbars:
  main_media.ScrollbarsOn();

  // If the annotation is not deleted or we are in "view deleted" mode, 
  // then attach the annotation to the main_canvas:
  if(!LMgetObjectField(LM_xml, anno.anno_id, 'deleted') || view_Deleted) {
    if (!video_mode){
      main_canvas.AttachAnnotation(anno);
      if(!anno.hidden) {
        anno.RenderAnnotation('rest');
      }
    }
    else {
      oVP.DisplayFrame(oVP.getcurrentFrame());
    }
  }

  // Render the object list:
  if(view_ObjList) {
    if (!video_mode) RenderObjectList();
  }

  console.log('LabelMe: Stopped edit event.');
}

var adjust_objEnter = '';
var adjust_attributes;
var adjust_occluded;

/** This function is called when the user clicks 'Adjust Polygon' button */
function AdjustPolygonButton() {
  // We need to capture the data before closing the bubble 
  // (THIS IS AN UGLY HACK)
  
  // Get annotation on the select canvas:
  var anno = select_anno;

  // object name
  old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
  if(document.getElementById('objEnter')) new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
  else new_name = RemoveSpecialChars(adjust_objEnter);
  
  var re = /[a-zA-Z0-9]/;
  if(!re.test(new_name)) {
    alert('Please enter an object name');
    return;
  }
  adjust_objEnter = document.getElementById('objEnter').value;
  adjust_attributes = document.getElementById('attributes').value;
  adjust_occluded = document.getElementById('occluded').value;
  
  // Close the edit popup bubble:
  CloseEditPopup();

  // Turn on image scrollbars:
  main_media.ScrollbarsOn();
  
  

  // Remove polygon from canvas:
  $('#'+anno.polygon_id).remove();

  // Set to polygon drawing mode:
  SetDrawingMode(0);

  // Create adjust event:
  adjust_event = new AdjustEvent('select_canvas',anno.pts_x,anno.pts_y,LMgetObjectField(LM_xml,anno.anno_id,'name'),function(x,y,_editedControlPoints) {
      // Submit username:
      if(username_flag) submit_username();

      // Redraw polygon:
      anno.DrawPolygon(main_media.GetImRatio());

      // Set polygon (x,y) points:
      anno.pts_x = x;
      anno.pts_y = y;

      // Set global variable whether the control points have been edited:
      editedControlPoints = _editedControlPoints;
      
      // Submit annotation:
      if (video_mode) main_media.SubmitEditObject();
      else main_handler.SubmitEditLabel();
    },main_media.GetImRatio());

  // Start adjust event:
  adjust_event.StartEvent();
}

/**
  * Mirror function of StartEditEvent for video
  * It creates an aux annotation so that the code is compliant
  * @param {int} anno_id - the id of the annotation being edited
  * @param {string} polygon_id - the id of the html polygon element

*/
function StartEditVideoEvent(polygon_id, anno_id,event) {

  object_annotation = new annotation(anno_id);
  var obj = $(LM_xml).children("annotation").children("object").eq(anno_id);
  var framestamps = (obj.children("polygon").children("t").text());
  framestamps = framestamps.split(',');
  for(var ti=0; ti<framestamps.length; ti++) { framestamps[ti] = parseInt(framestamps[ti], 10); } 
  var objectind = framestamps.indexOf(oVP.getcurrentFrame());
  var x_pts = (((obj.children("polygon").children("x").text()).split(';'))[objectind]).split(',');
  var y_pts = (((obj.children("polygon").children("y").text()).split(';'))[objectind]).split(',');
  for(var ti=0; ti<x_pts.length; ti++) { 
    x_pts[ti] = parseInt(x_pts[ti], 10);
    y_pts[ti] = parseInt(y_pts[ti], 10); 
  } 
  object_annotation.pts_x = x_pts;
  object_annotation.pts_y = y_pts;
  object_annotation.polygon_id = polygon_id;
  console.log('LabelMe: Starting edit event...');
  if(event) event.stopPropagation();
  if((IsUserAnonymous() || (!IsCreator(LMgetObjectField(LM_xml, anno_id, 'username')))) && (!IsUserAdmin()) && (anno_id<num_orig_anno) && !action_RenameExistingObjects && !action_ModifyControlExistingObjects && !action_DeleteExistingObjects) {
    PermissionError();
    return;
  }
  active_canvas = SELECTED_CANVAS;
  edit_popup_open = 1;
  
  // Turn off automatic flag and write to XML file:
  if(LMgetObjectField(LM_xml, anno_id, 'automatic')) {
    // Insert data for server logfile:
    old_name = LMgetObjectField(LM_xml,object_annotation.anno_id,'name');
    new_name = old_name;
    
  }
  
  // Move select_canvas to front:
  $('#select_canvas').css('z-index','0');
  $('#select_canvas_div').css('z-index','0');
  
  
  editedControlPoints = 0;
  
  if(username_flag) submit_username();
  select_anno = object_annotation;

  FillPolygon(anno_id);
  var pt = main_media.SlideWindow(Math.round(object_annotation.GetPtsX()[0]*main_media.GetImRatio()),Math.round(object_annotation.GetPtsY()[0]*main_media.GetImRatio()));
  main_media.ScrollbarsOff();
  if(LMgetObjectField(LM_xml, object_annotation.anno_id, 'verified')) {
    edit_popup_open = 1;
    var innerHTML = "<b>This annotation has been blocked.</b><br />";
    var dom_bubble = CreatePopupBubble(pt[0],pt[1],innerHTML,'main_section');
    CreatePopupBubbleCloseButton(dom_bubble,StopEditEvent);
  }
  else {
    // Set object list choices for points and lines:
    var doReset = SetObjectChoicesPointLine(object_annotation.GetPtsX().length);
    
    // Popup edit bubble:
    mkEditPopup(pt[0],pt[1],object_annotation);
    
    // If annotation is point or line, then 
    if(doReset) object_choices = '...';
  }
}
