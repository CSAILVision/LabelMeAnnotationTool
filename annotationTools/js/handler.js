// Created: 10/07/2006
// Updated: 10/19/2006

// handler
// Handles all of the user's actions and delegates tasks to other classes.
// Also keeps track of global information.
var REST_CANVAS = 1;
var DRAW_CANVAS = 2;
var SELECTED_CANVAS = 3;
var QUERY_CANVAS = 4;

// Global variable indicating which canvas is active:
var active_canvas = REST_CANVAS;

function handler() {
    
    // *******************************************
    // Public methods:
    // *******************************************
    
    // Handles when the user presses the delete button in response to
    // the "What is this object?" popup bubble.
    this.WhatIsThisObjectDeleteButton = function () {
      submission_edited = 0;
      this.QueryToRest();
    };
    
    // Handles when the user presses the undo close button in response to
    // the "What is this object?" popup bubble.
    this.WhatIsThisObjectUndoCloseButton = function () {
        active_canvas = DRAW_CANVAS;

	// Move query canvas to the back:
	document.getElementById('query_canvas').style.zIndex = -2;
	document.getElementById('query_canvas_div').style.zIndex = -2;

        var anno = main_query_canvas.DetachAnnotation();

	CloseQueryPopup();
	main_image.ScrollbarsOn();
	
	// Move select_canvas to front:
	document.getElementById('draw_canvas').style.zIndex = 0;
	document.getElementById('draw_canvas_div').style.zIndex = 0;

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
      if(document.getElementById('objEnter')) new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
      else new_name = RemoveSpecialChars(adjust_objEnter);
      
      var re = /[a-zA-Z0-9]/;
      if(!re.test(new_name)) {
	alert('Please enter an object name');
	return;
      }
      
      if (use_attributes) {
	// occlusion field
	if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
	else new_occluded = RemoveSpecialChars(adjust_occluded);
	
	// attributes field
	if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
	else new_attributes = RemoveSpecialChars(adjust_attributes);
      }
      
      StopEditEvent();
      
      // Insert data to write to logfile:
      if(editedControlPoints) InsertServerLogData('cpts_modified');
      else InsertServerLogData('cpts_not_modified');
      
      // Object index:
      var obj_ndx = anno.anno_id;
      
      // Pointer to object:
      var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_ndx);
      
      // Set fields:
      curr_obj.children("name").text(new_name);
      if(curr_obj.children("automatic").length > 0) curr_obj.children("automatic").text("0");
      
      // Insert attributes (and create field if it is not there):
      if(curr_obj.children("attributes").length>0) curr_obj.children("attributes").text(new_attributes);
      else curr_obj.append("<attributes>" + new_attributes + "</attributes>");
        
      if(curr_obj.children("occluded").length>0) curr_obj.children("occluded").text(new_occluded);
      else curr_obj.append("<occluded>" + new_occluded + "</occluded>");
        
      if(editedControlPoints) {
	for(var jj=0; jj < AllAnnotations[obj_ndx].GetPtsX().length; jj++) {
	  curr_obj.children("polygon").children("pt").eq(jj).children("x").text(AllAnnotations[obj_ndx].GetPtsX()[jj]);
	  curr_obj.children("polygon").children("pt").eq(jj).children("y").text(AllAnnotations[obj_ndx].GetPtsY()[jj]);
	}
      }
      
      // Write XML to server:
      WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
      
      // Refresh object list:
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
        if((IsUserAnonymous() || (!IsCreator(main_select_canvas.Peek().GetUsername()))) && (!IsUserAdmin()) && (idx<num_orig_anno) && !action_DeleteExistingObjects) {
            alert('You do not have permission to delete this polygon');
            return;
        }
        
        if(idx>=num_orig_anno) {
            anno_count--;
            global_count--;
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

	// Refresh object list:
        if(view_ObjList) {
            RemoveAnnotationList();
            LoadAnnotationList();
        }
        
        unselectObjects(); // Perhaps this should go elsewhere...
        StopEditEvent();
    };
    
    // Handles when the user clicks on the link for an annotation.
    this.AnnotationLinkClick = function (idx) {
      if(active_canvas==REST_CANVAS) StartEditEvent(idx,null);
      else if(active_canvas==SELECTED_CANVAS) {
	var anno_id = main_select_canvas.Peek().GetAnnoID();
	if(edit_popup_open && (idx==anno_id)) StopEditEvent();
      }
    };
    
    // Handles when the user moves the mouse over an annotation link.
    this.AnnotationLinkMouseOver = function (a) {
        if(active_canvas!=SELECTED_CANVAS) selectObject(a);
    };
    
    // Handles when the user moves the mouse away from an annotation link.
    this.AnnotationLinkMouseOut = function () {
        if(active_canvas!=SELECTED_CANVAS) unselectObjects();
    };
    
    // Handles when the user moves the mouse over a polygon on the drawing
    // canvas.
    this.CanvasMouseMove = function (event,pp) {
        var x = GetEventPosX(event);
        var y = GetEventPosY(event);
        if(IsNearPolygon(x,y,pp)) selectObject(pp);
        else unselectObjects();
    };
    
    // Handles when the user presses the mouse button down on the drawing
    // canvas.
    this.DrawCanvasMouseDown = function (event) {
        if(active_canvas!=DRAW_CANVAS) return;
        
        var x = GetEventPosX(event);
        var y = GetEventPosY(event);
        var button = event.button;
        
        if(username_flag) submit_username();
        
        // If right-clicked and can successfully close the polygon.
        if(button > 1) this.DrawToQuery();
        else main_draw_canvas.Peek().AddControlPoint(x,y);
    };
    
    // Handles when we wish to change from "draw" to "query".
    this.DrawToQuery = function () {
        if((object_choices!='...') && (object_choices.length==1)) {
            this.SubmitQuery();
            StopDrawEvent();
            return;
        }
        active_canvas = QUERY_CANVAS;

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
    
    // Submits the object label in response to the "What is this object?"
    // popup bubble. THIS FUNCTION IS A MESS!!!!
    this.SubmitQuery = function () {
      var nn;
      var anno;
      
      // If the attributes are active, read the fields.
      if (use_attributes) {
	// get attributes (is the field exists)
	if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
	else new_attributes = "";
	
	// get occlusion field (is the field exists)
	if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
	else new_occluded = "";
      }
      
      if((object_choices!='...') && (object_choices.length==1)) {
	nn = RemoveSpecialChars(object_choices[0]);
	active_canvas = REST_CANVAS;
	
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

      // Update old and new object names for logfile:
      new_name = nn;
      old_name = nn;
      
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
      
      if(view_ObjList) {
	RemoveAnnotationList();
	LoadAnnotationList();
      }
      
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
        active_canvas = REST_CANVAS;

	// Move query canvas to the back:
	document.getElementById('query_canvas').style.zIndex = -2;
	document.getElementById('query_canvas_div').style.zIndex = -2;

	var anno = main_query_canvas.DetachAnnotation();

	CloseQueryPopup();
	main_image.ScrollbarsOn();

        return anno;
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
        if(event.keyCode==27 && edit_popup_open) StopEditEvent();
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
            
            StopDrawEvent();
        }
        return anno;
    };
    
    // Handles when the user mouses over the first control point.
    this.MousedOverFirstControlPoint = function () {
        main_draw_canvas.Peek().MouseOverFirstPoint();
    };
    
    // Handles when the user mouses away from the first control point.
    this.MousedOutFirstControlPoint = function () {
        if(active_canvas!=DRAW_CANVAS) return;
        main_draw_canvas.Peek().MouseOutFirstPoint();
    };
    
    // *******************************************
    // Private methods:
    // *******************************************
    
}
