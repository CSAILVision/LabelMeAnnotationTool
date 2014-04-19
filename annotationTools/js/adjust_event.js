// Boolean indicating whether a control point is being edited:
var isEditingControlPoint = 0;

// Boolean indicating whether the center of mass of the polygon is being 
// adjusted:
var isMovingCenterOfMass = 0;

// Index into which control point has been selected:
var selectedControlPoint;

// Location of center of mass:
var center_x;
var center_y;

// Element ids of drawn control points:
var control_ids = null;

// Element id of drawn center point:
var center_id = null;

// ID of DOM element to attach to:
var control_div_attach = 'select_canvas';

// ID of drawn polygon:
var adjust_polygon_id;

// Polygon points and object name:
var adjust_x;
var adjust_y;
var adjust_obj_name;

// Function to call when adjust event is finished:
var ExitFunction = function(){return;};

// ADJUST POLYGON,
function StartAdjustEvent(x,y,obj_name,_ExitFunction) {
  console.log('LabelMe: Starting adjust event...');

  // Set polygon, object name, and exit function:
  adjust_x = x;
  adjust_y = y;
  adjust_obj_name = obj_name;
  ExitFunction = _ExitFunction;

  // Draw polygon:
  adjust_polygon_id = adjust_DrawPolygon(control_div_attach,adjust_x,adjust_y,adjust_obj_name,main_image.GetImRatio());
  FillPolygon(adjust_polygon_id);
  
  // Show control points:
  ShowControlPoints();

  // Show center of mass:
  ShowCenterOfMass();

  $('#select_canvas_div').attr("onmousedown","javascript:StopAdjustEvent();return false;");
}

// This function shows all control points for an annotation.
function ShowControlPoints() {
  var im_ratio = main_image.GetImRatio();
  if(!control_ids) control_ids = new Array();
  for(var i = 0; i < adjust_x.length; i++) {
    // Draw control point:
    control_ids.push(DrawPoint(control_div_attach,adjust_x[i],adjust_y[i],'r="5" fill="#00ff00" stroke="#ffffff" stroke-width="2.5"',im_ratio));

    // Set action:
    $('#'+control_ids[i]).attr('onmousedown','javascript:StartMoveControlPoint(' + i + ');');
  }
}

// This function removes all displayed control points from an annotation
function RemoveControlPoints() {
  if(control_ids) {
    for(var i = 0; i < control_ids.length; i++) $('#'+control_ids[i]).remove();
    control_ids = null;
  }
}

// This function shows the middle grab point for a polygon.
function ShowCenterOfMass() {
  var im_ratio = main_image.GetImRatio();
  var MarkerSize = 8;
  if(adjust_x.length==1) MarkerSize = 6;

  // Get center point for polygon:
  CenterOfMass(adjust_x,adjust_y);

  // Draw center point:
  center_id = DrawPoint(control_div_attach,center_x,center_y,'r="' + MarkerSize + '" fill="red" stroke="#ffffff" stroke-width="' + MarkerSize/2 + '"',im_ratio);

  // Set action:
  $('#'+center_id).attr('onmousedown','javascript:StartMoveCenterOfMass();');
}

// This function removes the middle grab point for a polygon
function RemoveCenterOfMass() {
  if(center_id) {
    $('#'+center_id).remove();
    center_id = null;
  }
}

function StartMoveControlPoint(i) {
  if(!isEditingControlPoint) {
    $('#select_canvas_div').attr("onmousedown","");
    $('#select_canvas_div').attr("onmousemove","javascript:MoveControlPoint(event);");
    $('#body').attr("onmouseup","javascript:StopMoveControlPoint(event);");

    RemoveCenterOfMass();
    selectedControlPoint = i;

    isEditingControlPoint = 1;
    editedControlPoints = 1;
  }
}

function MoveControlPoint(event) {
  if(isEditingControlPoint) {
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    var im_ratio = main_image.GetImRatio();

    // Set point:
    adjust_x[selectedControlPoint] = Math.max(Math.min(Math.round(x/im_ratio),main_image.width_orig),1);
    adjust_y[selectedControlPoint] = Math.max(Math.min(Math.round(y/im_ratio),main_image.height_orig),1);
    
    // Remove polygon and redraw:
    $('#'+adjust_polygon_id).remove();
    adjust_polygon_id = adjust_DrawPolygon(control_div_attach,adjust_x,adjust_y,adjust_obj_name,im_ratio);
    
    // Adjust control points:
    RemoveControlPoints();
    ShowControlPoints();
  }
} 

function StopMoveControlPoint(event) {
  if(isEditingControlPoint) {
    MoveControlPoint(event);
    FillPolygon(adjust_polygon_id);
    ShowCenterOfMass();
    isEditingControlPoint = 0;

    $('#select_canvas_div').attr("onmousedown","javascript:StopAdjustEvent();return false;");
  }
}

function StartMoveCenterOfMass() {
  if(!isMovingCenterOfMass) {
    $('#select_canvas_div').attr("onmousedown","");
    $('#select_canvas_div').attr("onmousemove","javascript:MoveCenterOfMass(event);");
    $('#body').attr("onmouseup","javascript:StopMoveCenterOfMass(event);");

    RemoveControlPoints();

    isMovingCenterOfMass = 1;
    editedControlPoints = 1;
  }
}

function MoveCenterOfMass(event) {
  if(isMovingCenterOfMass) {
    var x = GetEventPosX(event);
    var y = GetEventPosY(event);
    var im_ratio = main_image.GetImRatio();

    // Get displacement:
    var dx = Math.round(x/im_ratio)-center_x;
    var dy = Math.round(y/im_ratio)-center_y;
    
    // Adjust dx,dy to make sure we don't go outside of the image:
    for(var i = 0; i < adjust_x.length; i++) {
      dx = Math.max(adjust_x[i]+dx,1)-adjust_x[i];
      dy = Math.max(adjust_y[i]+dy,1)-adjust_y[i];
      dx = Math.min(adjust_x[i]+dx,main_image.width_orig)-adjust_x[i];
      dy = Math.min(adjust_y[i]+dy,main_image.height_orig)-adjust_y[i];
    }
    
    // Adjust polygon and center point:
    for(var i = 0; i < adjust_x.length; i++) {
      adjust_x[i] = Math.round(adjust_x[i]+dx);
      adjust_y[i] = Math.round(adjust_y[i]+dy);
    }
    center_x = Math.round(im_ratio*(dx+center_x));
    center_y = Math.round(im_ratio*(dy+center_y));
    
    // Remove polygon and redraw:
    $('#'+adjust_polygon_id).remove();
    adjust_polygon_id = adjust_DrawPolygon(control_div_attach,adjust_x,adjust_y,adjust_obj_name,im_ratio);
    
    // Redraw control points and center of mass:
    RemoveControlPoints();
    RemoveCenterOfMass();
    ShowControlPoints();
    ShowCenterOfMass();
  }
}
    
function StopMoveCenterOfMass(event) {
  if(isMovingCenterOfMass) {
    MoveCenterOfMass(event);
    FillPolygon(adjust_polygon_id);
    isMovingCenterOfMass = 0;
    
    $('#select_canvas_div').attr("onmousedown","javascript:StopAdjustEvent();return false;");
  }
}

function StopAdjustEvent() {
  // Remove polygon:
  $('#'+adjust_polygon_id).remove();

  // Remove control points and center of mass point:
  RemoveControlPoints();
  RemoveCenterOfMass();

  console.log('LabelMe: Stopped adjust event.');

  // Call exit function:
  ExitFunction();
}

/*************** Helper functions ****************/

// Compute center of mass for a polygon given array of points (x,y):
function CenterOfMass(x,y) {
  var N = x.length;
  
  // Center of mass for a single point:
  if(N==1) {
    center_x = x[0];
    center_y = y[0];
    return;
  }

  // The center of mass is the average polygon edge midpoint weighted by 
  // edge length:
  center_x = 0; center_y = 0;
  var perimeter = 0;
  for(var i = 1; i <= N; i++) {
    var length = Math.round(Math.sqrt(Math.pow(x[i-1]-x[i%N], 2) + Math.pow(y[i-1]-y[i%N], 2)));
    center_x += length*Math.round((x[i-1] + x[i%N])/2);
    center_y += length*Math.round((y[i-1] + y[i%N])/2);
    perimeter += length;
  }
  center_x /= perimeter;
  center_y /= perimeter;
}

function adjust_DrawPolygon(dom_id,x,y,obj_name,scale) {
  if(x.length==1) return DrawFlag(dom_id,x[0],y[0],obj_name,scale);

  var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
  return DrawPolygon(dom_id,x,y,obj_name,attr,scale);
}
