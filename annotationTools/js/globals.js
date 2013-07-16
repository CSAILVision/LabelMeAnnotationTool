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

// Boolean indicating whether a control point is being edited:
isEditingControlPoint = 0;

// Boolean indicating whether the center of mass of the polygon is being 
// adjusted:
isMovingCenterOfMass = 0;

// Boolean indicating whether the control points were edited:
editedControlPoints = 0;
