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
    
    // Element id of drawn polygon:
    this.polygon_id = null;

    // Element ids of drawn line segments:
    this.line_ids = null;

    // Element id for drawn first point:
    this.point_id = null;
    
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
    
    // Set attribute of drawn polygon.
    this.SetAttribute = function(field,value) {
      $('#'+this.polygon_id).attr(field,value);
    };
    
    // Set CSS attribute of drawn polygon.
    this.SetCSS = function(field,value) {
      $('#'+this.polygon_id).css(field,value);
    };
    
    // Draw a polygon given this annotation's control points.
    this.DrawPolygon = function (im_ratio) {
      // Determine if an angle has been labeled:
      var strtok = this.GetObjName().split(/ /);
      var isAngle = 0;
      for(var i = 0; i < strtok.length; i++) if(strtok[i]=='angle') isAngle = 1;
      
      if(this.GetPtsX().length==1) {
	this.polygon_id = DrawFlag(this.div_attach,this.GetPtsX()[0],this.GetPtsY()[0],this.GetObjName(),im_ratio);
      }
      else if((this.GetPtsX().length==3) && isAngle) {
	var attr = 'fill="none" stroke="' + HashObjectColor(this.GetObjName()) + '" stroke-width="4"';
	this.polygon_id = DrawPolyLine(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      else if(this.GetAutomatic()==1) {
	// Draw a dashed polygon:
	var attr = 'fill="none" stroke="' + HashObjectColor(this.GetObjName()) + '" stroke-width="4" stroke-dasharray="9,5"';
	this.polygon_id = DrawPolygon(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      else {
	// Draw a polygon:
	var attr = 'fill="none" stroke="' + HashObjectColor(this.GetObjName()) + '" stroke-width="4"';
	this.polygon_id = DrawPolygon(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      return this.polygon_id;
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
      $('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
      $('#'+this.point_id).attr('onmouseover','main_handler.MousedOverFirstControlPoint();');
    };
    
    // Deletes the annotation's polygon from the screen.
    this.DeletePolygon = function () {
      // Remove drawn polygon:
      if(this.polygon_id) {
	$('#'+this.polygon_id).remove();
	this.polygon_id = null;
      }

      // Remove all line segments for partially-drawn polygon:
      if(this.line_ids) {
	for(var i = 0; i < this.line_ids.length; i++) $('#'+this.line_ids[i]).remove();
	this.line_ids = null;
      }

      // Remove first drawn point:
      this.RemoveFirstPoint();
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
      FillPolygon(this.polygon_id);
    };
    
    // Unfill the interior of the polygon.
    this.UnfillPolygon = function () {
      if(this.polygon_id) $('#'+this.polygon_id).attr("fill","none");
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
	$('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
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
      $('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
      $('#'+this.point_id).attr('onmouseover','main_handler.MousedOverFirstControlPoint();');
      $('#'+this.point_id).css('cursor','pointer');
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
    
    // Compute the L2 distance between two Cartesian points.
    this.dist = function (x0,y0,x1,y1) {
        return Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
    };
}
