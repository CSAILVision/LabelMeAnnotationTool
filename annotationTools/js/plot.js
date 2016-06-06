// This file contains functions for plotting polygons, lines, points, etc. 
// onto an SVG canvas.

// Plots all the LabelMe annotations and returns the DOM element id.
function LMplot(xml,imagename) {
  // Display image:
  $('body').append('<svg id="canvas" width="2560" height="1920" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image id="img" xlink:href="' + imagename + '" x="0" y="0" height="1920" width="2560" /></svg>');

  // Display polygons:
  var N = $(xml).children("annotation").children("object").length;
  for(var i = 0; i < N; i++) {
    var obj = $(xml).children("annotation").children("object").eq(i);
    if(!parseInt(obj.children("deleted").text())) {
      // Get object name:
      var name = obj.children("name").text();

      // Get points:
      var X = Array();
      var Y = Array();
      for(var j = 0; j < obj.children("polygon").children("pt").length; j++) {
  X.push(parseInt(obj.children("polygon").children("pt").eq(j).children("x").text()));
  Y.push(parseInt(obj.children("polygon").children("pt").eq(j).children("y").text()));
      }

      // Draw polygon:
      var attr = 'fill="none" stroke="' + HashObjectColor(name) + '" stroke-width="4"';
      var scale = 1;
      DrawPolygon('canvas',X,Y,name,attr,scale);
    }
  }

  return 'canvas';
}

// Draws a polygon.  Returns DOM element id of drawn polygon.
//   element_id - String containing DOM element id to attach to.
//   X - Array with X coordinates.
//   Y - Array with Y coordinates.
//   obj_name - String with object name (empty string if no name).
//   attr - String containing polygon attributes.
//   scale - Scalar value to scale X,Y coordinates (optional).
function DrawPolygon(element_id,X,Y,obj_name,attr,scale) {
  // Create string of the points ("x1,y1 x2,y2 x3,y3 ..."):
  var poly_points = "";
  for(var i = 0; i < X.length; i++) poly_points += (scale*X[i]) + "," + (scale*Y[i]) + " ";
  
  // Get drawn object DOM element id:
  var dom_id = element_id + '_obj' + $('#'+element_id).children().length + '_' + Math.floor(Math.random()*100000);

  // Draw polygon:
  $('#'+element_id).append('<a xmlns="http://www.w3.org/2000/svg"> <polygon xmlns="http://www.w3.org/2000/svg" id="' + dom_id + '" points="' + poly_points + '" ' + attr + ' /><title xmlns="http://www.w3.org/2000/svg">' + obj_name + '</title></a>');

  return dom_id;
}

// Draw a flag given a point (X,Y).  Returns DOM element id of drawn flag.
//   element_id - String containing DOM element id to attach to.
//   X - Scalar with X coordinate.
//   Y - Scalar with Y coordinate.
//   obj_name - String with object name (empty string if no name).
//   scale - Scalar value to scale X,Y coordinates (optional).
function DrawFlag(element_id,x,y,obj_name,scale) {
  // Apply scale:
  x *= scale; y *= scale;

  // Apply flag location offset:
  x -= 12; y -= 38;
  
  // Get drawn object DOM element id:
  var dom_id = element_id + '_obj' + $('#'+element_id).children().length;

  // Draw flag:
  $('#'+element_id).append('<a xmlns="http://www.w3.org/2000/svg"><image xmlns="http://www.w3.org/2000/svg" id="' + dom_id + '" width="36" height="43" x="' + x + '" y="' + y + '" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="Icons/flag.png" /></a>');

  return dom_id;
}

// Draw a polyline.  Returns DOM element id of drawn polyline.
//   element_id - String containing DOM element id to attach to.
//   X - Array with X coordinates.
//   Y - Array with Y coordinates.
//   obj_name - String with object name (empty string if no name).
//   attr - String containing polygon attributes.
//   scale - Scalar value to scale X,Y coordinates (optional).
function DrawPolyLine(element_id,X,Y,obj_name,attr,scale) {
  // Create string of the points ("x1,y1 x2,y2 x3,y3 ..."):
  var poly_points = "";
  for(var i = 0; i < X.length; i++) poly_points += (scale*X[i]) + "," + (scale*Y[i]) + " ";
  
  // Get drawn object DOM element id:
  var dom_id = element_id + '_obj' + $('#'+element_id).children().length;

  // Draw polyline:
  $('#'+element_id).append('<a xmlns="http://www.w3.org/2000/svg"> <polyline xmlns="http://www.w3.org/2000/svg" id="' + dom_id + '" points="' + poly_points + '" ' + attr + ' /></a>');

  return dom_id;
}

// Draw a line segment given starting coordinates and ending coordinates.
function DrawLineSegment(element_id,x1,y1,x2,y2,attr,scale) {
  // Get drawn object DOM element id:
  var dom_id = element_id + '_line' + $('#'+element_id).children().length;

  // Draw line segment:
  $('#'+element_id).append('<line xmlns="http://www.w3.org/2000/svg" id="' + dom_id + '" x1="' + x1*scale + '" x2="' + x2*scale + '" y1="' + y1*scale + '" y2="' + y2*scale + '" ' + attr + ' />');

  return dom_id;
}
  
// Draw a point.
function DrawPoint(element_id,x,y,attr,scale) {
  // Get drawn object DOM element id:
  var dom_id = element_id + '_point' + $('#'+element_id).children().length;

  // Draw point:
  $('#'+element_id).append('<circle xmlns="http://www.w3.org/2000/svg" id="' + dom_id + '" cx="' + x*scale + '" cy="' + y*scale + '" ' + attr + ' />');

  return dom_id;
}

function HashObjectColor(name) {
  // List of possible object colors:
  var objectColors = Array("#009900","#00ff00","#ccff00","#ffff00","#ffcc00","#ff9999","#cc0033","#ff33cc","#9933ff","#990099","#000099","#006699","#00ccff","#999900");
  
  // Pseudo-randomized case insensitive hashing based on object name:
  var hash = 0;
  name = name.toUpperCase(); 
  for(var i = 0; i < name.length;i++) {
    var tmp = name.substring(i,i+1);
    for(var j = 1; j <= 255; j++) {
      if(unescape('%'+j.toString(16)) == tmp) {
  hash += j;
  break;
      }
    }
  }
  hash = (((hash + 567) * 1048797) % objectColors.length);
  
  return objectColors[hash];
}

// Fill the interior of a polygon.  Input is DOM element id.
function FillPolygon(id) {
  if(id) {
    $('#'+id).attr("fill",$('#'+id).attr("stroke"));
    $('#'+id).attr("fill-opacity","0.5");
  }
}
function ShadePolygon(id) {
  if(id) {
    $('#'+id).attr("fill",'red');
    $('#'+id).attr("fill-opacity","1");
    $('#'+id).attr("stroke-width", "0");
  }
}
    
