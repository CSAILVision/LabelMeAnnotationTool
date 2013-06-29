// This file contains global variables used in LabelMe.

// Parsed LabelMe XML file. Manipulate this variable with jquery.
var LM_xml;

// LabelMe username:
var username = 'anonymous';

// Boolean indicating whether user is currently signing in (this should be abstracted into class):
var username_flag = 0;

// Boolean indicating if we will use attributes. This should be read from the URL and set to 0 by default.
var use_attributes = 1; // if this is 0, then it will remove all the attributes from the bubble.
