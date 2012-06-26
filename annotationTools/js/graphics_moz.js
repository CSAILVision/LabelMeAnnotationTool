// Created: 03/01/2007
// Updated: 03/06/2007

// graphics class
// Implements graphics/drawing routines for the labeling tool.

function graphics(div_attach,name) {
		
  // *******************************************
  // Private variables:
  // *******************************************
  this.name = name;
		
  //the way the template is set up in line1.svg, this input needs to be
  //"MyCanvas"
  this.div_attach = div_attach;

  this.drawn_obj;
  this.svgNS = "http://www.w3.org/2000/svg";
  this.xlinkNS = "http://www.w3.org/1999/xlink";
  
  // *******************************************
  // Public methods:
  // *******************************************
  
  // Draw a polygon given an array of control points X and Y.
  // Returns the polygon element
  this.DrawPolygon = function(X,Y,color,scale,obj_name) {
    var poly_points = "";
    
    for(i = 0; i < X.length; i++) {
      poly_points = poly_points + (scale*X[i]) + "," + 
	(scale*Y[i]) + " ";
    }
    
    var anchor_obj = document.createElementNS(this.svgNS,"a");
    anchor_obj.setAttributeNS(this.xlinkNS,"title",obj_name);
    document.getElementById(this.div_attach).appendChild(anchor_obj);

    this.drawn_obj = document.createElementNS(this.svgNS,"polygon");
    this.drawn_obj.setAttributeNS(null,"id",this.name);
//     this.drawn_obj.setAttributeNS(null,"title",obj_name);
    this.drawn_obj.setAttributeNS(null,"points",poly_points);	
    this.drawn_obj.setAttributeNS(null,"fill","none");
    this.drawn_obj.setAttributeNS(null,"stroke",color);
    this.drawn_obj.setAttributeNS(null,"stroke-width","4");
    anchor_obj.appendChild(this.drawn_obj);
//     document.getElementById(this.div_attach).appendChild(this.drawn_obj);
  };

  // Fill the drawn object.
  this.FillPolygon = function () {
    this.drawn_obj.setAttributeNS(null,"fill","red");
    this.drawn_obj.setAttributeNS(null,"fill-opacity","0.5");
  };

  // Unfill the drawn object.
  this.UnfillPolygon = function () {
    this.drawn_obj.setAttributeNS(null,"fill","none");
  };
		
  // Draw a line given starting coordinates and ending coordinates.
  // Returns the line element
  this.DrawLineSegment = function(x1,y1,x2,y2,scale,color) {
    this.drawn_obj = document.createElementNS(this.svgNS,"line");
    this.drawn_obj.setAttributeNS(null,"id",this.name);
    this.drawn_obj.setAttributeNS(null,"x1",x1*scale);
    this.drawn_obj.setAttributeNS(null,"x2",x2*scale);
    this.drawn_obj.setAttributeNS(null,"y1",y1*scale);
    this.drawn_obj.setAttributeNS(null,"y2",y2*scale);
    this.drawn_obj.setAttributeNS(null,"stroke",color);
    this.drawn_obj.setAttributeNS(null,"stroke-width","4");
    document.getElementById(this.div_attach).appendChild(this.drawn_obj);
  };
  
  // Draw a point given coordinates.  Returns the point element
  this.DrawPoint = function(x,y,color,width) {
    this.drawn_obj = document.createElementNS(this.svgNS,"circle");
    this.drawn_obj.setAttributeNS(null,"id",this.name);
    this.drawn_obj.setAttributeNS(null,"cx",x);
    this.drawn_obj.setAttributeNS(null,"cy",y);
    this.drawn_obj.setAttributeNS(null,"r",width);
    this.drawn_obj.setAttributeNS(null,"fill",color);
    this.drawn_obj.setAttributeNS(null,"stroke","#ffffff");
    this.drawn_obj.setAttributeNS(null,"stroke-width",width/2);
    document.getElementById(this.div_attach).appendChild(this.drawn_obj);
  };
		
  // Clear all drawings related to this object.
  this.ClearDrawing = function () {
    var q = document.getElementById(this.name);
    if(q) q.parentNode.removeChild(q);
    this.drawn_obj = null;
  };
  
  // Sets an attribute for the drawn object.
  this.SetAttribute = function(field,value) {
    this.drawn_obj.setAttributeNS(null,field,value);
  };

  // Move this drawn element to the top in the depth ordering.
  this.MoveToTop = function () {
    var q = document.getElementById(this.name);
    if(q) q.parentNode.appendChild(q);
  };

  // Change the canvas.
  this.ChangeCanvas = function (div_attach) {
    this.div_attach = div_attach;
  };

  // Draw a polyline given an array of control points X and Y.
  // Returns the polygon element
  this.DrawPolyLine = function(X,Y, color, scale) {
    var poly_points = "";
    for(i = 0; i < X.length; i++) {
      poly_points = poly_points + (scale*X[i]) + "," + (scale*Y[i]) + " ";
    }
    
    this.drawn_obj = document.createElementNS(this.svgNS,"polyline");
    this.drawn_obj.setAttributeNS(null,"id",name);
    this.drawn_obj.setAttributeNS(null,"points",poly_points);	
    this.drawn_obj.setAttributeNS(null,"fill","none");
    this.drawn_obj.setAttributeNS(null,"stroke",color);
    this.drawn_obj.setAttributeNS(null,"stroke-width","4");
    document.getElementById(this.div_attach).appendChild(this.drawn_obj);
  };

  // *******************************************
  // Private methods:
  // *******************************************

}
