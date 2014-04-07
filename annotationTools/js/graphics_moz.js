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
  
  // *******************************************
  // Public methods:
  // *******************************************
  
  // Draw a polygon given an array of control points X and Y.
  // Returns the polygon element
  this.DrawPolygon = function(X,Y,color,scale,obj_name) {
    // Create string of the points ("x1,y1 x2,y2 x3,y3 ..."):
    var poly_points = "";
    for(var i = 0; i < X.length; i++) poly_points += (scale*X[i]) + "," + (scale*Y[i]) + " ";

    // Draw polygon:
    $('#' + this.div_attach).append('<a xmlns="http://www.w3.org/2000/svg"><polygon xmlns="http://www.w3.org/2000/svg" id="' + this.name + '" points="' + poly_points + '" fill="none" stroke="' + color + '" stroke-width="4" /><title xmlns="http://www.w3.org/2000/svg">' + obj_name + '</title></a>');
  };

  // Draw a dashed polygon given an array of control points X and Y.
  // Returns the polygon element
  this.DrawDashedPolygon = function(X,Y,color,scale,obj_name) {
    // Create string of the points ("x1,y1 x2,y2 x3,y3 ..."):
    var poly_points = "";
    for(var i = 0; i < X.length; i++) poly_points += (scale*X[i]) + "," + (scale*Y[i]) + " ";

    // Draw dashed polygon:
    $('#' + this.div_attach).append('<a xmlns="http://www.w3.org/2000/svg"><polygon xmlns="http://www.w3.org/2000/svg" id="' + this.name + '" points="' + poly_points + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-dasharray="9,5" /><title xmlns="http://www.w3.org/2000/svg">' + obj_name + '</title></a>');
  };

  // Draw a line segment given starting coordinates and ending coordinates.
  this.DrawLineSegment = function(x1,y1,x2,y2,scale,color) {
    $('#' + this.div_attach).append('<line xmlns="http://www.w3.org/2000/svg" id="' + this.name + '" x1="' + x1*scale + '" x2="' + x2*scale + '" y1="' + y1*scale + '" y2="' + y2*scale + '" stroke="' + color + '" stroke-width="4" />');
  };
  
  // Draw a point given coordinates.
  this.DrawPoint = function(x,y,color,width) {
    $('#' + this.div_attach).append('<circle xmlns="http://www.w3.org/2000/svg" id="' + this.name + '" cx="' + x + '" cy="' + y + '" r="' + width + '" fill="' + color + '" stroke="#ffffff" stroke-width="' + width/2 + '" />');
  };
		
  // Draw a flag given coordinates.
  this.DrawFlag = function(x,y) {
    // Apply flag location offset:
    x -= 12; y -= 38;

    $('#' + this.div_attach).append('<image xmlns="http://www.w3.org/2000/svg" id="' + this.name + '" width="36" height="43" x="' + x + '" y="' + y + '" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="Icons/flag.png" />');
  };
		
  // Draw a polyline given an array of control points X and Y.
  // Returns the polygon element
  this.DrawPolyLine = function(X,Y, color, scale) {
    // Create string of the points ("x1,y1 x2,y2 x3,y3 ..."):
    var poly_points = "";
    for(var i = 0; i < X.length; i++) poly_points += (scale*X[i]) + "," + (scale*Y[i]) + " ";
    
    // Draw polyline:
    $('#' + this.div_attach).append('<polyline xmlns="http://www.w3.org/2000/svg" id="' + this.name + '" points="' + poly_points + '" fill="none" stroke="' + color + '" stroke-width="4" />');
  };

  // Sets an attribute for the drawn object.
  this.SetAttribute = function(field,value) {
    var v = $('#' + this.name).attr(field);
    if(v != null) value += v;
    $('#' + this.name).attr(field,value);
  };
}
