// Created: 04/14/2006
// Updated: 04/14/2006

// annotation class
// Keeps track of all information related to an individual
// annotation.  
function annotation(anno_id) {

  // *******************************************
  // Private variables:
  // *******************************************

  this.id;
  this.obj_name = '';
  this.username = 'anonymous';
  this.deleted = 0;
  this.verified = 0;
  this.pts_x = new Array();
  this.pts_y = new Array();
  this.is_selected;
  this.graphics = null;
  this.all_lines = null;
  this.first_point = null;
  this.anno_id = anno_id;
//   this.div_attach = 'moz_canvas';
  this.div_attach = 'myCanvas_bg';
  this.lastx = -1;
  this.lasty = -1;
  this.CloseErrorFlag = 0;
  
  // This array stores graphics objects for each control point
  this.control_points = new Array();
  this.selectedControlPoint = -1;
  this.center_point = 0;
  this.center_x;
  this.center_y;

  // *******************************************
  // Public methods:
  // *******************************************

  this.SetID = function(id) {
    this.id = id;
  };

  this.GetObjName = function () {
    return this.obj_name;
  };

  this.SetObjName = function(name) {
    this.obj_name = name;
  };
  
  this.GetUsername = function () {
    return this.username;
  };

  this.SetUsername = function(u) {
    this.username = u;
  };

  this.GetDeleted = function () {
    return this.deleted;
  };

  this.SetDeleted = function(d) {
    this.deleted = d;
  };

  this.GetVerified = function () {
    return this.verified;
  };

  this.SetVerified = function (v) {
    this.verified = v;
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

  // Refresh last control point (set to be the last entered control point):
  this.RefreshLastControlPoint = function () {
    this.lastx = this.pts_x[this.pts_x.length-1];
    this.lasty = this.pts_y[this.pts_y.length-1];
  };

  // Select this polygon.
  this.SelectPoly = function () {
    this.is_selected = 1;
  };

  // Unselect this polygon.
  this.UnselectPoly = function () {
    this.is_selected = 0;
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

    if(!this.first_point) {
      this.first_point = new graphics(this.div_attach,'first_point');
    }
    this.first_point.DrawPoint(Math.round(x*im_ratio),
			       Math.round(y*im_ratio),'#00ff00',6);

    if(IsMicrosoft()) {
      this.first_point.SetAttribute('onmousedown',function() {var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);});
      this.first_point.SetAttribute('onmouseover',function() {main_handler.MousedOverFirstControlPoint();});
    }
    else {
      this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
      this.first_point.SetAttribute('onmouseover','main_handler.MousedOverFirstControlPoint();');
//       this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;parent.main_handler.DrawCanvasMouseDown(event);');
//       this.first_point.SetAttribute('onmouseover','parent.main_handler.MousedOverFirstControlPoint();');
    }

    this.lastx = x;
    this.lasty = y;
  };
  
  // Adds a new control point to the polygon.
  this.AddControlPoint = function (x,y) {
    if(this.CloseErrorFlag) {
      this.CloseErrorFlag = 0;
      return;
    }
    x = Math.round(x/main_image.GetImRatio());
    y = Math.round(y/main_image.GetImRatio());

    // 7.31.06 - disallow making a point at x=1. move it to x=2 instead.
    // This is because where there are points at x=1, there are lines 
    // missing.
    if(x==1) {
      x=2;
    }

    this.pts_x.push(x);
    this.pts_y.push(y);

    if(!this.all_lines) this.all_lines = Array();

    var line_idx = this.all_lines.length;
    var color = '#0000ff'; // blue
    this.all_lines.push(new graphics(this.div_attach,
				     'sGraphics'+this.anno_id+'_'+line_idx));
    this.all_lines[line_idx].DrawLineSegment(this.lastx,this.lasty,x,y,
					     main_image.GetImRatio(),color);
    this.all_lines[line_idx].SetAttribute('style','cursor:crosshair;');

    if(IsMicrosoft()) {
      this.all_lines[line_idx].SetAttribute('onmousedown',function() {main_handler.DrawCanvasMouseDown(window.event); return false;});
    }
    
    // Move the first control point to be on top of any drawn lines.
    this.first_point.MoveToTop();

    this.lastx = x;
    this.lasty = y;
  };

  // Closes the polygon.  Returns 1 if close was successful, 0 otherwise.
  this.ClosePolygon = function () {
    if(this.pts_x.length<=2) {
      alert("The current polygon must have at least 3 points.");
      this.CloseErrorFlag = 1;
      return 0;
    }
    this.lastx = -1;
    this.lasty = -1;
    return 1;
  };

  // Set attribute of drawn polygon.
  this.SetAttribute = function(field,value) {
    this.graphics.SetAttribute(field,value);
  };

  // Draw a polygon given this annotation's control points.
  this.DrawPolygon = function (im_ratio) {
    if(!this.graphics) {
      this.graphics = new graphics(this.div_attach,'sGraphics'+this.anno_id);
    }
    this.graphics.DrawPolygon(this.pts_x,this.pts_y,
			      this.getObjectColor(this.anno_id),im_ratio,this.obj_name);

  };
  
  // Draw a poly-line given this annotation's control points (i.e. 
  // don't connect the last point to the first point).  This function
  // is used when we zoom.
  this.DrawPolyLine = function (im_ratio) {
    var color = '#0000ff'; // blue
    var im_ratio = main_image.GetImRatio();
    if(!this.all_lines) this.all_lines = Array();
    else {
      for(var i = 0; i < this.all_lines.length; i++) {
	this.all_lines[i].ClearDrawing();
      }
      this.all_lines = Array();
    }
    for(var i = 0; i < this.pts_x.length-1; i++) {
      this.all_lines.push(new graphics(this.div_attach,'sGraphics'+this.anno_id+'_'+(i-1)));
      this.all_lines[i].DrawLineSegment(this.pts_x[i],this.pts_y[i],
					  this.pts_x[i+1],this.pts_y[i+1],
					  im_ratio,color);
      if(IsMicrosoft()) {
	this.all_lines[i].SetAttribute('onmousedown',function() {main_handler.DrawCanvasMouseDown(window.event); return false;});
      }
      this.all_lines[i].SetAttribute('style','cursor:crosshair;');
    }

    if(this.first_point) {
      this.first_point.ClearDrawing();
    }
    this.first_point = new graphics(this.div_attach,'first_point');
    this.first_point.DrawPoint(Math.round(this.pts_x[0]*im_ratio),
			       Math.round(this.pts_y[0]*im_ratio),'#00ff00',6);

    if(IsMicrosoft()) {
      this.first_point.SetAttribute('onmousedown',function() {var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);});
      this.first_point.SetAttribute('onmouseover',function() {main_handler.MousedOverFirstControlPoint();});
    }
    else {
      this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
      this.first_point.SetAttribute('onmouseover','main_handler.MousedOverFirstControlPoint();');
//       this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;parent.main_handler.DrawCanvasMouseDown(event);');
//       this.first_point.SetAttribute('onmouseover','parent.main_handler.MousedOverFirstControlPoint();');
    }
  };

  // Deletes the annotation's polygon from the screen.
  this.DeletePolygon = function () {
    if(this.graphics) {
      this.graphics.ClearDrawing();
      this.graphics = null;
    }
    this.RemoveFirstPoint();
    this.RemoveAllLines();
    this.RemoveControlPoints();
    this.RemoveCenterOfMass();
  };

  // Deletes the last control point that the user entered.
  this.DeleteLastControlPoint = function () {
    if(this.pts_x.length>1) {
      if(this.all_lines) {
	var l = this.all_lines.length;
	this.all_lines[l-1].ClearDrawing();
	this.all_lines = this.all_lines.slice(0,l-1);
      }
      else {
	this.all_lines[0].ClearDrawing();
	this.all_lines = null;
      }
      this.ShortenPts();
      return 1;
    }
    return 0;
  };

  // Fill the interior of the polygon.
  this.FillPolygon = function () {
    this.graphics.FillPolygon();
  };

  // Unfill the interior of the polygon.
  this.UnfillPolygon = function () {
    this.graphics.UnfillPolygon();
  };

  // When you move the mouse over the first control point, then make it 
  // bigger to indicate it should be clicked on.  Do this if two or more 
  // lines have been drawn.
  this.MouseOverFirstPoint = function () {
    if(this.pts_x.length>=3) {
      var im_ratio = main_image.GetImRatio();
      this.RemoveFirstPoint();
      this.first_point = new graphics(this.div_attach,'first_point');
      this.first_point.DrawPoint(Math.round(this.pts_x[0]*im_ratio),
				 Math.round(this.pts_y[0]*im_ratio),'#00ff00',8);
      if(IsMicrosoft()) {
	this.first_point.SetAttribute('onmousedown',function() {var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);});
	this.first_point.SetAttribute('onmouseout',function() {main_handler.MousedOutFirstControlPoint();});
      }
      else {
	this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
	this.first_point.SetAttribute('onmouseout','main_handler.MousedOutFirstControlPoint();');
// 	this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;parent.main_handler.DrawCanvasMouseDown(event);');
// 	this.first_point.SetAttribute('onmouseout','parent.main_handler.MousedOutFirstControlPoint();');
      }
      this.first_point.SetAttribute('style','cursor:pointer;');
    }
  };

  // When you move the mouse over the first control point, then make it 
  // bigger to indicate it should be clicked on.  Do this if two or more 
  // lines have been drawn.
  this.MouseOutFirstPoint = function () {
    var im_ratio = main_image.GetImRatio();
    this.RemoveFirstPoint();
    this.first_point = new graphics(this.div_attach,'first_point');
    this.first_point.DrawPoint(Math.round(this.pts_x[0]*im_ratio),
			       Math.round(this.pts_y[0]*im_ratio),'#00ff00',6);
    if(IsMicrosoft()) {
      this.first_point.SetAttribute('onmousedown',function() {var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);});
      this.first_point.SetAttribute('onmouseover',function() {main_handler.MousedOverFirstControlPoint();});
    }
    else {
      this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;main_handler.DrawCanvasMouseDown(event);');
      this.first_point.SetAttribute('onmouseover','main_handler.MousedOverFirstControlPoint();');
//       this.first_point.SetAttribute('onmousedown','var event=new Object(); event.button=2;parent.main_handler.DrawCanvasMouseDown(event);');
//       this.first_point.SetAttribute('onmouseover','parent.main_handler.MousedOverFirstControlPoint();');
    }
  };

  // This function shows all control points for an annotation it takes in 
  // arrays of x and y points
  this.ShowControlPoints = function () {
    var im_ratio = main_image.GetImRatio();
    if(!this.control_points) this.control_points = new Array();
    for(i=0; i<this.pts_x.length; i++) {
      this.control_points.push(new graphics(this.div_attach,this.anno_id + ':ctrl_point#'+ i));
      this.control_points[i].DrawPoint(Math.round(this.pts_x[i]*im_ratio),Math.round(this.pts_y[i]*im_ratio),'#00ff00',5);
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

    // Adjust polygon:
    this.graphics.ClearDrawing();
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
    
    // Adjust polygon:
    this.graphics.ClearDrawing();
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
    if(!this.center_point) {
      this.center_point = new graphics(this.div_attach,'center_point');
    }
    this.center_point.DrawPoint(Math.round(this.center_x*im_ratio),
				Math.round(this.center_y*im_ratio),'red',8);
  };
  
  // This function removes the middle grab point for a polygon
  this.RemoveCenterOfMass = function() {
    if(this.center_point) {
      this.center_point.ClearDrawing();
      this.center_point = null;
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

  this.RemoveFirstPoint = function () {
    if(this.first_point) {
      this.first_point.ClearDrawing();
      this.first_point = null;
    }
  };

  // Remove all lines.
  this.RemoveAllLines = function () {
    if(this.all_lines) {
      for(var i = 0; i < this.all_lines.length; i++) {
	this.all_lines[i].ClearDrawing();
      }
      this.all_lines = null;
    }
  };

  // This function removes all displayed control points from an annotation
  this.RemoveControlPoints = function () {
    if(this.control_points) {
      for(i=0; i<this.control_points.length; i++) {
	this.control_points[i].ClearDrawing();
      }
      this.control_points = null;
    }
  };
   
  this.charCodeAt = function (text,position) {
    var tmp = text.substring(position,position+1);
    for(var i=1;i<=255;i++) if(unescape('%'+i.toString(16)) == tmp) return i;
    return 0;
  };

  this.getObjectColor = function (p) {
    //if the polygon is still open, then its color should be blue.  (7.27.06)
    if(this.is_selected && (this.lastx!=-1)) return "#0000ff";
    if(this.deleted) return "#888888";

    //otherwise:
    var objectColors = new Array(14);
    objectColors[0] = "009900"; // good
    objectColors[1] = "00ff00"; // maybe
    objectColors[2] = "ccff00"; // good
    objectColors[3] = "ffff00"; // same as 2
    objectColors[4] = "ffcc00"; // maybe
    objectColors[5] = "ff9999"; // good
    objectColors[6] = "cc0033"; // maybe
    objectColors[7] = "ff33cc"; // good
    objectColors[8] = "9933ff"; // maybe
    objectColors[9] = "990099"; // bad
    objectColors[10] = "000099"; // bad
    objectColors[11] = "006699"; // bad
    objectColors[12] = "00ccff"; // good
    objectColors[13] = "999900"; // bad

    // case insensative hashing:
    var name = this.obj_name.toUpperCase(); 
    var hash = 0;
    for(var i=0;i<name.length;i++) { //hash code based on name
      hash += this.charCodeAt(name,i);
    }
    hash = (((hash + 567) * 1048797) % 14); //pseudo-randomize
    return "#"+ objectColors[hash];
  };

  this.ShortenPts = function () {
    var l = this.pts_x.length;
    this.pts_x = this.pts_x.slice(0,l-1);
    this.pts_y = this.pts_y.slice(0,l-1);
    this.lastx = this.pts_x[l-2];
    this.lasty = this.pts_y[l-2];
  };

  // Compute the L2 distance between two Cartesian points.
  this.dist = function (x0,y0,x1,y1) {
    return Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
  };
}
