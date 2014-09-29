// This file contains global variables and functions.  This file
// should be minimized and abstracted whenever possible.  It is 
// best to refrain from adding new variables/functions to this
// file.

var wait_for_input;
var edit_popup_open = 0;
var num_orig_anno;
var global_count = 0;
var req_submit;
var submission_edited = 0; // If polygon has been edited.

// Allowable user actions:
var action_CreatePolygon = 1;
var action_RenameExistingObjects = 0;
var action_ModifyControlExistingObjects = 0;
var action_DeleteExistingObjects = 0;

// Which polygons are visible:
var view_Existing = 1;
var view_Deleted = 0;

// Flag for right-hand object list:
var view_ObjList = true;

// MT variables:
var LMbaseurl = 'http://' + window.location.host + window.location.pathname;
var MThelpPage = 'annotationTools/html/mt_instructions.html';
var externalSubmitURL = 'http://mturk.com/mturk/externalSubmit';
var externalSubmitURLsandbox = 'http://workersandbox.mturk.com/mturk/externalSubmit';
var mt_N = 'inf';

var object_choices = '...';

// Access LabelMe object field.
// i - object index
// fieldname - object field name, e.g. "name", "deleted"
function LMgetObjectField(xml,i,fieldname) {
  if(!xml.getElementsByTagName('object')[i] || !xml.getElementsByTagName('object')[i].getElementsByTagName(fieldname)[0]) return "";
  return xml.getElementsByTagName('object')[i].getElementsByTagName(fieldname)[0].innerHTML;
}

// Returns number of LabelMe objects.
function LMnumberOfObjects(xml) {
  return xml.getElementsByTagName('object').length;
}

// Get the x position of the mouse event.
function GetEventPosX(event) {
  if(IsNetscape()) return event.layerX;
  return event.offsetX;
}

// Get the y position of the mouse event.
function GetEventPosY(event) {
  if(IsNetscape()) return event.layerY;
  return event.offsetY;
}

function RemoveSpecialChars(str) {
  var re = /\$|@|#|~|`|\%|\*|\^|\&|\+|\=|\[|\]|\}|\{|\;|\:|\'|\"|\<|\>|\?|\||\\|\!|\$/g;
  return str.replace(re,"_");
}

function WaitForInput() {
  alert("Need to enter object name.");
}

// Return true if the username is "anonymous".
function IsUserAnonymous() {
  return (username=='anonymous');
}

function IsUserAdmin() {
  var is_admin = false;
  var folder = main_image.GetFileInfo().GetDirName();
  var idx = folder.indexOf('/');
  if((idx != -1) && (folder.substring(0,idx)=='users')) {
    folder = folder.substring(idx+1,folder.length);
    idx = folder.indexOf('/');
    if((idx != -1) && (folder.substring(0,idx)==username)) is_admin = true;
  }
  return (username=='admin') | (username=='mtsupervisor') | is_admin | ((username.indexOf('submitted')!=-1)&(username==folder));
}

function IsCreator(u) {
  return (username==u);
}


function WriteLogMsg(msg) {
  var url = 'annotationTools/perl/write_logfile.cgi';
  var req_submit;
  // branch for native XMLHttpRequest object
  if (window.XMLHttpRequest) {
    req_submit = new XMLHttpRequest();
    req_submit.open("POST", url, true);
    req_submit.send(msg);
  } 
  else if (window.ActiveXObject) {
    req_submit = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_submit) {
      req_submit.open("POST", url, true);
      req_submit.send(msg);
    }
  }
}

function loadXMLDoc() {
  if(wait_for_input) return WaitForInput();
  if(draw_anno) {
    alert("Need to close current polygon first.");
    return;
  }

  // Get a new image:
  var p = document.getElementById('main_image');
  p.parentNode.removeChild(p);

  RemoveObjectList();

  main_image.GetNewImage();
}

function ShowNextImage() {
  var s = document.getElementById("submitform");
  if(s!=null) s.submit();
}

function XMLGet(fname) {
  var url = 'annotationTools/perl/get_anno_file.cgi';
  // branch for native XMLHttpRequest object
  if (window.XMLHttpRequest) {
    req_anno = new XMLHttpRequest();
    req_anno.open("POST", url, false);
    req_anno.send(fname);
  } 
  else if (window.ActiveXObject) {
    req_anno = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_anno) {
      req_anno.open("POST", url, false);
      req_anno.send(fname);
    }
  }
  return req_anno;
}

function InsertServerLogData(modifiedControlPoints) {
  var old_pri = LM_xml.getElementsByTagName("private");
  for(ii=0;ii<old_pri.length;ii++) {
    old_pri[ii].parentNode.removeChild(old_pri[ii]);
  }
  
  // Add information to go into the log:
  var elt_pri = LM_xml.createElement("private");
  var elt_gct = LM_xml.createElement("global_count");
  var elt_user = LM_xml.createElement("pri_username");
  var elt_edt = LM_xml.createElement("edited");
  var elt_onm = LM_xml.createElement("old_name");
  var elt_nnm = LM_xml.createElement("new_name");
  var elt_mcp = LM_xml.createElement("modified_cpts");
  
  var txt_gct = LM_xml.createTextNode(global_count);
  var txt_user = LM_xml.createTextNode(username);
  var txt_edt = LM_xml.createTextNode(submission_edited);
  var txt_onm = LM_xml.createTextNode(old_name);
  var txt_nnm = LM_xml.createTextNode(new_name);
  var txt_mcp = LM_xml.createTextNode(modifiedControlPoints);
  var txt_pri = LM_xml.createTextNode(ref);
  
  LM_xml.documentElement.appendChild(elt_pri);
  elt_pri.appendChild(elt_gct);
  elt_pri.appendChild(elt_user);
  elt_pri.appendChild(elt_edt);
  elt_pri.appendChild(elt_onm);
  elt_pri.appendChild(elt_nnm);
  elt_pri.appendChild(elt_mcp);
  elt_pri.appendChild(txt_pri);
  
  elt_gct.appendChild(txt_gct);
  elt_user.appendChild(txt_user);
  elt_edt.appendChild(txt_edt);
  elt_onm.appendChild(txt_onm);
  elt_nnm.appendChild(txt_nnm);
  elt_mcp.appendChild(txt_mcp);
}

function PermissionError() {
  var m = main_image.GetFileInfo().GetMode();
  if((m=='im') || (m=='mt')) {
    alert('This polygon was entered by another user.  You can only modify polygons that you have entered.');
  }
  else {
    alert('This polygon was entered by another user.  You can only modify polygons that you have entered.  Do not forget to sign in if you want to be able to edit your annotations');
  }
}

function GetTimeStamp() {
  var url = 'annotationTools/perl/get_timestamp.cgi';
  // branch for native XMLHttpRequest object
  if (window.XMLHttpRequest) {
    req_anno = new XMLHttpRequest();
    req_anno.open("POST", url, false);
    req_anno.send();
  } 
  else if (window.ActiveXObject) {
    req_anno = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_anno) {
      req_anno.open("POST", url, false);
      req_anno.send();
    }
  }

  if(req_anno.status==200) return req_anno.responseText;
  return '';
}


// Set object list choices for points and lines:
function SetObjectChoicesPointLine(num_control_points) {
  // If point has been labeled, then make autocomplete have "point"
  // be option:
  var isPoint = 0;
  if((num_control_points==1) && (object_choices=='...')) {
    object_choices = 'point';
    object_choices = object_choices.split(/,/);
    isPoint = 1;
  }
  
  // If line has been labeled, then make autocomplete have "line"
  // and "horizon line" be options:
  var isLine = 0;
  if((num_control_points==2) && (object_choices=='...')) {
    object_choices = 'line,horizon line';
    object_choices = object_choices.split(/,/);
    isLine = 1;
  }
  
  return (isPoint || isLine);
}

// Returns true if the point (x,y) is close to polygon p.
function IsNearPolygon(x,y,p) {
  var sx = x / main_image.GetImRatio();
  var sy = y / main_image.GetImRatio();
  
  var pt = AllAnnotations[p].ClosestPoint(sx,sy);
  var minDist = pt[2];
  
  // This is the sensitivity area around the outline of the polygon.
  // Also, when you move the mouse over the sensitivity area, the area 
  // gets bigger so you won't move off of it on accident.
  var buffer = 5;
  if(selected_poly != -1) buffer = 13;
  
  // Note: need to multiply by im_ratio so that the sensitivity area 
  // is not huge when you're zoomed in. 
  return ((minDist*main_image.GetImRatio()) < buffer);
}
    
// Render filled polygons for selected objects:
function selectObject(idx) {
  if(selected_poly==idx) return;
  unselectObjects();
  selected_poly = idx;
  if(view_ObjList) ChangeLinkColorFG(idx);
  AllAnnotations[selected_poly].FillPolygon();
  
  // Select object parts:
  var selected_poly_parts = getPartChildrens(idx);
  for (var i=0; i<selected_poly_parts.length; i++) {
    if((selected_poly_parts[i]!=selected_poly) && AllAnnotations[selected_poly_parts[i]].hidden) {
      AllAnnotations[selected_poly_parts[i]].DrawPolygon(main_image.GetImRatio());
    }
    AllAnnotations[selected_poly_parts[i]].FillPolygon();
  }
}

// Stop fill polygon rendering for selected objects:
function unselectObjects() {
  if(selected_poly == -1) return;
  if(view_ObjList) ChangeLinkColorBG(selected_poly);
  AllAnnotations[selected_poly].UnfillPolygon();
  
  // Unselect object parts:
  var selected_poly_parts = getPartChildrens(selected_poly);
  for (var i=0; i<selected_poly_parts.length; i++) {
    if((selected_poly_parts[i]!=selected_poly) && AllAnnotations[selected_poly_parts[i]].hidden) {
      AllAnnotations[selected_poly_parts[i]].DeletePolygon();
    }
    AllAnnotations[selected_poly_parts[i]].UnfillPolygon();
  }
  
  // Reset selected_poly variable:
  selected_poly = -1;
}

// Deletes the currently selected polygon from the canvas.
function DeleteSelectedPolygon() {
  if(selected_poly == -1) return;
  
  if((IsUserAnonymous() || (!IsCreator(AllAnnotations[selected_poly].GetUsername()))) && (!IsUserAdmin()) && (selected_poly<num_orig_anno) && !action_DeleteExistingObjects) {
    alert('You do not have permission to delete this polygon');
    return;
  }
  
  if(AllAnnotations[selected_poly].GetVerified()) {
    StartEditEvent(selected_poly,null);
    return;
  }
  
  submission_edited = 0;
  old_name = LMgetObjectField(LM_xml,AllAnnotations[selected_poly].anno_id,'name');
  new_name = old_name;
  
  // Write to logfile:
  WriteLogMsg('*Deleting_object');
  InsertServerLogData('cpts_not_modified');
  
  // Set <deleted> in LM_xml:
  $(LM_xml).children("annotation").children("object").eq(selected_poly).children("deleted").text('1');
  
  // Write XML to server:
  WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
  
  //     SubmitAnnotations(0);
  
  // Need to keep track of the selected polygon since it gets reset
  // in the next step:
  var ndx = selected_poly;
  
  // Unselect the object:
  unselectObjects();
  if(view_ObjList) RenderObjectList();
  
  // Delete the polygon from the canvas:
  AllAnnotations[ndx].DeletePolygon();
}


// UTILITIES    
function CheckXMLExists() {
  if(req_submit.readyState==4) {
    if(req_submit.status != 200) {
      alert("The XML annotation file does not exist yet.  Please label an object and try again");
    }
    else {
      window.open(main_image.GetFileInfo().GetAnnotationPath());
    }
  }
}

function GetXMLFile() {
  var xml_url = main_image.GetFileInfo().GetAnnotationPath();

  // Check if VRML file exists:
  if (window.XMLHttpRequest) {
    req_submit = new XMLHttpRequest();
    req_submit.onreadystatechange = CheckXMLExists;
    req_submit.open("GET", xml_url, true);
    req_submit.send('');
  } 
  else if (window.ActiveXObject) {
    req_submit = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_submit) {
      req_submit.onreadystatechange = CheckXMLExists;
      req_submit.open("GET", xml_url, true);
      req_submit.send('');
    }
  }
}

