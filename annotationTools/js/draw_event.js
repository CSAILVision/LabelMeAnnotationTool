// This file contains the scripts for when the draw event is activated.

var draw_anno;

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
  draw_anno = new annotation(AllAnnotations.length);
  
  // Add first control point:
  draw_anno.pts_x.push(Math.round(x/main_image.GetImRatio()));
  draw_anno.pts_y.push(Math.round(y/main_image.GetImRatio()));
  
  // Attach the annotation to the draw canvas:
//   draw_anno.SetDivAttach('draw_canvas');
  main_draw_canvas.AttachAnnotation(draw_anno,'polyline');
  
  // Render the annotation:
//   draw_anno.DrawPolyLine();
  main_draw_canvas.RenderAnnotations();
  
  WriteLogMsg('*start_polygon');
}

// Handles when the user presses the mouse button down on the drawing
// canvas.
function DrawCanvasMouseDown(event) {
  // User right-clicked mouse, so close polygon and return:
  if(event.button > 1) return DrawCanvasClosePolygon();

  if(active_canvas!=DRAW_CANVAS) return;
  if(username_flag) submit_username();

  // Get (x,y) mouse location:
  var scale = main_image.GetImRatio();
  var x = Math.round(GetEventPosX(event)/scale);
  var y = Math.round(GetEventPosY(event)/scale);

  // Add point to polygon:
  var anno = main_draw_canvas.Peek();
  anno.pts_x.push(x);
  anno.pts_y.push(y);
  
  if(!anno.line_ids) anno.line_ids = Array();
  
  var line_idx = anno.line_ids.length;
  var n = anno.pts_x.length-1;
  
  // Draw line segment:
  anno.line_ids.push(DrawLineSegment(anno.div_attach,anno.pts_x[n-1],anno.pts_y[n-1],anno.pts_x[n],anno.pts_y[n],'stroke="#0000ff" stroke-width="4"',scale));

  // Set cursor to be crosshair on line segment:
  $('#'+anno.line_ids[line_idx]).css('cursor','crosshair');
  
  // Move the first control point to be on top of any drawn lines.
  $('#'+anno.div_attach).append($('#'+anno.point_id));
}    

// Handles when the user closes the polygon by right-clicking or clicking 
// on the first control point.
function DrawCanvasClosePolygon() {
  if(active_canvas!=DRAW_CANVAS) return;
  if(username_flag) submit_username();
  main_handler.DrawToQuery();
}

// Handles when the user presses the undo close button in response to
// the "What is this object?" popup bubble.
function UndoCloseButton() {
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
  
  // Remove rendering of polygon from the canvas:
//   draw_anno.DeletePolygon();
  main_draw_canvas.DetachAnnotation();

  // Write message to the console:
  console.log('LabelMe: Stopped draw event.');
}
