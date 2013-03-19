// my_scripts.js
// Modified: 03/05/2007
// This file contains global variables and functions.  This file
// should be minimized and abstracted whenever possible.  It is
// best to refrain from adding new variables/functions to this
// file.

var wait_for_input;
var edit_popup_open = 0;
var anno_xml;
var num_orig_anno;
var anno_count = 0;
var global_count = 0;
var req_submit;
var username = 'anonymous';
var username_flag = 0;
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

  //mg call it here for convenience
  LoadImageAttributeList();
}

//mg
function LoadImageAttributeList() {

  var anchor = document.getElementById('attrib_anchor');
  while(anchor.firstChild) {
    anchor.removeChild(anchor.firstChild);
  }

  var html_str = '<div id="imageAttrib_list">';

  for (var i = 0; i < main_canvas.GetImageAttributes().length; ++i) {

    var canDelete = IsUserAdmin() || main_canvas.GetImageAttributes()[i].GetUsername() == username;
    var deleteHtml = (canDelete) ? '<a onclick="javascript:main_handler.ImageAttributeDeleteClick(' + i + ');" >' +
                                   '<img src="annotationTools/GoogleIcons/close.gif"/></a>' : '';

    html_str += '<p>' + main_canvas.GetImageAttributes()[i].GetAttributeName() + ' : ' +
                 main_canvas.GetImageAttributes()[i].GetAttributeValue() + ' ' + deleteHtml + '</p>';
  }

  html_str += '</div>';
  InsertAfterDiv(html_str, 'attrib_anchor');
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

function getCookie(c_name) {
  if (document.cookie.length>0) {
    c_start=document.cookie.indexOf(c_name + "=");
    if (c_start!=-1) {
      c_start=c_start + c_name.length+1;
      c_end=document.cookie.indexOf(";",c_start);
      if (c_end==-1) c_end=document.cookie.length;
      return unescape(document.cookie.substring(c_start,c_end));
    }
  }
  return null
}

function setCookie(c_name,value,expiredays) {
  var exdate=new Date();
  exdate.setDate(expiredays);
  document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : "; expires="+exdate);
}

function PlaceSignInHTML() {
  var el_div = document.createElementNS(xhtmlNS,'div');
  el_div.setAttributeNS(null,"id","you_are_div");
  document.getElementById('username_main_div').appendChild(el_div);

  var el_a1 = document.createElementNS(xhtmlNS,'a');
  el_a1.setAttributeNS(null,"href","javascript:get_username_form();");
  el_div.appendChild(el_a1);

  var el_font = document.createElementNS(xhtmlNS,'font');
  el_font.setAttributeNS(null,"size","3");
  el_a1.appendChild(el_font);

  var el_b = document.createElementNS(xhtmlNS,'b');
  el_font.appendChild(el_b);

  var el_txt1 = document.createTextNode('Sign in');
  el_b.appendChild(el_txt1);

  var el_txt2 = document.createTextNode(' (');
  el_div.appendChild(el_txt2);

  var el_a2 = document.createElementNS(xhtmlNS,'a');
  el_a2.setAttributeNS(null,"href","annotationTools/html/why_signin.html");
  el_a2.setAttributeNS(null,"target","_blank");
  el_div.appendChild(el_a2);

  var el_txt3 = document.createTextNode('why?');
  el_a2.appendChild(el_txt3);

  var el_txt4 = document.createTextNode(')');
  el_div.appendChild(el_txt4);
}

function sign_out() {
  username_flag = 0;
  username = "anonymous";
  setCookie('username',username);
  var p = document.getElementById('you_are_div');
  p.parentNode.removeChild(p);
  PlaceSignInHTML();
  var all_annos = main_canvas.GetAnnotations();
  for(i=num_orig_anno; i < all_annos.length; i++) {
    all_annos[i].SetUsername(username);
  }
}

function IsExistingUser() {
  var url = 'isExistingUser.cgi?username=' + username;
  var im_req;
  // branch for native XMLHttpRequest object
  if (window.XMLHttpRequest) {
    im_req = new XMLHttpRequest();
    im_req.open("GET", url, false);
    im_req.send('');
  }
  else if (window.ActiveXObject) {
    im_req = new ActiveXObject("Microsoft.XMLHTTP");
    if (im_req) {
      im_req.open("GET", url, false);
      im_req.send('');
    }
  }

  if(im_req.status==200) {
    return parseInt(im_req.responseXML.getElementsByTagName("user_exist")[0].firstChild.nodeValue);
  }
  else alert('Fatal: there are problems with isExistingUser.cgi');
  return false;
}

function write_username() {
  username_flag = 0;
  var html_str;
  if(getCookie('username')) username = getCookie('username');
  if(username=="anonymous") PlaceSignInHTML();
  else {
    html_str = '<div id="you_are_div"><br />You are: <b>' + username +
      '</b> <br />(' +
      '<a href="javascript:sign_out()">sign out</a>)</div>';
    InsertAfterDiv(html_str,'username_main_div');
  }
}

// function write_username() {
//   username_flag = 0;
//   var html_str;
//   if((main_image.GetFileInfo().GetMode()!='c') && getCookie('username')) username = getCookie('username');
//   if(username=="anonymous") PlaceSignInHTML();
//   else if(main_image.GetFileInfo().GetMode()=='c') {
//     html_str = '<div id="you_are_div"><br />You are: <b>' + username +
//       '</b> <br />(' +
//       '<a href="view_collection.cgi?username=' + username + '&amp;collection=' + main_image.GetFileInfo().GetCollection() + '">View collection</a>, <a href="signin.cgi?username=' + username + '">All collections</a>)</div>';
//     InsertAfterDiv(html_str,'username_main_div');
//   }
//   else if(IsExistingUser()) {
//     html_str = '<div id="you_are_div"><br />You are: <b>' + username +
//       '</b> <br />(' +
//       '<a href="signin.cgi?username=' + username + '">Your collections</a>, <a href="javascript:sign_out()">Sign out</a>)</div>';
//     InsertAfterDiv(html_str,'username_main_div');
//   }
//   else {
//     html_str = '<div id="you_are_div"><br />You are: <b>' + username +
//       '</b> <br />(' +
//       '<a href="javascript:sign_out()">sign out</a>)</div>';
//     InsertAfterDiv(html_str,'username_main_div');
//   }
// }

function create_username_form() {
  var el_div = document.createElementNS(xhtmlNS,'div');
  el_div.setAttributeNS(null,"id","enter_username_div");
  document.getElementById('username_main_div').appendChild(el_div);

  var el_form = document.createElementNS(xhtmlNS,'form');
  el_form.setAttributeNS(null,"action","javascript:submit_username();");
  el_form.setAttributeNS(null,"style","margin-bottom:0px;");
  el_div.appendChild(el_form);

  var el_table = document.createElementNS(xhtmlNS,'table');
  el_table.setAttributeNS(null,"style","font-size:small;");
  el_form.appendChild(el_table);

  var el_tr = document.createElementNS(xhtmlNS,'tr');
  el_table.appendChild(el_tr);

  var el_td = document.createElementNS(xhtmlNS,'td');
  el_td.setAttributeNS(null,"style","text-decoration:nowrap;");
  el_tr.appendChild(el_td);

  var el_br1 = document.createElementNS(xhtmlNS,'br');
  el_td.appendChild(el_br1);

  var el_txt1 = document.createTextNode('Username: ');
  el_td.appendChild(el_txt1);

  var el_input1 = document.createElementNS(xhtmlNS,'input');
  el_input1.setAttributeNS(null,"type","text");
  el_input1.setAttributeNS(null,"id","username");
  el_input1.setAttributeNS(null,"name","username");
  el_input1.setAttributeNS(null,"size","20em");
  el_input1.setAttributeNS(null,"style","font-family:Arial;font-size:small;");
  el_td.appendChild(el_input1);

  var el_br2 = document.createElementNS(xhtmlNS,'br');
  el_td.appendChild(el_br2);

  var el_input2 = document.createElementNS(xhtmlNS,'input');
  el_input2.setAttributeNS(null,"type","submit");
  el_input2.setAttributeNS(null,"id","username_submit");
  el_input2.setAttributeNS(null,"name","username_submit");
  el_input2.setAttributeNS(null,"value","Submit");
  el_input2.setAttributeNS(null,"style","font-family:Arial;font-size:small;");
  el_td.appendChild(el_input2);
}

function submit_username() {
  username = document.getElementById('username').value;
  username = RemoveSpecialChars(username);
  if(username.length==0) username = 'anonymous';
  setCookie('username',username);
  var p = document.getElementById('enter_username_div');
  p.parentNode.removeChild(p);
  write_username();

  var all_annos = main_canvas.GetAnnotations();
  for(i=num_orig_anno; i < all_annos.length; i++) {
    all_annos[i].SetUsername(username);
  }
  // In the future, include SubmitAnnotations().  However, need to update
  // private information sent to server logs to indicate that username
  // change has taken place.
//   main_canvas.SubmitAnnotations();
}

function get_username_form() {
  if(wait_for_input) return WaitForInput();
  if(edit_popup_open) main_handler.SelectedToRest();
  username_flag = 1;
  var p = document.getElementById('you_are_div');
  p.parentNode.removeChild(p);
  create_username_form();

  document.getElementById('username').value = username;
  document.getElementById('username').select();
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

function LoadAnnotations(anno_file) {
  anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml';
  var objXml = XMLGet(anno_file);

  if(objXml.status==200) {
    anno_xml = objXml.responseXML;
    var obj_elts = anno_xml.getElementsByTagName("object");
    var num_obj = obj_elts.length;

    main_canvas.CreateNewAnnotations(num_obj);

    //mg todo use the number found in the file
    var imageAttrib_elts = anno_xml.getElementsByTagName("imageAttribute");
    var num_imageAttribs = imageAttrib_elts.length;

    main_canvas.CreateNewImageAttributes(num_imageAttribs);

    for (var i = 0; i < num_imageAttribs; ++i) {
      main_canvas.GetImageAttributes()[i] = new imageAttribute(i);

      var name = (imageAttrib_elts[i].getElementsByTagName("name")[0]).firstChild.nodeValue;
      var value = imageAttrib_elts[i].getElementsByTagName("value")[0];
      var username = imageAttrib_elts[i].getElementsByTagName("username")[0];

      // not guaranteed to exist
      value = value.firstChild && value.firstChild.nodeValue || '';
      username = username.firstChild && username.firstChild.nodeValue || 'anonymous';

      main_canvas.GetImageAttributes()[i].SetAttributeName(name);
      main_canvas.GetImageAttributes()[i].SetAttributeValue(value);
      main_canvas.GetImageAttributes()[i].SetUsername(username);
    }

    num_orig_anno = num_obj;

    for(pp=0; pp < num_obj; pp++) {
      var id = obj_elts[pp].getElementsByTagName("id");

      main_canvas.GetAnnotations()[pp] = new annotation(pp);
      main_canvas.GetAnnotations()[pp].SetDeleted(parseInt(obj_elts[pp].getElementsByTagName("deleted")[0].firstChild.nodeValue));
      main_canvas.GetAnnotations()[pp].SetVerified(parseInt(obj_elts[pp].getElementsByTagName("verified")[0].firstChild.nodeValue));

      if((obj_elts[pp].getElementsByTagName("username").length>0) && obj_elts[pp].getElementsByTagName("username")[0].firstChild)
        main_canvas.GetAnnotations()[pp].SetUsername(obj_elts[pp].getElementsByTagName("username")[0].firstChild.nodeValue);
      else
        main_canvas.GetAnnotations()[pp].SetUsername("anonymous");

      if((obj_elts[pp].getElementsByTagName("automatic").length>0) && obj_elts[pp].getElementsByTagName("automatic")[0].firstChild)
        main_canvas.GetAnnotations()[pp].SetAutomatic(obj_elts[pp].getElementsByTagName("automatic")[0].firstChild.nodeValue);

      if(id && (id.length>0) && id[0].firstChild)
        main_canvas.GetAnnotations()[pp].SetID(id[0].firstChild.nodeValue);
      else
        main_canvas.GetAnnotations()[pp].SetID(""+pp);

      if(!obj_elts[pp].getElementsByTagName("name")[0].firstChild)
        main_canvas.GetAnnotations()[pp].SetObjName('');
//        main_canvas.GetAnnotations()[pp] = new annotation('');
      else
        main_canvas.GetAnnotations()[pp].SetObjName(obj_elts[pp].getElementsByTagName("name")[0].firstChild.nodeValue);
//        main_canvas.GetAnnotations()[pp] = new annotation(obj_elts[pp].getElementsByTagName("name")[0].firstChild.nodeValue);

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
  }
  else if(objXml.status==404) {
    var objXml = XMLGet(main_image.GetFileInfo().GetTemplatePath());
    if(objXml.status==404) {
      objXml = XMLGet('annotationCache/XMLTemplates/labelme.xml');
    }
//    var objXml = new XMLHttpRequest();
//    objXml.open("GET",'anno_template.xml',false);
//    objXml.send(null);
    anno_xml = objXml.responseXML;
    anno_xml.getElementsByTagName("filename")[0].firstChild.nodeValue = '\n'+main_image.GetFileInfo().GetImName()+'\n';
    anno_xml.getElementsByTagName("folder")[0].firstChild.nodeValue = '\n'+main_image.GetFileInfo().GetDirName()+'\n';

    main_canvas.CreateNewAnnotations(0);
    num_orig_anno = 0;
  }
  else {
    alert('Unknown objXml.status');
  }
}

// This function creates a form (replaces popup) on right hand side to
// replace the annotation link for the polygon that is selected, either
// by selecting the link or clicking on the polygon in the picture
function CreateEditAnnotationForm(idx) {
  var html_str = '<div id="edit_polygon_div">' +
    '<form action="javascript:return false;" style="margin-bottom:0px;background-color: rgb(238,238,255); ">' +
    '<table style="font-size:small;">' +
    '<tr>' +
    '<td style="text-decoration:nowrap;">' +
    '<br />' +
    'Name: ' +
    '<input type="text" id="objEnter" name="objEnter" value="' + main_canvas.GetAnnotations()[idx].GetObjName() + '" size="20em" style="font-family:Arial;font-size:small;" onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)main_handler.SubmitEditLabel();" />' +
    '<br />' +
    '<table width="100%"><tr><td><input type="button" id="polygon_submit" name="polygon_submit" onclick="main_handler.SubmitEditLabel();" value="Save" style="font-family:Arial;font-size:small;" /></td>' +
    '     ' +
    '<td align="right"><font size="-2"><a id="polygon_delete" name="polygon_delete" href="javascript:main_handler.EditBubbleDeleteButton();" style="font-family:Arial;"><b>Delete</b></a></font></td></tr></table>' +
//     '<input type="button" id="polygon_delete" name="polygon_delete" value="Delete" onclick="main_handler.EditBubbleDeleteButton();" style="font-family:Arial;font-size:small;" />' +
    '</td>' +
    '</tr>' +
    '</table>' +
    '</form>' +
    '</div>';

  InsertAfterDiv(html_str,'LinkAnchor' + idx);
  var p = document.getElementById('Link'+idx);
  p.parentNode.removeChild(p);
  document.getElementById('objEnter').focus();
  document.getElementById('objEnter').select();
};

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
