// This file should be minimized and abstracted whenever possible.  
// It is best to refrain from adding new variables/functions to this file.

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
  var folder = main_media.GetFileInfo().GetDirName();
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

// This function gets called when the user clicks on the "Next image" button.
function ShowNextImage() {
  if(wait_for_input) return WaitForInput();
  if(draw_anno) {
    alert("Need to close current polygon first.");
    return;
  }

  // Remove the image:
  $('#main_media').remove();

  // Remove the object list:
  RemoveObjectList();

  // Get a new image and reset URL to reflect new image:
  main_media.GetFileInfo().SetURL(document.URL);
}

function InsertServerLogData(modifiedControlPoints) {
  var old_pri = LM_xml.getElementsByTagName("private");
  for(ii=0;ii<old_pri.length;ii++) {
    old_pri[ii].parentNode.removeChild(old_pri[ii]);
  }
  var video_mode_num = 0;
  if (video_mode) video_mode_num = 1;
  // Add information to go into the log:
  var elt_pri = LM_xml.createElement("private");
  var elt_gct = LM_xml.createElement("global_count");
  var elt_user = LM_xml.createElement("pri_username");
  var elt_edt = LM_xml.createElement("edited");
  var elt_onm = LM_xml.createElement("old_name");
  var elt_nnm = LM_xml.createElement("new_name");
  var elt_mcp = LM_xml.createElement("modified_cpts");
  var elt_vid = LM_xml.createElement("video");
  var txt_gct = LM_xml.createTextNode(global_count);
  var txt_user = LM_xml.createTextNode(username);
  var txt_edt = LM_xml.createTextNode(submission_edited);
  var txt_onm = LM_xml.createTextNode(old_name);
  var txt_nnm = LM_xml.createTextNode(new_name);
  var txt_mcp = LM_xml.createTextNode(modifiedControlPoints);
  var txt_pri = LM_xml.createTextNode(ref);
  var txt_vid = LM_xml.createTextNode(video_mode_num);


  LM_xml.documentElement.appendChild(elt_pri);
  elt_pri.appendChild(elt_gct);
  elt_pri.appendChild(elt_user);
  elt_pri.appendChild(elt_edt);
  elt_pri.appendChild(elt_onm);
  elt_pri.appendChild(elt_nnm);
  elt_pri.appendChild(elt_mcp);
  elt_pri.appendChild(elt_vid);
  elt_pri.appendChild(txt_pri);
  
  elt_gct.appendChild(txt_gct);
  elt_user.appendChild(txt_user);
  elt_edt.appendChild(txt_edt);
  elt_onm.appendChild(txt_onm);
  elt_nnm.appendChild(txt_nnm);
  elt_mcp.appendChild(txt_mcp);
  elt_vid.appendChild(txt_vid);
}

function PermissionError() {
  var m = main_media.GetFileInfo().GetMode();
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
  var sx = x / main_media.GetImRatio();
  var sy = y / main_media.GetImRatio();
  
  var anid = main_canvas.GetAnnoIndex(p);
  var pt = main_canvas.annotations[anid].ClosestPoint(sx,sy);
  var minDist = pt[2];
  
  // This is the sensitivity area around the outline of the polygon.
  // Also, when you move the mouse over the sensitivity area, the area 
  // gets bigger so you won't move off of it on accident.
  var buffer = 5;
  if(selected_poly != -1) buffer = 13;
  
  // Note: need to multiply by im_ratio so that the sensitivity area 
  // is not huge when you're zoomed in. 
  return ((minDist*main_media.GetImRatio()) < buffer);
}
    
// Render filled polygons for selected objects:
function selectObject(idx) {
  var anid = main_canvas.GetAnnoIndex(idx);
  if(selected_poly==idx) return;
  unselectObjects();
  selected_poly = idx;
  if(view_ObjList) ChangeLinkColorFG(idx);
  main_canvas.annotations[anid].FillPolygon();
  
  // Select object parts:
  var selected_poly_parts = getPartChildrens(idx);
  for (var i=0; i<selected_poly_parts.length; i++) {
    var anid = main_canvas.GetAnnoIndex(selected_poly_parts[i]);
    if((selected_poly_parts[i]!=selected_poly) && main_canvas.annotations[anid].hidden) {
      main_canvas.annotations[anid].DrawPolygon(main_media.GetImRatio(), LMgetObjectField(LM_xml,selected_poly_parts[i],'x'), LMgetObjectField(LM_xml,selected_poly_parts[i],'y'));
    }
    main_canvas.annotations[anid].FillPolygon();
  }
}

// Stop fill polygon rendering for selected objects:
function unselectObjects() {
  if(selected_poly == -1) return;
  var anid;

  var anid = main_canvas.GetAnnoIndex(selected_poly);
  if(view_ObjList) ChangeLinkColorBG(selected_poly);
  main_canvas.annotations[anid].UnfillPolygon();
  
  // Unselect object parts:
  var selected_poly_parts = getPartChildrens(selected_poly);
  for (var i=0; i<selected_poly_parts.length; i++) {

    var anid = main_canvas.GetAnnoIndex(selected_poly_parts[i]);
    if((selected_poly_parts[i]!=selected_poly) && main_canvas.annotations[anid].hidden) {
      main_canvas.annotations[anid].DeletePolygon();
    }
    main_canvas.annotations[anid].UnfillPolygon();
  }
  
  // Reset selected_poly variable:
  selected_poly = -1;
}

// Deletes the currently selected polygon from the canvas.
function DeleteSelectedPolygon() {
  if(selected_poly == -1) return;
  
  if((IsUserAnonymous() || (!IsCreator(LMgetObjectField(LM_xml, selected_poly, 'username')))) && (!IsUserAdmin()) && (selected_poly<num_orig_anno) && !action_DeleteExistingObjects) {
    alert('You do not have permission to delete this polygon');
    return;
  }
  
  if(LMgetObjectField(LM_xml, selected_poly, 'verified')) {
    StartEditEvent(selected_poly,null);
    return;
  }
  
  submission_edited = 0;
  old_name = LMgetObjectField(LM_xml,main_canvas.annotations[selected_poly].anno_id,'name');
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
  main_canvas.annotations[ndx].DeletePolygon();
}


// UTILITIES    
function CheckXMLExists() {
  if(req_submit.readyState==4) {
    if(req_submit.status != 200) {
      alert("The XML annotation file does not exist yet.  Please label an object and try again");
    }
    else {
      window.open(main_media.GetFileInfo().GetAnnotationPath());
    }
  }
}

function GetXMLFile() {
  var xml_url = main_media.GetFileInfo().GetAnnotationPath();

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

