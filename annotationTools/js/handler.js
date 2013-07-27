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
        //     // Write to logfile:
        //     WriteLogMsg('*Deleted_object_during_labeling');
        
        submission_edited = 0;
        
        //     old_name = '';
        //     new_name = '';
        //     SubmitAnnotations(0);
        
        this.QueryToRest();
    };
    
    // Handles when the user presses the undo close button in response to
    // the "What is this object?" popup bubble.
    this.WhatIsThisObjectUndoCloseButton = function () {
        this.active_canvas = DRAW_CANVAS;

	// Move query canvas to the back:
	document.getElementById('query_canvas').style.zIndex = -2;
	document.getElementById('query_canvas_div').style.zIndex = -2;

        var anno = main_query_canvas.DetachAnnotation();

	CloseQueryPopup();
	main_image.ScrollbarsOn();
	
	// Move select_canvas to front:
	document.getElementById('select_canvas').style.zIndex = 0;
	document.getElementById('select_canvas_div').style.zIndex = 0;

	// Attach the annotation:
        main_draw_canvas.AttachAnnotation(anno,'polyline');

	// Render the annotation:
	main_draw_canvas.RenderAnnotations();
    };
    
    // Submits the object label in response to the edit/delete popup bubble.
    this.SubmitEditLabel = function () {
        submission_edited = 1;
        anno = main_select_canvas.Peek();
        
        // object name
        old_name = anno.GetObjName();
        if(document.getElementById('objEnter'))
        {new_name = RemoveSpecialChars(document.getElementById('objEnter').value);}
        else
        {new_name = RemoveSpecialChars(this.objEnter);}
        
        var re = /[a-zA-Z0-9]/;
        if(!re.test(new_name)) {
            alert('Please enter an object name');
            return;
        }
        
        if (use_attributes) {
            // occlusion field
            if (document.getElementById('occluded')) {
                new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
            }
            else {
                new_occluded = RemoveSpecialChars(this.occluded);
            }
            
            // attributes field
            if(document.getElementById('attributes')) {
                new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
            }
            else {
                new_attributes = RemoveSpecialChars(this.attributes);
            }
        }
        
        main_handler.SelectedToRest();
        
        // Insert data to write to logfile:
        if(editedControlPoints) {
            InsertServerLogData('cpts_modified');
        }
        else {
            InsertServerLogData('cpts_not_modified');
        }
        
        // Object index:
        var obj_ndx = anno.anno_id;
        
        // Pointer to object:
        var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_ndx);
        
        // Set fields:
        curr_obj.children("name").text(new_name);
        if(curr_obj.children("automatic").length > 0) {
            curr_obj.children("automatic").text("0");
        }
        
        // Insert attributes (and create field if it is not there):
        if(curr_obj.children("attributes").length>0) {
            curr_obj.children("attributes").text(new_attributes);
        }
        else {
            curr_obj.append("<attributes>" + new_attributes + "</attributes>");
        }
        
        if(curr_obj.children("occluded").length>0) {
            curr_obj.children("occluded").text(new_occluded);
        }
        else {
            curr_obj.append("<occluded>" + new_occluded + "</occluded>");
        }
        
        //if (!curr_obj.children("parts").length>0) {
        //    curr_obj.append("<parts><hasparts></hasparts><ispartof></ispartof></parts>");
        //}

        
        if(editedControlPoints) {
            for(var jj=0; jj < AllAnnotations[obj_ndx].GetPtsX().length; jj++) {
                curr_obj.children("polygon").children("pt").eq(jj).children("x").text(AllAnnotations[obj_ndx].GetPtsX()[jj]);
                curr_obj.children("polygon").children("pt").eq(jj).children("y").text(AllAnnotations[obj_ndx].GetPtsY()[jj]);
            }
        }
        
        // Write XML to server:
        WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
        
        
        //     SubmitAnnotations(editedControlPoints);
        
        if(view_ObjList) {
            RemoveAnnotationList();
            LoadAnnotationList();
            ChangeLinkColorFG(anno.GetAnnoID());
        }
    };
    
    
    
    // Handles when the user presses the delete button in response to
    // the edit popup bubble.
    this.EditBubbleDeleteButton = function () {
        var idx = main_select_canvas.Peek().GetAnnoID();
        //     if(IsUserAnonymous() && (idx<num_orig_anno)) {
        if((IsUserAnonymous() || (!IsCreator(main_select_canvas.Peek().GetUsername()))) && (!IsUserAdmin()) && (idx<num_orig_anno) && !action_DeleteExistingObjects) {
            alert('You do not have permission to delete this polygon');
            return;
        }
        
        //     main_select_canvas.Peek().SetDeleted(1);
        
        if(idx>=num_orig_anno) {
            anno_count--;
            global_count--;
            setCookie('counter',anno_count);
            UpdateCounterHTML();
        }
        
        submission_edited = 0;
        
        // Insert data for server logfile:
        old_name = main_select_canvas.Peek().GetObjName();
        new_name = main_select_canvas.Peek().GetObjName();
        WriteLogMsg('*Deleting_object');
        InsertServerLogData('cpts_not_modified');
        
        // Set <deleted> in LM_xml:
        $(LM_xml).children("annotation").children("object").eq(idx).children("deleted").text('1');
        
        // Remove all the part dependencies for the deleted object
        removeAllParts(idx);
        
        // Write XML to server:
        WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
        
        //     SubmitAnnotations(0);
        
        if(view_ObjList) {
            RemoveAnnotationList();
            LoadAnnotationList();
        }
        
        unselectObjects(); // Perhaps this should go elsewhere...
        main_handler.SelectedToRest();
    };
    
    
    
    // ADJUST POLYGON,
    this.EditBubbleAdjustPolygon = function () {
      // we need to capture the data before closing the bubble (THIS IS AN UGLY HACK)
      this.objEnter = document.getElementById('objEnter').value;
      this.attributes = document.getElementById('attributes').value;
      this.occluded = document.getElementById('occluded').value;
      
      CloseEditPopup();
      main_image.ScrollbarsOn();

      // Get annotation on the select canvas:
      var anno = main_select_canvas.Peek();

      // Show control points:
      anno.ShowControlPoints();
      anno.ShowCenterOfMass(main_image.GetImRatio());
    };
    
    // Handles when the user clicks on the link for an annotation.
    this.AnnotationLinkClick = function (idx) {
      if(this.active_canvas==REST_CANVAS) main_handler.RestToSelected(idx,null);
      else if(this.active_canvas==SELECTED_CANVAS) {
	var anno_id = main_select_canvas.Peek().GetAnnoID();
	if(edit_popup_open && (idx==anno_id)) main_handler.SelectedToRest();
      }
    };
    
    // Handles when the user moves the mouse over an annotation link.
    this.AnnotationLinkMouseOver = function (a) {
        if(this.active_canvas!=SELECTED_CANVAS) selectObject(a);
    };
    
    // Handles when the user moves the mouse away from an annotation link.
    this.AnnotationLinkMouseOut = function () {
        if(this.active_canvas!=SELECTED_CANVAS) unselectObjects();
    };
    
    // Handles when the user moves the mouse over a polygon on the drawing
    // canvas.
    this.CanvasMouseMove = function (event,pp) {
        var x = GetEventPosX(event);
        var y = GetEventPosY(event);
        if(IsNearPolygon(x,y,pp)) selectObject(pp);
        else unselectObjects();
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
      
      // Move draw canvas to front:
      document.getElementById('draw_canvas').style.zIndex = 0;
      document.getElementById('draw_canvas_div').style.zIndex = 0;
      
      if(username_flag) submit_username();
      
      // Create new annotation structure:
      var anno = new annotation(AllAnnotations.length);

      // Add first control point:
      anno.AddFirstControlPoint(x,y);

      // Attach the annotation to the draw canvas:
      main_draw_canvas.AttachAnnotation(anno,'polyline');

      // Render the annotation:
      main_draw_canvas.RenderAnnotations();
      
      WriteLogMsg('*start_polygon');

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
        if((button>1) && main_draw_canvas.Peek().ClosePolygon()) this.DrawToQuery();
        else main_draw_canvas.Peek().AddControlPoint(x,y);
    };
    
    // Handles when we wish to change from "draw" to "query".
    this.DrawToQuery = function () {
        if((object_choices!='...') && (object_choices.length==1)) {
            this.SubmitQuery();
            this.DrawToRest();
            return;
        }
        this.active_canvas = QUERY_CANVAS;

	// Move draw canvas to the back:
	document.getElementById('draw_canvas').style.zIndex = -2;
	document.getElementById('draw_canvas_div').style.zIndex = -2;

        var anno = main_draw_canvas.DetachAnnotation();

	// Move query canvas to front:
	document.getElementById('query_canvas').style.zIndex = 0;
	document.getElementById('query_canvas_div').style.zIndex = 0;

	// Set object list choices for points and lines:
	var doReset = SetObjectChoicesPointLine(anno);

	// Make query popup appear.
	var pt = anno.GetPopupPoint();
	pt = main_image.SlideWindow(pt[0],pt[1]);
	main_image.ScrollbarsOff();
	WriteLogMsg('*What_is_this_object_query');
	mkPopup(pt[0],pt[1]);
	
	// If annotation is point or line, then 
	if(doReset) object_choices = '...';

	// Attach the annotation to the canvas:
        main_query_canvas.AttachAnnotation(anno,'filled_polygon');

	// Render the annotation:
        main_query_canvas.RenderAnnotations();
    };
    
    // Handles when we wish to change from "draw" to "rest".
    this.DrawToRest = function () {
        this.active_canvas = REST_CANVAS;

	// Move draw canvas to the back:
	document.getElementById('draw_canvas').style.zIndex = -2;
	document.getElementById('draw_canvas_div').style.zIndex = -2;

        main_draw_canvas.DetachAnnotation();
    };
    
    // Submits the object label in response to the "What is this object?"
    // popup bubble. THIS FUNCTION IS A MESS!!!!
    this.SubmitQuery = function () {
        var nn;
        var anno;
        
        // If the attributes are active, read the fields.
        if (use_attributes) {
            // get attributes (is the field exists)
            if(document.getElementById('attributes')) {
                new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
            }else{
                new_attributes = "";
            }
            
            // get occlusion field (is the field exists)
            if (document.getElementById('occluded')) {
                new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
            }else{
                new_occluded = "";
            }
        }
        
        if((object_choices!='...') && (object_choices.length==1)) {
            nn = RemoveSpecialChars(object_choices[0]);
            this.active_canvas = REST_CANVAS;

	    // Move draw canvas to the back:
	    document.getElementById('draw_canvas').style.zIndex = -2;
	    document.getElementById('draw_canvas_div').style.zIndex = -2;

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
        new_name = nn; // WHY DO YOU USE nn AS AN INTERMEDIATE NAME?
        //     new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
        old_name = new_name;  // WHY????????
        
        //     var anno = this.QueryToRest();
        
        
        anno_count++;
        global_count++;
        
        // Insert data for server logfile:
        InsertServerLogData('cpts_not_modified');
        
        // Get object index:
        var obj_ndx = anno.anno_id;
        
        // Insert data into XML:
        var html_str = '<object>';
        html_str += '<name>' + new_name + '</name>';
        html_str += '<deleted>0</deleted>';
        html_str += '<verified>0</verified>';
        if(use_attributes) {
            html_str += '<occluded>' + new_occluded + '</occluded>';
            html_str += '<attributes>' + new_attributes + '</attributes>';
        }
        html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
        var ts = GetTimeStamp();
        if(ts.length==20) html_str += '<date>' + ts + '</date>';
        html_str += '<id>' + obj_ndx + '</id>';
        html_str += '<polygon>';
        html_str += '<username>' + username + '</username>';
        for(var jj=0; jj < anno.GetPtsX().length; jj++) {
            html_str += '<pt>';
            html_str += '<x>' + anno.GetPtsX()[jj] + '</x>';
            html_str += '<y>' + anno.GetPtsY()[jj] + '</y>';
            html_str += '</pt>';
        }
        html_str += '</polygon>';
        html_str += '</object>';
        $(LM_xml).children("annotation").append($(html_str));
        
        AllAnnotations.push(anno);

	if(!anno.GetDeleted()||view_Deleted) {
	  main_canvas.AttachAnnotation(anno,'polygon');
	  main_canvas.RenderAnnotations();
        }

        // Write XML to server:
        WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
        
        //     SubmitAnnotations(0);
        
        if(view_ObjList) {
            RemoveAnnotationList();
            LoadAnnotationList();
        }
        
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

	// Move query canvas to the back:
	document.getElementById('query_canvas').style.zIndex = -2;
	document.getElementById('query_canvas_div').style.zIndex = -2;

	var anno = main_query_canvas.DetachAnnotation();

	CloseQueryPopup();
	main_image.ScrollbarsOn();

        return anno;
    };
    
    // Handles when we wish to change from "rest" to "selected".
    this.RestToSelected = function (anno_id,event) {
      if(event) event.stopPropagation();
      if((IsUserAnonymous() || (!IsCreator(AllAnnotations[anno_id].GetUsername()))) && (!IsUserAdmin()) && (anno_id<num_orig_anno) && !action_RenameExistingObjects && !action_ModifyControlExistingObjects && !action_DeleteExistingObjects) {
	PermissionError();
	return;
      }
      this.active_canvas = SELECTED_CANVAS;
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
        
	//       SubmitAnnotations(false);
      }
      
      // Move select_canvas to front:
      document.getElementById('select_canvas').style.zIndex = 0;
      document.getElementById('select_canvas_div').style.zIndex = 0;
      
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
      if(anno.GetVerified()) {
	mkVerifiedPopup(pt[0],pt[1]);
      }
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

    };
    
    // Handles when we wish to change from "selected" to "rest".
    this.SelectedToRest = function () {
      this.active_canvas = REST_CANVAS;
      edit_popup_open = 0;
      
      // Move select_canvas to back:
      document.getElementById('select_canvas').style.zIndex = -2;
      document.getElementById('select_canvas_div').style.zIndex = -2;
      
      var anno = main_select_canvas.DetachAnnotation();
      
      WriteLogMsg('*Closed_Edit_Popup');
      CloseEditPopup();
      main_image.ScrollbarsOn();
      
      if(!anno.GetDeleted()||view_Deleted) {
	main_canvas.AttachAnnotation(anno,'polygon');
	main_canvas.RenderAnnotations();
      }
    };
    
    // Handles when the user presses the mouse button down on the selected
    // canvas.
    this.SelectedCanvasMouseDown = function (event) {
      if(isEditingControlPoint || isMovingCenterOfMass) {
	this.MainPageMouseUp(event);
	return;
      }
      var x = GetEventPosX(event);
      var y = GetEventPosY(event);
      var button = event.button;
      if(username_flag) submit_username();
      
      if(button>1) return;
      if(!isEditingControlPoint && main_select_canvas.Peek().StartMoveControlPoint(x,y,main_image.GetImRatio())) {
	isEditingControlPoint = 1;
	editedControlPoints = 1;
      }
      else if(!isMovingCenterOfMass && main_select_canvas.Peek().StartMoveCenterOfMass(x,y,main_image.GetImRatio())) {
	isMovingCenterOfMass = 1;
	editedControlPoints = 1;
      }
      else main_handler.SubmitEditLabel();
    };
    
    // Handles when the user moves the mouse button over the main page.
    this.MainPageMouseMove = function (event) {
      if(this.active_canvas==SELECTED_CANVAS) {
	var x = GetEventPosX(event);
	var y = GetEventPosY(event);
	var button = event.button;
	if(button>1) return;
	if(isEditingControlPoint) {
	  main_select_canvas.Peek().MoveControlPoint(x,y,main_image.GetImRatio());
	}
	else if(isMovingCenterOfMass) {
	  main_select_canvas.Peek().MoveCenterOfMass(x,y,main_image.GetImRatio());
	}
      }
    };
    
    // Handles when the user releases the mouse button over the main page.
    this.MainPageMouseUp = function (event) {
      if(this.active_canvas==SELECTED_CANVAS) {
	var x = GetEventPosX(event);
	var y = GetEventPosY(event);
	var button = event.button;

	if(button>1) return;
	if(isEditingControlPoint) {
	  main_select_canvas.Peek().MoveControlPoint(x,y,main_image.GetImRatio());
	  main_select_canvas.Peek().FillPolygon();
	  main_select_canvas.Peek().ShowCenterOfMass(main_image.GetImRatio());
	  isEditingControlPoint = 0;
	  return;
	}
	if(isMovingCenterOfMass) {
	  main_select_canvas.Peek().MoveCenterOfMass(x,y,main_image.GetImRatio());
	  main_select_canvas.Peek().FillPolygon();
	  isMovingCenterOfMass = 0;
	}
      }
    };
    
    // Handles when the user presses a key while interacting with the tool.
    this.KeyPress = function (event) {
        // Delete event: 46 - delete key; 8 - backspace key
        if(((event.keyCode==46) || (event.keyCode==8)) && !wait_for_input && !edit_popup_open && !username_flag) {
            // Determine whether we are deleting a complete or partially
            // complete polygon.
            if(!main_handler.EraseSegment()) DeleteSelectedPolygon();
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
        var anno = main_draw_canvas.Peek();
        if(anno && !anno.DeleteLastControlPoint()) {
            //       // Write to logfile:
            //       WriteLogMsg('*Deleted_object_during_labeling');
            
            submission_edited = 0;
            //       old_name = '';
            //       new_name = '';
            //       SubmitAnnotations(0);
            
            this.DrawToRest();
        }
        return anno;
    };
    
    // Handles when the user mouses over the first control point.
    this.MousedOverFirstControlPoint = function () {
        main_draw_canvas.Peek().MouseOverFirstPoint();
    };
    
    // Handles when the user mouses away from the first control point.
    this.MousedOutFirstControlPoint = function () {
        if(this.active_canvas!=DRAW_CANVAS) return;
        main_draw_canvas.Peek().MouseOutFirstPoint();
    };
    
    // *******************************************
    // Private methods:
    // *******************************************
    
}
