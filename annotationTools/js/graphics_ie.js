// Created: 03/01/2007
// Updated: 03/06/2007

// VML graphics class
// Implements graphics/drawing routines for the labeling tool.

function graphics(div_attach, name) {
		
  // *******************************************
  // Private variables:
  // *******************************************	
  this.name = name;
  this.div_attach = div_attach;
  
  var drawn_obj;
		
  // *******************************************
  // Public methods:
  // *******************************************
  
  // Draw a polygon given an array of control points X and Y.
  // returns the polygon element
  this.DrawPolygon = function(X,Y, color, scale,obj_name) {
    var num_Points = X.length;  	
    var poly_points = "";
    
    for(i = 0; i < num_Points; i++) {
      var x_Coord = X[i];
      var y_Coord = Y[i];
      poly_points = poly_points + (X[i]*scale) + "px," + (Y[i]*scale) + "px,";
    }
    
    poly_points = poly_points + (X[0]*scale) + "px," + (Y[0]*scale) + "px";
    
    var VML_str = '<v:polyline id="' + this.name + '" title="' + obj_name + '" points="' + poly_points + '" strokecolor="'+ color +'" strokeweight="4px" filled="false" fillcolor="red" style="position:absolute;left:0pt;top:0pt;" />';
    InsertAfterDiv(VML_str, this.div_attach);
    
    this.drawn_obj = document.getElementById(this.name);	
  };


   // Draw a polyline given an array of control points X and Y.
  // returns the polyline element
  this.DrawPolyLine = function(X,Y, color, scale) {
    var num_Points = X.length;  	
    var poly_points = "";
    
    for(i = 0; i < num_Points; i++) {
      var x_Coord = X[i];
      var y_Coord = Y[i];
      poly_points = poly_points + (X[i]*scale) + "px," + (Y[i]*scale) + "px,";
    }
    
    
    
    var VML_str = '<v:polyline id="' + this.name + '" points="' + poly_points + '" strokecolor="'+ color +'" strokeweight="4px" filled="false" fillcolor="red" style="position:absolute;left:0pt;top:0pt;" />';
    InsertAfterDiv(VML_str, this.div_attach);
    
    this.drawn_obj = document.getElementById(this.name);	
  };

  		
  // Fill the drawn object.
  this.FillPolygon = function () {
    this.drawn_obj = document.getElementById(this.name);
    this.drawn_obj.setAttribute("filled","true");
    this.drawn_obj.setAttribute("fillcolor","red");
    
    if (document.getElementById(this.name + "_fill") == null) {
      var fill=document.createElement("v:fill");
      fill.setAttribute("id", this.name + "_fill");
      fill.setAttribute("opacity", "0.5");
      this.drawn_obj.appendChild(fill);
    }
  };

  // Unfill the drawn object.
  this.UnfillPolygon = function () {
    this.drawn_obj = document.getElementById(this.name);
    this.drawn_obj.setAttribute("filled","false");
  };
  
  // Draw a line given starting coordinates and ending coordinates
  this.DrawLineSegment = function(x1,y1,x2,y2, scale, color) {
    var VML_str = '<v:line id="' + this.name + '" from="' + (x1*scale) + 'px,' + (y1*scale) + 'px" to="'+ (x2*scale) + 'px,' + (y2*scale) + 'px" strokecolor="' + color + '" strokeweight="4px" style="position:absolute;left:0pt;top:0pt;" />';
    InsertAfterDiv(VML_str, this.div_attach);
    this.drawn_obj = document.getElementById(this.name);
  };
	
  // Draw a point given coordinates
  this.DrawPoint = function(x,y, color, width) {
    var VML_str = '<v:oval id="' + this.name + '" fillcolor="' + color + '" style="position:absolute;left:' + (x-width) + 'px;top:' + (y-width) + 'px;width:' + (2*width) + 'px;height:' + (2*width) + 'px;" strokecolor="#ffffff" strokeweight="' + (width/2) + '" oncontextmenu="return false;" />';
    InsertAfterDiv(VML_str, this.div_attach);
    this.drawn_obj = document.getElementById(this.name);
  };

  // Clear all drawings related to this object.
  this.ClearDrawing = function () {
    var q = document.getElementById(this.name);
    if(q) q.parentNode.removeChild(q);
    this.drawn_obj = null;
  };
    
  // Sets an attribute for the drawn object.
  this.SetAttribute = function(field,value) {
    switch(field) {
      case 'style':
        var f = value.substring(0,value.indexOf(':'));
        var v = value.substring(value.indexOf(':')+1,value.length-1);
        this.drawn_obj.style.setAttribute(f,v);
        break;
      default:
        this.drawn_obj.setAttribute(field,value);
    }
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

  // *******************************************
  // Private methods:
  // *******************************************
}
