// This file contains the scripts for when the draw event is activated.

// This function is called with the draw event is started.  It can be 
// triggered when the user (1) clicks on the base canvas.
function StartDrawEvent(event) {
  if(!action_CreatePolygon) return;
  if(active_canvas != REST_CANVAS) return;

  // Write message to the console:
  console.log('LabelMe: Starting draw event...');

  // Set active canvas:
  active_canvas = DRAW_CANVAS;

  // Get (x,y) mouse click location and button.
  var x = GetEventPosX(event);
  var y = GetEventPosY(event);
  var button = event.button;
  
  // If the user does not left click, then ignore mouse-down action.
  if(button>1) return;
  
  // Move draw canvas to front:
  $('#draw_canvas').css('z-index','0');
  $('#draw_canvas_div').css('z-index','0');
  
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
}

// This function is called when the draw event is finished.  It can be
// triggered when the user (1) closes the polygon and only one option is
// valid in the drop-down list (2) erases the last control point.
function StopDrawEvent() {
  // Set active canvas:
  active_canvas = REST_CANVAS;
  
  // Move draw canvas to the back:
  $('#draw_canvas').css('z-index','-2');
  $('#draw_canvas_div').css('z-index','-2');
  
  main_draw_canvas.DetachAnnotation();

  // Write message to the console:
  console.log('LabelMe: Stopped draw event.');
}
