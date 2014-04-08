// annotation class
// Keeps track of all information related to an individual annotation.

function annotation(anno_id) {
    
    // *******************************************
    // Private variables:
    // *******************************************
    
    this.pts_x = new Array();
    this.pts_y = new Array();
    
    this.anno_id = anno_id;
    this.div_attach = 'myCanvas_bg';
    
    // This array stores graphics objects for each control point
    this.selectedControlPoint = -1;
    this.center_x;
    this.center_y;

    // Element id of drawn polygon:
    this.polygon_id = null;

    // Element ids of drawn line segments:
    this.line_ids = null;

    // Element id for drawn first point:
    this.point_id = null;
    
    // Element ids of drawn control points:
    this.control_ids = null;

    // Element id of drawn center point:
    this.center_id = null;

    // *******************************************
    // Public methods:
    // *******************************************
    
    this.GetObjName = function () {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("name").text();
    };
    
    this.GetUsername = function () {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("polygon").children("username").text();
    };
    
    this.GetAutomatic = function() {
        if($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("automatic").length > 0) {
            return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("automatic").text());
        }
        return 0;
    };
    
    this.GetDeleted = function () {
        return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("deleted").text());
    };
    
    this.GetVerified = function () {
        return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("verified").text());
    };
    
    this.GetOccluded = function() {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("occluded").text();
    };
    
    this.GetAttributes = function() {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("attributes").text();
    };
    
    this.GetParts = function() {
        parts = [];
        if ($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("parts").length>0) {
            tmp = $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("parts").children("hasparts").text();
            if (tmp.length>0) {
                // if it is not empty, split and trasnform to numbers
                parts = tmp.split(",");
                for (var j=0; j<parts.length; j++) {parts[j] = parseInt(parts[j], 10);}
            }
        }
        return parts;
    };

    this.SetDivAttach = function(da) {
        this.div_attach = da;
    };
    
    this.GetAnnoID = function () {
        return this.anno_id;
    };
    
    // Get the array of X control points.
    this.GetPtsX = function () {
        return this.pts_x;
    };
    
    this.CreatePtsX = function (numpts) {
        this.pts_x = Array(numpts);
    };
    
    // Get the array of Y control points.
    this.GetPtsY = function () {
        return this.pts_y;
    };
    
    this.CreatePtsY = function (numpts) {
        this.pts_y = Array(numpts);
    };
    
    // Draws first control point of a new polygon.
    this.AddFirstControlPoint = function (x,y) {
        var im_ratio = main_image.GetImRatio();
        x = Math.round(x/im_ratio);
        y = Math.round(y/im_ratio);
        
        // 7.31.06 - disallow making a point at x=1. move it to x=2 instead.
        // This is because where there are points at x=1, there are lines
        // missing.
        if(x==1) x=2;
        
        this.pts_x.push(x);
        this.pts_y.push(y);
    };
    
    // Adds a new control point to the polygon.  This function gets called
    // after the first point already exists.
    this.AddControlPoint = function (x,y) {
      // Get image scale:
      var scale = main_image.GetImRatio();

      // Scale point:
      x = Math.round(x/scale);
      y = Math.round(y/scale);
      
      // 7.31.06 - disallow making a point at x=1. move it to x=2 instead.
      // This is because where there are points at x=1, there are lines
      // missing.
      if(x==1) x=2;
      
      this.pts_x.push(x);
      this.pts_y.push(y);
      
      if(!this.line_ids) this.line_ids = Array();
      
      var line_idx = this.line_ids.length;
      var n = this.pts_x.length-1;
      
      // Draw line segment:
      this.line_ids.push(DrawLineSegment(this.div_attach,this.pts_x[n-1],this.pts_y[n-1],this.pts_x[n],this.pts_y[n],'stroke="#0000ff" stroke-width="4"',scale));

      // Set cursor to be crosshair on line segment:
      $('#'+this.line_ids[line_idx]).css('cursor','crosshair');
      
      // Move the first control point to be on top of any drawn lines.
      $('#'+this.div_attach).append($('#'+this.point_id));
    };
    
    // Set attribute of drawn polygon.
    this.SetAttribute = function(field,value) {
      $(this.polygon_id).attr(field,value);
    };
    
    // Set CSS attribute of drawn polygon.
    this.SetCSS = function(field,value) {
      $(this.polygon_id).css(field,value);
    };
    
    // Draw a polygon given this annotation's control points.
    this.DrawPolygon = function (im_ratio) {
      // Determine if an angle has been labeled:
      var strtok = this.GetObjName().split(/ /);
      var isAngle = 0;
      for(var i = 0; i < strtok.length; i++) if(strtok[i]=='angle') isAngle = 1;
      
      if(this.GetPtsX().length==1) {
	this.polygon_id = '#'+DrawFlag(this.div_attach,this.GetPtsX()[0],this.GetPtsY()[0],this.GetObjName(),im_ratio);
      }
      else if((this.GetPtsX().length==3) && isAngle) {
	var attr = 'fill="none" stroke="' + this.getObjectColor() + '" stroke-width="4"';
	this.polygon_id = '#'+DrawPolyLine(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      else if(this.GetAutomatic()==1) {
	// Draw a dashed polygon:
	var attr = 'fill="none" stroke="' + this.getObjectColor() + '" stroke-width="4" stroke-dasharray="9,5"';
	this.polygon_id = '#'+DrawPolygon(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      else {
	// Draw a polygon:
	var attr = 'fill="none" stroke="' + this.getObjectColor() + '" stroke-width="4"';
	this.polygon_id = '#'+DrawPolygon(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
    };
    
    // Draw a poly-line given this annotation's control points (i.e.
    // don't connect the last point to the first point).  This function
    // is used when we zoom, close the "what is this object?" popup bubble, 
    // or start a new polygon.
    this.DrawPolyLine = function (im_ratio) {
      // Draw line segments:
      var im_ratio = main_image.GetImRatio();
      this.line_ids = Array();
      for(var i = 0; i < this.pts_x.length-1; i++) {
	// Draw line segment:
	this.line_ids.push(DrawLineSegment(this.div_attach,this.pts_x[i],this.pts_y[i],this.pts_x[i+1],this.pts_y[i+1],'stroke="#0000ff" stroke-width="4"',im_ratio));

	// Set cursor to be crosshair on line segment:
	$('#'+this.line_ids[i]).css('cursor','crosshair');
      }

      // Draw first point:
      if(this.point_id) $('#'+this.point_id).remove();
      this.point_id = DrawPoint(this.div_attach,this.pts_x[0],this.pts_y[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',im_ratio);


      // Set actions for first point:
      $('#'+this.point_id).attr('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
      $('#'+this.point_id).attr('onmouseover','main_handler.MousedOverFirstControlPoint();');
    };
    
    // Deletes the annotation's polygon from the screen.
    this.DeletePolygon = function () {
      // Remove drawn polygon:
      if(this.polygon_id) {
	$(this.polygon_id).remove();
	this.polygon_id = null;
      }

      // Remove all line segments for partially-drawn polygon:
      if(this.line_ids) {
	for(var i = 0; i < this.line_ids.length; i++) $('#'+this.line_ids[i]).remove();
	this.line_ids = null;
      }

      // Remove first drawn point:
      this.RemoveFirstPoint();

      // Remove any drawn control points:
      this.RemoveControlPoints();

      // Remove drawn center-of-mass point:
      this.RemoveCenterOfMass();
    };
    
    // Deletes the last control point that the user entered.
    this.DeleteLastControlPoint = function () {
      if(this.pts_x.length>1) {
	var l = this.line_ids.length;
	$('#'+this.line_ids[l-1]).remove();
	this.line_ids = this.line_ids.slice(0,l-1);

	// Remove last point from polygon array:
        var l = this.pts_x.length;
        this.pts_x = this.pts_x.slice(0,l-1);
        this.pts_y = this.pts_y.slice(0,l-1);

	return 1;
      }
      return 0;
    };
    
    // Fill the interior of the polygon.
    this.FillPolygon = function () {
      if(this.polygon_id) {
	$(this.polygon_id).attr("fill",$(this.polygon_id).attr("stroke"));
	$(this.polygon_id).attr("fill-opacity","0.5");
      }
    };
    
    // Unfill the interior of the polygon.
    this.UnfillPolygon = function () {
      if(this.polygon_id) $(this.polygon_id).attr("fill","none");
    };
    
    // When you move the mouse over the first control point, then make it
    // bigger to indicate it should be clicked on.  Do this if two or more
    // lines have been drawn.
    this.MouseOverFirstPoint = function () {
      if(this.pts_x.length > 0) {
	var im_ratio = main_image.GetImRatio();
	this.RemoveFirstPoint();
	this.point_id = DrawPoint(this.div_attach,this.pts_x[0],this.pts_y[0],'r="8" fill="#00ff00" stroke="#ffffff" stroke-width="4"',im_ratio);

	// Set actions for first point:
	$('#'+this.point_id).attr('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
	$('#'+this.point_id).attr('onmouseout','main_handler.MousedOutFirstControlPoint();');
	$('#'+this.point_id).css('cursor','pointer');
      }
    };
    
    // When you move the mouse over the first control point, then make it
    // bigger to indicate it should be clicked on.  Do this if two or more
    // lines have been drawn.
    this.MouseOutFirstPoint = function () {
      var im_ratio = main_image.GetImRatio();
      this.RemoveFirstPoint();
      this.point_id = DrawPoint(this.div_attach,this.pts_x[0],this.pts_y[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',im_ratio);

      // Set actions for first point:
      $('#'+this.point_id).attr('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
      $('#'+this.point_id).attr('onmouseover','main_handler.MousedOverFirstControlPoint();');
      $('#'+this.point_id).css('cursor','pointer');
    };
    
    // This function shows all control points for an annotation it takes in
    // arrays of x and y points
    this.ShowControlPoints = function () {
      var im_ratio = main_image.GetImRatio();
      if(!this.control_ids) this.control_ids = new Array();
      for(i=0; i<this.pts_x.length; i++) {
	this.control_ids.push(DrawPoint(this.div_attach,this.pts_x[i],this.pts_y[i],'r="5" fill="#00ff00" stroke="#ffffff" stroke-width="2.5"',im_ratio));
      }
    };
    
    this.StartMoveControlPoint = function (x,y,im_ratio) {
        var i = this.getNearestControlPoint(x,y,im_ratio);
        if(i>=0) {
            this.RemoveCenterOfMass();
            this.selectedControlPoint = i;
            this.MoveControlPoint(x,y,im_ratio);
            return 1;
        }
        return 0;
    };
    
    this.MoveControlPoint = function (x,y,im_ratio) {
      var i = this.selectedControlPoint;
      this.pts_x[i] = Math.round(x/im_ratio);
      this.pts_y[i] = Math.round(y/im_ratio);
      
      this.pts_x[i] = Math.max(Math.min(this.pts_x[i],main_image.width_orig),1);
      this.pts_y[i] = Math.max(Math.min(this.pts_y[i],main_image.height_orig),1);
      
      // Remove polygon and redraw:
      $(this.polygon_id).remove();
      this.DrawPolygon(im_ratio);
      
      // Adjust control points:
      this.RemoveControlPoints();
      this.ShowControlPoints();
    };
    
    this.StartMoveCenterOfMass = function (x,y,im_ratio) {
        var d = Math.sqrt(Math.pow(Math.round(this.center_x*im_ratio)-x,2)+Math.pow(Math.round(this.center_y*im_ratio)-y,2));
        if(d<=4) {
            this.RemoveControlPoints();
            this.MoveCenterOfMass(x,y,im_ratio);
            return 1;
        }
        return 0;
    };
    
    this.MoveCenterOfMass = function(x,y,im_ratio) {
        var dx = Math.round(x/im_ratio)-this.center_x;
        var dy = Math.round(y/im_ratio)-this.center_y;
        
        // Adjust dx,dy to make sure we don't go outside of the image:
        for(i=0; i<this.pts_x.length; i++) {
            dx = Math.max(this.pts_x[i]+dx,1)-this.pts_x[i];
            dy = Math.max(this.pts_y[i]+dy,1)-this.pts_y[i];
            dx = Math.min(this.pts_x[i]+dx,main_image.width_orig)-this.pts_x[i];
            dy = Math.min(this.pts_y[i]+dy,main_image.height_orig)-this.pts_y[i];
        }
        
        for(i=0; i<this.pts_x.length; i++) {
            this.pts_x[i] = Math.round(this.pts_x[i]+dx);
            this.pts_y[i] = Math.round(this.pts_y[i]+dy);
        }
        this.center_x = Math.round(im_ratio*(dx+this.center_x));
        this.center_y = Math.round(im_ratio*(dy+this.center_y));
        
        // Remove polygon and redraw:
	$(this.polygon_id).remove();
        this.DrawPolygon(im_ratio);
        
        // Adjust control points:
        this.RemoveControlPoints();
        this.ShowControlPoints();
        
        this.RemoveCenterOfMass();
        this.ShowCenterOfMass(im_ratio);
    };
    
    this.getNearestControlPoint = function (x,y,im_ratio) {
        var d = 4;
        var cpt = -1;
        for(i=0; i<this.pts_x.length; i++) {
            var j = Math.sqrt(Math.pow(Math.round(this.pts_x[i]*im_ratio)-x,2)+Math.pow(Math.round(this.pts_y[i]*im_ratio)-y,2));
            if(j<d) {
                d = j;
                cpt = i;
            }
        }
        return cpt;
    };
    
    this.centerOfMass = function () {
        var x = this.pts_x;
        var y = this.pts_y;
        var length = x.length;
        var mdpts_x = new Array();
        var mdpts_y = new Array();
        var lengths = new Array();
        
        if(length==1) {
            this.center_x = x[0];
            this.center_y = y[0];
            return;
        }
        
        for(i=1; i < length; i++) {
            mdpts_x[i-1] = Math.round((x[i-1] + x[i])/2);
            mdpts_y[i-1] = Math.round((y[i-1] + y[i])/2);
            lengths[i-1] = Math.round(Math.sqrt(Math.pow(x[i-1] - x[i], 2) +
                                                Math.pow(y[i-1] - y[i], 2)));
        }
        mdpts_x[length - 1] = Math.round((x[0] + x[length - 1])/2);
        mdpts_y[length - 1] = Math.round((y[0] + y[length - 1])/2);
        lengths[i-1] = Math.round(Math.sqrt(Math.pow(x[0] - x[length - 1], 2) +
                                            Math.pow(y[0] - y[length - 1], 2)));
        
        var sumlengths = 0;
        var length_l = lengths.length;
        for(i = 0; i < length_l; i++) {
            sumlengths = sumlengths + lengths[i];
        }
        
        this.center_x = 0;
        for(i = 0; i < length_l; i++) {
            this.center_x = this.center_x + mdpts_x[i]*lengths[i];
        }
        this.center_x = this.center_x / sumlengths;
        
        this.center_y = 0;
        for(i = 0; i < length_l; i++) {
            this.center_y = this.center_y + mdpts_y[i]*lengths[i];
        }
        this.center_y = this.center_y / sumlengths;
    };
    
    // This function shows the middle grab point for a polygon
    // the point to be shown is given as input
    this.ShowCenterOfMass = function(im_ratio) {
      this.centerOfMass();
      var MarkerSize = 8;
      if(this.pts_x.length==1) MarkerSize = 6;
      this.center_id = DrawPoint(this.div_attach,this.center_x,this.center_y,'r="' + MarkerSize + '" fill="red" stroke="#ffffff" stroke-width="' + MarkerSize/2 + '"',im_ratio);
    };
    
    // This function removes the middle grab point for a polygon
    this.RemoveCenterOfMass = function() {
      if(this.center_id) {
	$('#'+this.center_id).remove();
	this.center_id = null;
      }
    };
    
    // Gets the (x,y) point where a popup bubble can be attached.
    this.GetPopupPoint = function () {
        var im_ratio = main_image.GetImRatio();
        var pt = Array(2);
        pt[0] = Math.round(this.pts_x[0]*im_ratio);
        pt[1] = Math.round(this.pts_y[0]*im_ratio);
        return pt;
    };
    
    // Returns the closest point to (x,y) that lies along the boundary of
    // the polygon.
    this.ClosestPoint = function (x,y) {
        var eps = 1e-3;
        var shortestDist = Infinity;
        var pt = new Array(3);
        var xs = this.pts_x;
        var ys = this.pts_y;
        var thisdist;
        
        for(var i=0, j=xs.length-1;i<xs.length;j=i,i++) {
            thisdist = this.dist(x,y,xs[j],ys[j]); //snap to nearby edges
            if(thisdist<shortestDist) {
                shortestDist = thisdist;
                pt[0] = xs[j];
                pt[1] = ys[j];
                pt[2] = thisdist;
            }
            
            var xi = xs[i], yi = ys[i];
            var xj = xs[j], yj = ys[j];
            
            var l = (xj-xi)*(xj-xi) + (yj-yi)*(yj-yi);
            var k = ((x-xi)*(xj-xi) + (y-yi)*(yj-yi))/l;
            var xt = k*(xj-xi)+xi;
            var yt = k*(yj-yi)+yi;
            
            if(Math.min(xi,xj)-eps <= xt && xt <= Math.max(xi,xj)+eps &&
               Math.min(yi,yj)-eps <= yt && yt <= Math.max(yi,yj)+eps) {
                thisdist = this.dist(x,y,xt,yt);
                if(thisdist<shortestDist) {
                    shortestDist = thisdist;
                    pt[0] = xt;
                    pt[1] = yt;
                    pt[2] = thisdist;
                }
            }
        }
        return pt;
    };
    
    // *******************************************
    // Private methods:
    // *******************************************
    
    // Remove first drawn point:
    this.RemoveFirstPoint = function () {
      if(this.point_id) {
	$('#'+this.point_id).remove();
	this.point_id = null;
      }
    };
    
    // This function removes all displayed control points from an annotation
    this.RemoveControlPoints = function () {
      if(this.control_ids) {
	for(var i = 0; i < this.control_ids.length; i++) $('#'+this.control_ids[i]).remove();
	this.control_ids = null;
      }
    };
    
    this.charCodeAt = function (text,position) {
        var tmp = text.substring(position,position+1);
        for(var i=1;i<=255;i++) if(unescape('%'+i.toString(16)) == tmp) return i;
        return 0;
    };
    
    this.getObjectColor = function () {
      // If the polygon has been deleted then return gray:
      if(this.GetDeleted()) return "#888888";
        
      // List of possible object colors:
      var objectColors = Array("#009900","#00ff00","#ccff00","#ffff00","#ffcc00","#ff9999","#cc0033","#ff33cc","#9933ff","#990099","#000099","#006699","#00ccff","#999900");
      
      // Pseudo-randomized case insensitive hashing based on object name:
      var name = this.GetObjName().toUpperCase(); 
      var hash = 0;
      for(var i = 0; i < name.length;i++) hash += this.charCodeAt(name,i);
      hash = (((hash + 567) * 1048797) % objectColors.length);
      
      return objectColors[hash];
    };
    
    // Compute the L2 distance between two Cartesian points.
    this.dist = function (x0,y0,x1,y1) {
        return Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
    };
}
