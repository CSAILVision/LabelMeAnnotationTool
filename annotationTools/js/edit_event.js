// This file contains the scripts for when the edit event is activated.

// This function is called with the edit event is started.  It can be 
// triggered when the user (1) clicks a polygon, (2) clicks the object in
// the object list, (3) deletes a verified polygon.
function StartEditEvent(anno_id,event) {
  console.log('LabelMe: Starting edit event...');
  if(event) event.stopPropagation();
  if((IsUserAnonymous() || (!IsCreator(AllAnnotations[anno_id].GetUsername()))) && (!IsUserAdmin()) && (anno_id<num_orig_anno) && !action_RenameExistingObjects && !action_ModifyControlExistingObjects && !action_DeleteExistingObjects) {
    PermissionError();
    return;
  }
  active_canvas = SELECTED_CANVAS;
  edit_popup_open = 1;
  
  // Turn off automatic flag and write to XML file:
  if(AllAnnotations[anno_id].GetAutomatic()) {
    // Insert data for server logfile:
    old_name = AllAnnotations[anno_id].GetObjName();
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
  
  // Attach the annotation to the canvas:
  main_select_canvas.AttachAnnotation(anno,'filled_polygon');
  
  // Render the annotation:
  main_select_canvas.RenderAnnotations();
  
  // Make edit popup appear.
  var pt = anno.GetPopupPoint();
  pt = main_image.SlideWindow(pt[0],pt[1]);
  main_image.ScrollbarsOff();
  if(anno.GetVerified()) mkVerifiedPopup(pt[0],pt[1]);
  else {
    // Set object list choices for points and lines:
    var doReset = SetObjectChoicesPointLine(anno);
    
    // Popup edit bubble:
    WriteLogMsg('*Opened_Edit_Popup');
    mkEditPopup(pt[0],pt[1],anno);
    
    // If annotation is point or line, then 
    if(doReset) object_choices = '...';
    
    main_image.SlideWindow(anno.center_x,anno.center_y);
  }
}

// This function is called when the edit event is finished.  It can be
// triggered when the user (1) clicks the close edit bubble button, 
// (2) zooms, (3) submits an object label in the popup bubble, 
// (4) presses the delete button in the popup bubble, (5) clicks the 
// object in the object list, (6) presses the ESC key.
function StopEditEvent() {
  active_canvas = REST_CANVAS;
  edit_popup_open = 0;
  
  // Move select_canvas to back:
  $('#select_canvas').css('z-index','-2');
  $('#select_canvas_div').css('z-index','-2');
  
  var anno = main_select_canvas.DetachAnnotation();
  
  WriteLogMsg('*Closed_Edit_Popup');
  CloseEditPopup();
  main_image.ScrollbarsOn();
  
  if(!anno.GetDeleted()||view_Deleted) {
    main_canvas.AttachAnnotation(anno,'polygon');
    main_canvas.RenderAnnotations();
  }
  console.log('LabelMe: Stopped edit event.');
}
