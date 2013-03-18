// Created: 10/07/2006
// Updated: 10/19/2006

// handler
// Handles all of the user's actions and delegates tasks to other classes.
// Also keeps track of global information.
var REST_CANVAS = 1;
var DRAW_CANVAS = 2;
var SELECTED_CANVAS = 3;
var QUERY_CANVAS = 4;
function handler() {

  // *******************************************
  // Private variables:
  // *******************************************
  this.active_canvas = REST_CANVAS;
  this.objEnter = '';

  // *******************************************
  // Public methods:
  // *******************************************

  // Handles when the user presses the delete button in response to
  // the "What is this object?" popup bubble.
  this.WhatIsThisObjectDeleteButton = function () {
    WriteLogMsg('*Deleting_object');
    submission_edited = 0;
    old_name = '';
    new_name = '';
    main_canvas.SubmitAnnotations(0);
    this.QueryToRest();
  };

  // Handles when the user presses the undo close button in response to
  // the "What is this object?" popup bubble.
  this.WhatIsThisObjectUndoCloseButton = function () {
    this.active_canvas = DRAW_CANVAS;
    main_query_canvas.MoveToBack();
    var anno = main_query_canvas.DetachAnnotation();
    main_draw_canvas.MoveToFront();
    main_draw_canvas.AttachAnnotation(anno);
  };

  this.DrawCanvasDeleteEvent = function () {
    WriteLogMsg('*Deleting_object');
    submission_edited = 0;
    old_name = '';
    new_name = '';
    main_canvas.SubmitAnnotations(0);
    this.DrawToRest();
  };

  // Submits the object label in response to the edit/delete popup bubble.
  this.SubmitEditLabel = function () {
    var editedControlPoints = main_select_canvas.didEditControlPoints();
    submission_edited = 1;
    anno = main_select_canvas.GetAnnotation();
    old_name = anno.GetObjName();
    if(document.getElementById('objEnter')) new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
    else new_name = RemoveSpecialChars(this.objEnter);
    var re = /[a-zA-Z0-9]/;
    if(!re.test(new_name)) {
      alert('Please enter an object name');
      return;
    }
    anno.SetObjName(new_name);
    main_handler.SelectedToRest();
    var m = main_image.GetFileInfo().GetMode();
    if(view_ObjList) {
      RemoveAnnotationList();
      LoadAnnotationList();
      ChangeLinkColorFG(anno.GetAnnoID());
    }
    main_canvas.SubmitAnnotations(editedControlPoints);
  };

  //mg
  this.SubmitImageAttribute = function() {

    var nn = RemoveSpecialChars(document.getElementById('imageAttribEnter').value);
    var re = /[a-zA-Z0-9]/;
    if(!re.test(nn)) {
      alert('Please enter an object name');
      return;
    }

    submission_edited = 0;
    new_name = nn;
    old_name = new_name;

    CloseImageAttributePopup();

    var newAttrib = new imageAttribute(0);
    newAttrib.SetAttributeName(new_name);
    newAttrib.SetUsername(username);

    main_canvas.AddImageAttribute(newAttrib);

    if(view_ObjList) {
      RemoveAnnotationList();
      LoadAnnotationList();
    }

    //attrib_count++;
    main_canvas.SubmitAnnotations(0);
  }

  //mg
  this.AddImageAttributeDeleteButton = function () {
    CloseImageAttributePopup();
  }

  //mg
  this.ImageAttributeAddClick = function onAddImageAttribute() {
    mkImageAttributePopup(main_image.width_curr / 2, main_image.height_curr / 2, 'image_attribute');
  }

  //mg
  this.ImageAttributeDeleteClick = function(idx) {
    main_canvas.DeleteImageAttribute(idx);

    old_name = '';
    new_name = '';

    if(view_ObjList) {
      RemoveAnnotationList();
      LoadAnnotationList();
    }

    main_canvas.SubmitAnnotations(0);
  }


  // Handles when the user presses the delete button in response to
  // the edit popup bubble.
  this.EditBubbleDeleteButton = function () {
    main_select_canvas.DeleteAnnotation();
  };

  this.EditBubbleAdjustPolygon = function () {
    this.objEnter = document.getElementById('objEnter').value;
    CloseEditPopup();
    main_image.ScrollbarsOn();
    main_select_canvas.AllowAdjustPolygon();
  };

  // Handles when the user presses the zoom "plus" (in) button.  Zooms in on
  // the image by amt percent.
  this.ZoomPlus = function (amt) {
    main_image.Zoom(amt);
  };

  // Handles when the user presses the zoom "minux" (out) button.  Zooms out
  // on the image by amt percent.
  this.ZoomMinus = function (amt) {
    main_image.Zoom(amt);
  };

  // Handles when the user presses on the "Fit Image" link.  The result is
  // that the displayed image fits nicely onto the page (no scrollbars).
  this.ZoomFitImage = function () {
    main_image.Zoom('fitted');
  };

  // Handles when the user clicks on the link for an annotation.
  this.AnnotationLinkClick = function (idx) {
    if(this.active_canvas==REST_CANVAS) main_handler.RestToSelected(idx,null);
    else if(this.active_canvas==SELECTED_CANVAS) {
      var anno_id = main_select_canvas.GetAnnoID();
      if(edit_popup_open && (idx==anno_id)) main_handler.SelectedToRest();
    }
  };

  // Handles when the user moves the mouse over an annotation link.
  this.AnnotationLinkMouseOver = function (a) {
    if(this.active_canvas!=SELECTED_CANVAS) main_canvas.selectObject(a);
  };

  // Handles when the user moves the mouse away from an annotation link.
  this.AnnotationLinkMouseOut = function () {
    if(this.active_canvas!=SELECTED_CANVAS) main_canvas.unselectObjects();
  };

  // Handles when the user moves the mouse over a polygon on the drawing
  // canvas.
  this.CanvasMouseMove = function (event,pp) {
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    if(main_canvas.IsNearPolygon(x,y,pp)) main_canvas.selectObject(pp);
    else main_canvas.unselectObjects();
  };

  // Handles when we wish to change from "rest" to "draw".
  this.RestToDraw = function (event) {
    if(!action_CreatePolygon) {
//       alert('You do not have permission to add new polygons');
      return;
    }
    if(this.active_canvas != REST_CANVAS) return;
    this.active_canvas = DRAW_CANVAS;
    // Get (x,y) mouse click location and button.
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    var button = event.button;

    // If the user does not left click, then ignore mouse-down action.
    if(button>1) return;

    main_draw_canvas.MoveToFront();
    main_draw_canvas.AddAnnotation(x,y,main_canvas.GetAnnotations().length);
  };

  // Handles when the user presses the mouse button down on the drawing
  // canvas.
  this.DrawCanvasMouseDown = function (event) {
    if(this.active_canvas!=DRAW_CANVAS) return;

    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    var button = event.button;

    if(username_flag) submit_username();

    // If right-clicked and can successfully close the polygon.
    if((button>1) && main_draw_canvas.ClosePolygon()) this.DrawToQuery();
    else main_draw_canvas.AddControlPoint(x,y);
  };

  // Handles when we wish to change from "draw" to "query".
  this.DrawToQuery = function () {
    if((object_choices!='...') && (object_choices.length==1)) {
      this.SubmitQuery();
      this.DrawToRest();
      return;
    }
    this.active_canvas = QUERY_CANVAS;
    main_draw_canvas.MoveToBack();
    var anno = main_draw_canvas.DetachAnnotation();
    main_query_canvas.MoveToFront();
    main_query_canvas.AttachAnnotation(anno);
  };

  // Handles when we wish to change from "draw" to "rest".
  this.DrawToRest = function () {
   this.active_canvas = REST_CANVAS;
    main_draw_canvas.MoveToBack();
    main_draw_canvas.DetachAnnotation();
  };

  // Submits the object label in response to the "What is this object?"
  // popup bubble.
  this.SubmitQuery = function () {
    var nn;
    var anno;
    if((object_choices!='...') && (object_choices.length==1)) {
      nn = RemoveSpecialChars(object_choices[0]);
      this.active_canvas = REST_CANVAS;
      main_draw_canvas.MoveToBack();
      var anno = main_draw_canvas.DetachAnnotation();
    }
    else {
      nn = RemoveSpecialChars(document.getElementById('objEnter').value);
      anno = this.QueryToRest();
    }

    var re = /[a-zA-Z0-9]/;
    if(!re.test(nn)) {
      alert('Please enter an object name');
      return;
    }

    submission_edited = 0;
    new_name = nn;
//     new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
    old_name = new_name;

//     var anno = this.QueryToRest();
    anno.SetObjName(new_name);
    anno.SetUsername(username);

    main_canvas.AddAnnotation(anno);
    if(view_ObjList) {
      RemoveAnnotationList();
      LoadAnnotationList();
    }

    anno_count++;
    global_count++;
    main_canvas.SubmitAnnotations(0);
    setCookie('counter',anno_count);
    UpdateCounterHTML();

    var m = main_image.GetFileInfo().GetMode();
    if(m=='mt') {
      document.getElementById('object_name').value=new_name;
      document.getElementById('number_objects').value=global_count;
      document.getElementById('LMurl').value = LMbaseurl + '?collection=LabelMe&mode=i&folder=' + main_image.GetFileInfo().GetDirName() + '&image=' + main_image.GetFileInfo().GetImName();
      if(global_count >= mt_N) document.getElementById('mt_submit').disabled=false;
    }
  };

  // Handles when we wish to change from "query" to "rest".
  this.QueryToRest = function () {
    this.active_canvas = REST_CANVAS;
    main_query_canvas.MoveToBack();
    return main_query_canvas.DetachAnnotation();
  };

  // Handles when we wish to change from "rest" to "selected".
  this.RestToSelected = function (anno_id,event) {
    if(event) event.stopPropagation();
    if((IsUserAnonymous() || (!IsCreator(main_canvas.GetAnnotations()[anno_id].GetUsername()))) && (!IsUserAdmin()) && (anno_id<num_orig_anno) && !action_RenameExistingObjects && !action_ModifyControlExistingObjects && !action_DeleteExistingObjects) {
      PermissionError();
      var anno = main_canvas.DetachAnnotation(anno_id);
      main_canvas.AttachAnnotation(anno);
      return;
    }
    this.active_canvas = SELECTED_CANVAS;
    edit_popup_open = 1;

    // Turn off automatic flag and write to XML file:
    if(main_canvas.GetAnnotations()[anno_id].GetAutomatic()) {
      main_canvas.GetAnnotations()[anno_id].SetAutomatic(0);
      old_name = main_canvas.GetAnnotations()[anno_id].GetObjName();
      new_name = old_name;
      main_canvas.SubmitAnnotations(false);
    }

    main_select_canvas.MoveToFront();
    var anno = main_canvas.DetachAnnotation(anno_id);
//     var m = main_image.GetFileInfo().GetMode();
//     if(!anno.GetVerified() && (m!='im') && (m!='mt')) CreateEditAnnotationForm(anno_id);
    main_select_canvas.AttachAnnotation(anno);
  };

  // Handles when we wish to change from "selected" to "rest".
  this.SelectedToRest = function () {
    this.active_canvas = REST_CANVAS;
    edit_popup_open = 0;
    main_select_canvas.MoveToBack();
    var anno = main_select_canvas.DetachAnnotation();
    main_canvas.AttachAnnotation(anno);
    anno.FillPolygon();
  };

  // Handles when the user presses the mouse button down on the selected
  // canvas.
  this.SelectedCanvasMouseDown = function (event) {
    if(main_select_canvas.isEditingControlPoint || main_select_canvas.isMovingCenterOfMass) {
      this.SelectedCanvasMouseUp(event);
      return;
    }
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    var button = event.button;
    if(username_flag) submit_username();
    main_select_canvas.MouseDown(x,y,button);
  };

  // Handles when the user moves the mouse button over the selected
  // canvas.
  this.SelectedCanvasMouseMove = function (event) {
    if(this.active_canvas==SELECTED_CANVAS) {
      var x = GetEventPosX(event);
      var y = GetEventPosY(event);
      var button = event.button;
      if(username_flag) submit_username();
      main_select_canvas.MouseMove(x,y,button);
    }
  };

  // Handles when the user releases the mouse button on the selected
  // canvas.
  this.SelectedCanvasMouseUp = function (event) {
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    var button = event.button;
    if(username_flag) submit_username();
    main_select_canvas.MouseUp(x,y,button);
  };

  // Handles when the user moves the mouse button over the main page.
  this.MainPageMouseMove = function (event) {
    if(this.active_canvas==SELECTED_CANVAS) {
      var x = event.clientX-document.getElementById('main_section').offsetLeft;
      var y = event.clientY-document.getElementById('main_section').offsetTop;
      var button = event.button;
      if((x<0) || (x>main_image.width_curr) || (y<0) || (y>main_image.height_curr)) {
	main_select_canvas.MouseMove(x,y,button);
      }
    }
  };

  // Handles when the user moves the mouse button over the main page.
  this.MainPageMouseUp = function (event) {
    if(this.active_canvas==SELECTED_CANVAS) {
      var x = event.clientX-document.getElementById('main_section').offsetLeft;
      var y = event.clientY-document.getElementById('main_section').offsetTop;
      var button = event.button;
      if((x<0) || (x>main_image.width_curr) || (y<0) || (y>main_image.height_curr)) {
	main_select_canvas.MouseUp(x,y,button);
      }
    }
  };

  // Handles when the user presses a key while interacting with the tool.
  this.KeyPress = function (event) {
    // Delete event: 46 - delete key; 8 - backspace key
    if(((event.keyCode==46) || (event.keyCode==8)) && !wait_for_input && !edit_popup_open && !username_flag) {
      // Determine whether we are deleting a complete or partially
      // complete polygon.
      if(!this.EraseSegment()) main_canvas.DeleteSelectedPolygon();
    }
    // 27 - Esc key
    // Close edit popup if it is open.
    if(event.keyCode==27 && edit_popup_open) main_handler.SelectedToRest();
  };

  // Handles when the user clicks on the "Erase Segment" button.
  this.EraseSegmentButton = function () {
    this.EraseSegment();
  };

  // Handles when the user erases a segment.
  this.EraseSegment = function () {
    var anno = main_draw_canvas.GetAnnotation();
    if(anno && !anno.DeleteLastControlPoint()) this.DrawCanvasDeleteEvent();
    return anno;
  };

  // Handles when the user mouses over the first control point.
  this.MousedOverFirstControlPoint = function () {
    main_draw_canvas.GetAnnotation().MouseOverFirstPoint();
  };

  // Handles when the user mouses away from the first control point.
  this.MousedOutFirstControlPoint = function () {
    if(this.active_canvas!=DRAW_CANVAS) return;
    main_draw_canvas.GetAnnotation().MouseOutFirstPoint();
  };

  // *******************************************
  // Private methods:
  // *******************************************

}
