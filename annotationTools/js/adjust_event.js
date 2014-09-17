// Adjust control points of polygon.
function AdjustEvent(dom_attach,x,y,obj_name,ExitFunction,scale) {

  /****************** Private variables ************************/

  // ID of DOM element to attach to:
  this.dom_attach = dom_attach;

  // Polygon:
  this.x = x;
  this.y = y;

  // Object name:
  this.obj_name = obj_name;

  // Function to call when event is finished:
  this.ExitFunction = ExitFunction;

  // Scaling factor for polygon points:
  this.scale = scale;

  // Boolean indicating whether a control point has been edited:
  this.editedControlPoints = false;

  // Boolean indicating whether a control point is being edited:
  this.isEditingControlPoint = false;

  // Boolean indicating whether the center of mass of the polygon is being 
  // adjusted:
  this.isMovingCenterOfMass = false;

  // Index into which control point has been selected:
  this.selectedControlPoint;

  // Location of center of mass:
  this.center_x;
  this.center_y;

  // Element ids of drawn control points:
  this.control_ids = null;

  // Element id of drawn center point:
  this.center_id = null;

  // ID of drawn polygon:
  this.polygon_id;

  /****************** Public functions ************************/

  // This function starts the event:
  this.StartEvent = function() {
    console.log('LabelMe: Starting adjust event...');

    // Draw polygon:
    this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
    FillPolygon(this.polygon_id);
    
    // Show control points:
    this.ShowControlPoints();
    
    // Show center of mass:
    this.ShowCenterOfMass();
    
    // Set mousedown action to stop adjust event when user clicks on canvas:
    $('#'+this.dom_attach).unbind();
    $('#'+this.dom_attach).mousedown({obj: this},function(e) {
	return e.data.obj.StopAdjustEvent();
      });
  };
  
  // Stop polygon adjust event:
  this.StopAdjustEvent = function() {
    // Remove polygon:
    $('#'+this.polygon_id).remove();
    
    // Remove control points and center of mass point:
    this.RemoveControlPoints();
    this.RemoveCenterOfMass();
    
    console.log('LabelMe: Stopped adjust event.');
    
    // Call exit function:
    this.ExitFunction(this.x,this.y,this.editedControlPoints);
  };

  // This function shows all control points for an annotation.
  this.ShowControlPoints = function() {
    if(!this.control_ids) this.control_ids = new Array();
    for(var i = 0; i < this.x.length; i++) {
      // Draw control point:
      this.control_ids.push(DrawPoint(this.dom_attach,this.x[i],this.y[i],'r="5" fill="#00ff00" stroke="#ffffff" stroke-width="2.5"',this.scale));
      
      // Set action:
      $('#'+this.control_ids[i]).mousedown({obj: this,point: i},function(e) {
	  return e.data.obj.StartMoveControlPoint(e.data.point);
	});
    }
  };

  // This function removes all displayed control points from an annotation
  this.RemoveControlPoints = function() {
    if(this.control_ids) {
      for(var i = 0; i < this.control_ids.length; i++) $('#'+this.control_ids[i]).remove();
      this.control_ids = null;
    }
  };

  // This function shows the middle grab point for a polygon.
  this.ShowCenterOfMass = function() {
    var MarkerSize = 8;
    if(this.x.length==1) MarkerSize = 6;
    
    // Get center point for polygon:
    this.CenterOfMass(this.x,this.y);
    
    // Draw center point:
    this.center_id = DrawPoint(this.dom_attach,this.center_x,this.center_y,'r="' + MarkerSize + '" fill="red" stroke="#ffffff" stroke-width="' + MarkerSize/2 + '"',this.scale);
    
    // Set action:
    $('#'+this.center_id).mousedown({obj: this},function(e) {
	return e.data.obj.StartMoveCenterOfMass();
      });
  };

  // This function removes the middle grab point for a polygon
  this.RemoveCenterOfMass = function() {
    if(this.center_id) {
      $('#'+this.center_id).remove();
      this.center_id = null;
    }
  };

  this.StartMoveControlPoint = function(i) {
    if(!this.isEditingControlPoint) {
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousemove({obj: this},function(e) {
	  return e.data.obj.MoveControlPoint(e.originalEvent);
	});
      $('#body').mouseup({obj: this},function(e) {
	  return e.data.obj.StopMoveControlPoint(e.originalEvent);
	});      

      this.RemoveCenterOfMass();
      this.selectedControlPoint = i;
      
      this.isEditingControlPoint = true;
      this.editedControlPoints = true;
    }
  };

  this.MoveControlPoint = function(event) {
    if(this.isEditingControlPoint) {
      var x = GetEventPosX(event);
      var y = GetEventPosY(event);
      
      // Set point:
      this.x[this.selectedControlPoint] = Math.max(Math.min(Math.round(x/this.scale),main_image.width_orig),1);
      this.y[this.selectedControlPoint] = Math.max(Math.min(Math.round(y/this.scale),main_image.height_orig),1);
      
      // Remove polygon and redraw:
      $('#'+this.polygon_id).remove();
      this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
      
      // Adjust control points:
      this.RemoveControlPoints();
      this.ShowControlPoints();
    }
  };

  this.StopMoveControlPoint = function(event) {
    if(this.isEditingControlPoint) {
      this.MoveControlPoint(event);
      FillPolygon(this.polygon_id);
      this.ShowCenterOfMass();
      this.isEditingControlPoint = false;

      // Set action:
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousedown({obj: this},function(e) {
	  return e.data.obj.StopAdjustEvent();
	});

    }
  };

  this.StartMoveCenterOfMass = function() {
    if(!this.isMovingCenterOfMass) {
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousemove({obj: this},function(e) {
	  return e.data.obj.MoveCenterOfMass(e.originalEvent);
	});
      $('#body').mouseup({obj: this},function(e) {
	  return e.data.obj.StopMoveCenterOfMass(e.originalEvent);
	});

      this.RemoveControlPoints();
      
      this.isMovingCenterOfMass = true;
      this.editedControlPoints = true;
    }
  };

  this.MoveCenterOfMass = function(event) {
    if(this.isMovingCenterOfMass) {
      var x = GetEventPosX(event);
      var y = GetEventPosY(event);
      
      // Get displacement:
      var dx = Math.round(x/this.scale)-this.center_x;
      var dy = Math.round(y/this.scale)-this.center_y;
      
      // Adjust dx,dy to make sure we don't go outside of the image:
      for(var i = 0; i < this.x.length; i++) {
	dx = Math.max(this.x[i]+dx,1)-this.x[i];
	dy = Math.max(this.y[i]+dy,1)-this.y[i];
	dx = Math.min(this.x[i]+dx,main_image.width_orig)-this.x[i];
	dy = Math.min(this.y[i]+dy,main_image.height_orig)-this.y[i];
      }
      
      // Adjust polygon and center point:
      for(var i = 0; i < this.x.length; i++) {
	this.x[i] = Math.round(this.x[i]+dx);
	this.y[i] = Math.round(this.y[i]+dy);
      }
      this.center_x = Math.round(this.scale*(dx+this.center_x));
      this.center_y = Math.round(this.scale*(dy+this.center_y));
      
      // Remove polygon and redraw:
      $('#'+this.polygon_id).remove();
      this.polygon_id = this.DrawPolygon(this.dom_attach,this.x,this.y,this.obj_name,this.scale);
      
      // Redraw center of mass:
      this.RemoveCenterOfMass();
      this.ShowCenterOfMass();
    }
  };
    
  this.StopMoveCenterOfMass = function(event) {
    if(this.isMovingCenterOfMass) {
      // Move to final position:
      this.MoveCenterOfMass(event);
      
      // Refresh control points:
      this.RemoveControlPoints();
      this.RemoveCenterOfMass();
      this.ShowControlPoints();
      this.ShowCenterOfMass();

      FillPolygon(this.polygon_id);
      this.isMovingCenterOfMass = false;

      // Set action:
      $('#'+this.dom_attach).unbind();
      $('#'+this.dom_attach).mousedown({obj: this},function(e) {
	  return e.data.obj.StopAdjustEvent();
	});

    }
  };

  /*************** Helper functions ****************/

  // Compute center of mass for a polygon given array of points (x,y):
  this.CenterOfMass = function(x,y) {
    var N = x.length;
    
    // Center of mass for a single point:
    if(N==1) {
      this.center_x = x[0];
      this.center_y = y[0];
      return;
    }
    
    // The center of mass is the average polygon edge midpoint weighted by 
    // edge length:
    this.center_x = 0; this.center_y = 0;
    var perimeter = 0;
    for(var i = 1; i <= N; i++) {
      var length = Math.round(Math.sqrt(Math.pow(x[i-1]-x[i%N], 2) + Math.pow(y[i-1]-y[i%N], 2)));
      this.center_x += length*Math.round((x[i-1] + x[i%N])/2);
      this.center_y += length*Math.round((y[i-1] + y[i%N])/2);
      perimeter += length;
    }
    this.center_x /= perimeter;
    this.center_y /= perimeter;
  };

  this.DrawPolygon = function(dom_id,x,y,obj_name,scale) {
    if(x.length==1) return DrawFlag(dom_id,x[0],y[0],obj_name,scale);
    
    var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
    return DrawPolygon(dom_id,x,y,obj_name,attr,scale);
  };
}

