// This file contains global variables used in LabelMe.

// Parsed LabelMe XML file. Manipulate this variable with jquery.
var LM_xml;

// URL of CGI script to submit XML annotation:
var SubmitXmlUrl = 'annotationTools/perl/submit.cgi';

// LabelMe username:
var username = 'anonymous';

// Boolean indicating whether user is currently signing in (this should be abstracted into class):
var username_flag = 0;

// Boolean indicating if we will use attributes. This should be read from the URL and set to 0 by default.
var use_attributes = 1; // if this is 0, then it will remove all the attributes from the bubble.
var use_parts = 1; // if this is 0 disapears the message from the bubble

// for now, let's remove the attributes in MT mode. Just in case anybody is trying this.
if (getQueryVariable('mode')=='mt'){
    use_attributes=0;
    use_parts = 0;
}

// Boolean indicating whether the control points were edited:
var editedControlPoints = 0;

// Scalar indicating which polygon is selected; -1 means no polygon is selected
var selected_poly = -1;

// Array storing all of the annotation structures.  Eventually this will be 
// removed since we should read directly from LM_xml.
var AllAnnotations = Array(0);

// Class with functions to handle actions/events.
var main_handler;

// Canvas that renders polygons at rest state.
var main_canvas;

// Holds image.
var main_media;

// URL of XHTML namespace. This is needed for generating SVG elements.
var xhtmlNS = 'http://www.w3.org/1999/xhtml';

// Website that refers to LabelMe:
var ref;

var scribble_mode = true;

var video_mode = false;
