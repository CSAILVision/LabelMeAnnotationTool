// my_scripts.js
// Modified: 03/05/2007
// This file contains global variables and functions.  This file
// should be minimized and abstracted whenever possible.  It is 
// best to refrain from adding new variables/functions to this
// file.

var wait_for_input;
var edit_popup_open = 0;
var num_orig_anno;
var anno_count = 0;
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
// var LMbaseurl = 'http://old-labelme.csail.mit.edu/developers/brussell/LabelMe-video/tool.html';
// var MThelpPage = 'http://old-labelme.csail.mit.edu/developers/brussell/LabelMe-video/mt_instructions.html';
// var LMbaseurl = 'http://labelme.csail.mit.edu/tool.html';
var LMbaseurl = 'http://' + window.location.host + window.location.pathname;
// var MThelpPage = 'http://labelme.csail.mit.edu/mt_instructions.html';
var MThelpPage = 'annotationTools/html/mt_instructions.html';
var externalSubmitURL = 'http://mturk.com/mturk/externalSubmit';
var externalSubmitURLsandbox = 'http://workersandbox.mturk.com/mturk/externalSubmit';
var mt_N = 'inf';

var object_choices = '...';


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

// If IE, then makes the HTML to show the 'next' icon with the appropriate 
// transparencies; if firefox, then just make an img src to show the image
function ShowUndoImg() {
  var oo = document.createElementNS(xhtmlNS,'img');
  oo.setAttributeNS(null,"id","undo_image_png");
  oo.setAttributeNS(null,"src","Icons/undo.png");
  oo.setAttributeNS(null,"style","cursor:hand; width:3em;");
  document.getElementById('png_undo').appendChild(oo);
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

function RemoveAnnotationList() {
  var p = document.getElementById('anno_list');
  if(p) {  
    p.parentNode.removeChild(p); 
  }
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
  if(main_draw_canvas.GetAnnotation()) {
    alert("Need to close current polygon first.");
    return;
  }

  // Get a new image:
  var p = document.getElementById('main_image');
  p.parentNode.removeChild(p);

  RemoveAnnotationList();

  main_image.GetNewImage();
}

function ShowNextImage() {
  var s = document.getElementById("submitform");
  if(s!=null) s.submit();
}

// Insert HTML code after a div element:
function InsertAfterDiv(html_str,tag_id) {
  if((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function(html) {
      var frag = document.createDocumentFragment(), 
      div = document.createElement("div");
      frag.appendChild(div);
      div.outerHTML = html;
      return frag;
    };
  }

  var elt = document.getElementById(tag_id);
  var x = document.createRange();
  try {
    x.setStartAfter(elt);
  }
  catch(err) {
    alert(tag_id);
  }
  x = x.createContextualFragment(html_str);
  elt.appendChild(x);
}

function ChangeLinkColorBG(idx) {
  if(document.getElementById('Link'+idx)) {
    var isDeleted = main_canvas.GetAnnotations()[idx].GetDeleted();
    if(isDeleted) document.getElementById('Link'+idx).style.color = '#888888';
    else document.getElementById('Link'+idx).style.color = '#0000FF';
  }
}

function ChangeLinkColorFG(idx) {
  document.getElementById('Link'+idx).style.color = '#FF0000';
}

function LoadAnnotationList() {
  var html_str = '<div id="anno_list"><br />';
  for(ii=0; ii < main_canvas.GetAnnotations().length; ii++) {
//     if(!main_canvas.GetAnnotations()[ii].GetDeleted()) {
    var isDeleted = main_canvas.GetAnnotations()[ii].GetDeleted();
    if(((ii<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || ((ii>=num_orig_anno)&&(!isDeleted||(isDeleted&&view_Deleted)))) {
      html_str += '<div id="LinkAnchor' + ii + '">';
      html_str += '<a id="Link' + ii + 
	'" href="javascript:main_handler.AnnotationLinkClick('+ii+');" '+
	'onmouseover="javascript:main_handler.AnnotationLinkMouseOver('+ii+');" ' +
	'onmouseout="javascript:main_handler.AnnotationLinkMouseOut();"';
      if(isDeleted) html_str += ' style="color:#888888"><b>';
      else html_str += '>';
      if(main_canvas.GetAnnotations()[ii].GetObjName().length==0 && 
	 !main_draw_canvas.GetAnnotation()) 
	html_str += '<i>[ Please enter name ]</i>';
      else html_str += main_canvas.GetAnnotations()[ii].GetObjName();
      if(isDeleted) html_str += '</b>';
      html_str += '</a></div>';
    }
  }
  html_str += '</div>';
  InsertAfterDiv(html_str,'anno_anchor');

	
}

function UpdateCounterHTML() {
  var m = main_image.GetFileInfo().GetMode();
  if((m=='im') || (m=='mt')) return;
  document.getElementById('anno_count').innerHTML = anno_count;
}

function LoadCounterText() {
  var cookie_counter = getCookie('counter');
  if(cookie_counter > anno_count) anno_count = cookie_counter;

  var objXml = XMLGet('annotationCache/counter');

  if(objXml.status==200) {
    var tmp_count = parseInt(objXml.responseText);
    if(tmp_count > anno_count) {
      anno_count = tmp_count;
      setCookie('counter',anno_count);
    }
    UpdateCounterHTML();
  }
  else if(objXml.status==404) {
    alert('counter file not found');
  }
  else {
    alert('Unknown objXml.status');
  }
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

function LoadAnnotationSuccess(xml) {
  // Set global variable:
  LM_xml = xml;

  var obj_elts = LM_xml.getElementsByTagName("object");
  var num_obj = obj_elts.length;
  
  main_canvas.CreateNewAnnotations(num_obj);
  num_orig_anno = num_obj;
  
  for(var pp = 0; pp < num_obj; pp++) {
    main_canvas.GetAnnotations()[pp] = new annotation(pp);
    main_canvas.GetAnnotations()[pp].SetDeleted(parseInt(obj_elts[pp].getElementsByTagName("deleted")[0].firstChild.nodeValue));
    main_canvas.GetAnnotations()[pp].SetVerified(parseInt(obj_elts[pp].getElementsByTagName("verified")[0].firstChild.nodeValue));
    
    if((obj_elts[pp].getElementsByTagName("username").length>0) && obj_elts[pp].getElementsByTagName("username")[0].firstChild)
      main_canvas.GetAnnotations()[pp].SetUsername(obj_elts[pp].getElementsByTagName("username")[0].firstChild.nodeValue);
    else
      main_canvas.GetAnnotations()[pp].SetUsername("anonymous");
    
    if((obj_elts[pp].getElementsByTagName("automatic").length>0) && obj_elts[pp].getElementsByTagName("automatic")[0].firstChild)
      main_canvas.GetAnnotations()[pp].SetAutomatic(obj_elts[pp].getElementsByTagName("automatic")[0].firstChild.nodeValue);
    
    // Set object IDs:
    var curr_obj = $(LM_xml).children("annotation").children("object").eq(pp);
    if(curr_obj.children("id").length > 0) {
      curr_obj.children("id").text(""+pp);
    }
    else {
      curr_obj.append($("<id>" + pp + "</id>"));
    }
    main_canvas.GetAnnotations()[pp].SetID(""+pp);

    
    if(!obj_elts[pp].getElementsByTagName("name")[0].firstChild)
      main_canvas.GetAnnotations()[pp].SetObjName('');
    else
      main_canvas.GetAnnotations()[pp].SetObjName(obj_elts[pp].getElementsByTagName("name")[0].firstChild.nodeValue);

    var pt_elts = obj_elts[pp].getElementsByTagName("polygon")[0].getElementsByTagName("pt");
    
    var numpts = pt_elts.length;
    main_canvas.GetAnnotations()[pp].CreatePtsX(numpts);
    main_canvas.GetAnnotations()[pp].CreatePtsY(numpts);
    for(ii=0; ii < numpts; ii++) {
      main_canvas.GetAnnotations()[pp].GetPtsX()[ii] = parseInt(pt_elts[ii].getElementsByTagName("x")[0].firstChild.nodeValue);
      main_canvas.GetAnnotations()[pp].GetPtsY()[ii] = parseInt(pt_elts[ii].getElementsByTagName("y")[0].firstChild.nodeValue);
    }
  }
  
  main_canvas.DrawAllPolygons();
  if(view_ObjList) LoadAnnotationList();
}

// Annotation file does not exist, so load template:
function LoadAnnotation404(jqXHR,textStatus,errorThrown) {
  if(jqXHR.status==404) 
    ReadXML(main_image.GetFileInfo().GetTemplatePath(),LoadTemplateSuccess,LoadTemplate404);
  else
    alert(jqXHR.status);
}

// Annotation template does not exist for this folder, so load default 
// LabelMe template:
function LoadTemplate404(jqXHR,textStatus,errorThrown) {
  if(jqXHR.status==404)
    ReadXML('annotationCache/XMLTemplates/labelme.xml',LoadTemplateSuccess,function(jqXHR) {
	alert(jqXHR.status);
      });
  else
    alert(jqXHR.status);
}

// Actions after template load success:
function LoadTemplateSuccess(xml) {
  LM_xml = xml;
  LM_xml.getElementsByTagName("filename")[0].firstChild.nodeValue = '\n'+main_image.GetFileInfo().GetImName()+'\n';
  LM_xml.getElementsByTagName("folder")[0].firstChild.nodeValue = '\n'+main_image.GetFileInfo().GetDirName()+'\n';
  main_canvas.CreateNewAnnotations(0);
  num_orig_anno = 0;
  if(view_ObjList) LoadAnnotationList();
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


function UpdateXmlExistingAnnotation(ii) {
  var curr_obj = $(LM_xml).children("annotation").children("object").eq(ii);
  
  curr_obj.children("name").text(main_canvas.GetAnnotations()[ii].GetObjName());
  curr_obj.children("deleted").text(main_canvas.GetAnnotations()[ii].GetDeleted());
  if(curr_obj.children("automatic").length > 0) {
    curr_obj.children("automatic").text(main_canvas.GetAnnotations()[ii].GetAutomatic());
  }
  
  for(var jj=0; jj < main_canvas.GetAnnotations()[ii].GetPtsX().length; jj++) {
    curr_obj.children("polygon").children("pt").eq(jj).children("x").text(main_canvas.GetAnnotations()[ii].GetPtsX()[jj]);
    curr_obj.children("polygon").children("pt").eq(jj).children("y").text(main_canvas.GetAnnotations()[ii].GetPtsY()[jj]);
  }
}


function AppendXmlNewAnnotation(ii) {
  // Create new object inside XML:
  var html_str = '<object>';
  html_str += '<name>' + main_canvas.GetAnnotations()[ii].GetObjName() + '</name>';
  html_str += '<deleted>' + main_canvas.GetAnnotations()[ii].GetDeleted() + '</deleted>';
  html_str += '<verified>0</verified>';
  var ts = main_canvas.GetAnnotations()[ii].GetTimeStamp();
  if(ts.length==20) html_str += '<date>' + ts + '</date>';
  html_str += '<id>' + ii + '</id>';
  html_str += '<polygon>';
  html_str += '<username>' + username + '</username>';
  for(var jj=0; jj < main_canvas.GetAnnotations()[ii].GetPtsX().length; jj++) {
    html_str += '<pt>';
    html_str += '<x>' + main_canvas.GetAnnotations()[ii].GetPtsX()[jj] + '</x>';
    html_str += '<y>' + main_canvas.GetAnnotations()[ii].GetPtsY()[jj] + '</y>';
    html_str += '</pt>';
  }
  html_str += '</polygon>';
  html_str += '</object>';
  
  $(LM_xml).children("annotation").append($(html_str));
}

// Send annotation information to server CGI script for recording.
function SubmitAnnotations(modifiedControlPoints) {
  if(modifiedControlPoints) modifiedControlPoints = "cpts_modified";
  else modifiedControlPoints = "cpts_not_modified";
  
  // Insert data for server logfile:
  InsertServerLogData(modifiedControlPoints);
  
  // Insert annotations that existed before this labeling session to XML:
  for(var ii=0; ii < num_orig_anno; ii++) {
    UpdateXmlExistingAnnotation(ii);
  }

  // Remove all new objects created during current LabelMe session:
  var elts_obj = LM_xml.getElementsByTagName("object");
  while(elts_obj.length>num_orig_anno) {
    elts_obj[num_orig_anno].parentNode.removeChild(elts_obj[num_orig_anno]);
    elts_obj = LM_xml.getElementsByTagName("object");
  }
  
  // Insert annotations created during this labeling session to XML:
  for(var ii = 0; ii < (main_canvas.GetAnnotations().length-num_orig_anno); ii++) {
    if(main_canvas.GetAnnotations()[num_orig_anno+ii].GetDeleted()==1) continue;

    AppendXmlNewAnnotation(num_orig_anno+ii);
  }  

  // Write XML to server:
  var url = 'annotationTools/perl/submit.cgi';
  WriteXML(url,LM_xml,function(){return;});
}

