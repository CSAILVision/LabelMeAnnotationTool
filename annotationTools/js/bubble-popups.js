// Created: 05/05/2007
// Updated: 05/05/2007

// Bubble popups
// Keeps track of all information related to a bubble popup.
// Eventually, all of this will be abstracted into a class.

  // *******************************************
  // Public methods:
  // *******************************************

function mkPopup(left,top) { 
  wait_for_input = 1;
  var html_str = mkBubbleHTML(left,top,'query');
  InsertAfterDiv(html_str,'main_section');
  document.getElementById('objEnter').focus();
  //for some reason IE needs two focuses here
  document.getElementById('objEnter').focus();
 }

function CloseQueryPopup() {
  wait_for_input = 0;  
  var p = document.getElementById('myPopup');
  p.parentNode.removeChild(p);
}

function mkEditPopup(left,top,obj_name) {
  edit_popup_open = 1;
  var html_str = mkBubbleHTML(left,top,'edit',obj_name);  
  InsertAfterDiv(html_str,'main_section');
  document.getElementById('objEnter').focus();
  document.getElementById('objEnter').select();
}

function mkVerifiedPopup(left,top) {
  edit_popup_open = 1;
  var html_str = mkBubbleHTML(left,top,'verified');  
  InsertAfterDiv(html_str,'main_section');
}

function CloseEditPopup() {
  edit_popup_open = 0;
  var p = document.getElementById('myPopup');
  if(p) p.parentNode.removeChild(p);
}

  // *******************************************
  // Private methods:
  // *******************************************

function mkBubbleHTML(left,top,bubble_type,obj_name) {
  var ud = 1;               
  var html_str;             
  if(top >= 213) {          
    top -= 213;
    ud = 0;
  }

  if(ud) {
    html_str = GetMainDiv(left,top) + GetTapImgUD() + GetNImgUD() +
      GetNEImgUD() + GetWImgUD() + GetCImgUD() + GetEImgUD() + 
      GetSWImgUD() + GetSImgUD() + GetSEImgUD();
  }
  else {
    html_str = GetMainDiv(left,top) + GetNWImg() + GetNImg() +
      GetNEImg() + GetWImg() + GetCImg() + GetEImg() + 
      GetSTapImg() + GetSRightImg() + GetSEImg();
  }
  switch(bubble_type) {
  case 'query':
    html_str += GetPopupForm(ud);
    break;
  case 'edit':
    html_str += GetCloseImg(ud) + GetEditPopupForm(ud,obj_name);
    break;
  case 'verified':
    html_str += GetCloseImg(ud) + GetVerifiedPopupForm(ud);
    break;
  default:
    alert('Invalid bubble_type');
  }
  return html_str;
}

function GetMainDiv(left,top) {

  return '<div id="myPopup" class="noprint"'+
  ' style="position: absolute; '+
          'z-index: 5000; '+
          'left: '+ left +'px; '+
          'top: '+ top +'px; ' +
          '"'+
  ' oncontextmenu="return false">';


}

function GetNWImg() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none; width: 25px; height: 25px; '+
    'position: absolute; left: 0px; top: 0px; z-index: 0; '+
    '-moz-user-select: none;" src="annotationTools/GoogleIcons/iw_nw.png" height="25"'+
    ' width="25" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none; width: 25px; height: 25px; '+
    'position: absolute; left: 0px; top: 0px; z-index: 0; '+
    '-moz-user-select: none;" src="annotationTools/GoogleIcons/iw_nw.gif" height="25"'+
    ' width="25" />';
  }
}

function GetNImg() {
  return '<img style="border: 0pt none ; height: 25px; position:'+
  'absolute; left: 25px; top: 0px; z-index: 0; -moz-user-select: none;'+
  'width: 212px;" src="annotationTools/GoogleIcons/iw_n.png" height="25" width="640" />';
}

function GetNEImg() {
  if(IsNetscape() || IsSafari()) {
     return '<img style="border: 0pt none ; width: 25px;'+
    'height: 25px; position: absolute; top: 0px; z-index: 0;'+
    '-moz-user-select: none; left: 237px;"'+
    ' src="annotationTools/GoogleIcons/iw_ne.png" height="25" width="25" />';
  }
  else if(IsMicrosoft()) {
     return '<img style="border: 0pt none ; width: 25px;'+
    'height: 25px; position: absolute; top: 0px; z-index: 0;'+
    '-moz-user-select: none; left: 237px;"'+
    ' src="annotationTools/GoogleIcons/iw_ne.gif" height="25" width="25" />';
  }
}

function GetWImg() {
  return '<img style="border: 0pt none ; width: 25px; position:'+
  'absolute; left: 0px; top: 25px; z-index: 0; -moz-user-select: none;'+
  'height: 92px;" src="annotationTools/GoogleIcons/iw_w.png" height="640" width="25" />';
}

function GetCImg() {
  return '<img style="border: 0pt none ; position:'+
  'absolute; left: 25px; top: 25px; z-index: 0; -moz-user-select: none;'+
  'width: 212px; height: 92px;" src="annotationTools/GoogleIcons/iw_c.png" height="640"'+
  ' width="640" />';
}

function GetEImg() {
  return '<img style="border: 0pt none ; width: 25px; position:'+
  'absolute; top: 25px; z-index: 0; -moz-user-select: none; height: 92px;'+
  'left: 237px;" src="annotationTools/GoogleIcons/iw_e.png" height="640" width="25" />';
}

function GetSWImg() {
  return '<img style="border: 0pt none ; width: 25px;'+
  'height: 96px; position: absolute; left: 0px; z-index: 0;'+
  '-moz-user-select: none; top: 117px;"'+
  'src="annotationTools/GoogleIcons/iw_sw.png" height="96" width="25" />';

}

function GetSLeftImg() {
  return '<img style="border: 0pt none ; height: 96px; position:'+
  'absolute; left: 25px; z-index: 0; -moz-user-select: none; width: 53px;'+
  'top: 117px;" src="annotationTools/GoogleIcons/iw_s.png" height="96" width="640" />';
}

function GetSTapImg() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; width: 98px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 0px;'+
    'top: 117px;" src="annotationTools/GoogleIcons/iw_tap.png" height="96" width="98" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none ; width: 98px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 0px;'+
    'top: 117px;" src="annotationTools/GoogleIcons/iw_tap.gif" height="96" width="98" />';
  }
}

function GetSRightImg() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 98px;'+
    'width: 139px; top: 117px;" src="annotationTools/GoogleIcons/iw_s.png" height="96" width="640" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none ; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 98px;'+
    'width: 139px; top: 117px;" src="annotationTools/GoogleIcons/iw_s.gif" height="96" width="640" />';
  }
}

function GetSEImg() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; width: 25px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 237px;'+
    'top: 117px;" src="annotationTools/GoogleIcons/iw_se.png" height="96" width="25" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none ; width: 25px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 237px;'+
    'top: 117px;" src="annotationTools/GoogleIcons/iw_se.gif" height="96" width="25" />';
  }
}

function GetTapImgUD() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; width: 98px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 0px;'+
    'top: 0px;" src="annotationTools/GoogleIcons/iw_tap_ud.png" height="96" width="98" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none ; width: 98px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 0px;'+
    'top: 0px;" src="annotationTools/GoogleIcons/iw_tap_ud.gif" height="96" width="98" />';
  }
}

function GetNImgUD() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 98px;'+
    'width: 139px; top: 0px;" src="annotationTools/GoogleIcons/iw_n_ud.png" height="96" width="640" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none ; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 98px;'+
    'width: 139px; top: 0px;" src="annotationTools/GoogleIcons/iw_n_ud.gif" height="96" width="640" />';
  }
}

function GetNEImgUD() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; width: 25px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 237px;'+
    'top: 0px;" src="annotationTools/GoogleIcons/iw_ne_ud.png" height="96" width="25" />';
  }
  else if(IsMicrosoft()) { 
    return '<img style="border: 0pt none ; width: 25px; height: 96px;'+
    'position: absolute; z-index: 0; -moz-user-select: none; left: 237px;'+
    'top: 0px;" src="annotationTools/GoogleIcons/iw_ne_ud.gif" height="96" width="25" />';
  }
}

function GetWImgUD() {
  return '<img style="border: 0pt none ; width: 25px; position:'+
  'absolute; left: 0px; top: 96px; z-index: 0; -moz-user-select: none;'+
  'height: 92px;" src="annotationTools/GoogleIcons/iw_w.png" height="640" width="25" />';
}

function GetCImgUD() {
  return '<img style="border: 0pt none ; position:'+
  'absolute; left: 25px; top: 96px; z-index: 0; -moz-user-select: none;'+
  'width: 212px; height: 92px;" src="annotationTools/GoogleIcons/iw_c.png" height="640"'+
  ' width="640" />';
}

function GetEImgUD() {
  return '<img style="border: 0pt none ; width: 25px; position:'+
  'absolute; top: 96px; z-index: 0; -moz-user-select: none; height: 92px;'+
  'left: 237px;" src="annotationTools/GoogleIcons/iw_e.png" height="640" width="25" />';
}

function GetSWImgUD() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none; width: 25px; height: 25px; '+
    'position: absolute; left: 0px; top: 188px; z-index: 0; '+
    '-moz-user-select: none;" src="annotationTools/GoogleIcons/iw_sw_ud.png" height="25"'+
    ' width="25" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none; width: 25px; height: 25px; '+
    'position: absolute; left: 0px; top: 188px; z-index: 0; '+
    '-moz-user-select: none;" src="annotationTools/GoogleIcons/iw_sw_ud.gif" height="25"'+
    'width="25" />';
  }
}

function GetSImgUD() {
  return '<img style="border: 0pt none ; height: 25px; position:'+
  'absolute; left: 25px; top: 188px; z-index: 0; -moz-user-select: none;'+
  'width: 212px;" src="annotationTools/GoogleIcons/iw_s_ud.png" height="25" width="640" />';
}

function GetSEImgUD() {
  if(IsNetscape() || IsSafari()) {
    return '<img style="border: 0pt none ; width: 25px;'+
    'height: 25px; position: absolute; top: 188px; z-index: 0;'+
    '-moz-user-select: none; left: 237px;"'+
    ' src="annotationTools/GoogleIcons/iw_se_ud.png" height="25" width="25" />';
  }
  else if(IsMicrosoft()) {
    return '<img style="border: 0pt none ; width: 25px;'+
    'height: 25px; position: absolute; top: 188px; z-index: 0;'+
    '-moz-user-select: none; left: 237px;"'+
    ' src="annotationTools/GoogleIcons/iw_se_ud.gif" height="25" width="25" />';
  }
}

function GetPopupForm(ud) {
  var top;
  if(ud) top = 86;
  else top = 15;
  var html_str = "";
  
  html_str += '<div style="position: absolute; left: 15px;'+
  'top: ' + top + 'px; z-index: 0; cursor: auto; width: 232px; height: 112px;'+
  'visibility: visible;"><div style="padding-right: 8px; width: 14em;">'+
  '<div id="objQuery" style="font-weight: bold; visibility: visible;">';

//   html_str += '<div style="position: absolute; left: 15px;'+
//   'top: ' + top + 'px; z-index: 0; cursor: auto; width: 232px; height: 112px;'+
//   'visibility: visible;"><div><div style="padding-right: 8px; width: 14em;">'+
//   '<div id="objQuery" style="font-weight: bold; visibility: visible;">';
  

  html_str += 'What is this object?';
  html_str += '<div style="margin-top: 20px; z-index: 0;">';
//   var m = main_image.GetFileInfo().GetMode();
//   if(m=='mt') {
//     html_str += '<form id="mt_form" method="POST" action="http://workersandbox.mturk.com/mturk/externalSubmit">';
//     html_str += '<input type="hidden" id="assignmentId" name="assignmentId" value="' + main_image.GetFileInfo().assignmentId + '" />';
//     html_str += '</form>';
//   }

  if(object_choices=='...') {
    html_str += '<input name="objEnter" id="objEnter" type="text" tabindex="0" value="" title="Enter the object\'s name here." ';
    
    // If press enter, then submit; if press ESC, then delete:
    html_str +=
      ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)main_handler.SubmitQuery();if(c==27)main_handler.WhatIsThisObjectDeleteButton();" /><br />';
  }
  else {
    html_str += '<select name="objEnter" id="objEnter" title="Enter the object\'s name here." onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)main_handler.SubmitQuery();if(c==27)main_handler.WhatIsThisObjectDeleteButton();">';
    for(var i = 0; i < object_choices.length; i++) {
      html_str += '<option value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
    }
    html_str += '</select><br />';
  }
  

  html_str +=
    '<input type="button" value="Done" title="Press this button after you have provided the object\'s name." onclick="main_handler.SubmitQuery();" tabindex="0" /> '; 

  html_str +=
  '<input type="button" value="Undo close" title="Press this button if you accidentally closed the polygon.  You can continue adding control points." onclick="main_handler.WhatIsThisObjectUndoCloseButton();" tabindex="0" /> ';

  html_str +=
  '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" /> ';

  html_str +=
  '</div>'+
  '</div></div></div></div>';

  return html_str;
}

function GetVerifiedPopupForm(ud) {
  var top;
  if(ud) top = 86;
  else top = 15;

  return '<div style="position: absolute; left: 15px;'+
    'top: ' + top + 'px; z-index: 0; cursor: auto; width: 232px; height: 112px;'+
    'visibility: visible;"><div><div style="padding-right: 8px; width: 14em;">'+
    '<div id="objQuery" style="font-weight: bold; visibility: visible;">'+
    'This annotation is already good enough.  You cannot change or delete this one.</div>'+
    '<\/div><\/div><\/div><\/div>';
}

function GetEditPopupForm(ud,obj_name) {
//   WriteLogMsg('*Editing_object');
  var top;
  if(ud) top = 86;
  else top = 15;

  var html_str =
  '<div style="position: absolute; left: 15px;'+
  'top: ' + top + 'px; z-index: 0; cursor: auto; width: 232px; height: 112px;'+
  'visibility: visible;"><div><div style="padding-right: 8px; width: 14em;">'+
  '<div id="objQuery" style="font-weight: bold; visibility: visible;">'+
    'Edit/delete object<\/div><div style="margin-top: 20px; z-index: 0;">';

  if((IsUserAnonymous() || (!IsCreator(main_select_canvas.annotation.GetUsername()))) && (!IsUserAdmin()) && (main_select_canvas.annotation.GetAnnoID()<num_orig_anno) && !action_RenameExistingObjects) {
    html_str += '<div title="You do not have permission to edit this object\'s name."><font size="3">Object name: ' + obj_name + '</font></div><br />';
  }
  else {
    if(object_choices=='...') {
      html_str +=
	'<input name="objEnter" id="objEnter" type="text" ';
      html_str +='value="' + obj_name + '" ';
      // If press enter, then submit:
      html_str +=
	' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)main_handler.SubmitEditLabel();" /><br />';
    }
    else {
      html_str += '<select name="objEnter" id="objEnter" title="Enter the object\'s name here." onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)main_handler.SubmitEditLabel();">';
      for(var i = 0; i < object_choices.length; i++) {
	if(object_choices[i]==obj_name) {
	  html_str += '<option selected="selected" value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
	}
	else {
	  html_str += '<option value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
	}
      }
      html_str += '</select><br />';
    }
  }

  html_str +=
'<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" /> ';
  if((IsUserAnonymous() || (!IsCreator(main_select_canvas.annotation.GetUsername()))) && (!IsUserAdmin()) && (main_select_canvas.annotation.GetAnnoID()<num_orig_anno) && !action_ModifyControlExistingObjects) {
    html_str +=
      '<input type="button" disabled="true" value="Adjust polygon" title="You do not have permission to update this polygon\'s control points." onclick="main_handler.EditBubbleAdjustPolygon();" /> ';
  }
  else {
    html_str +=
      '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="main_handler.EditBubbleAdjustPolygon();" /> ';
  }
  if((IsUserAnonymous() || (!IsCreator(main_select_canvas.annotation.GetUsername()))) && (!IsUserAdmin()) && (main_select_canvas.annotation.GetAnnoID()<num_orig_anno) && !action_DeleteExistingObjects) {
    html_str +=
      '<input type="button" disabled="true" value="Delete" title="You do not have permission to delete this polygon." onclick="main_handler.EditBubbleDeleteButton();" /> ';
  }
  else {
    html_str +=
      '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" /> ';
  }

  html_str +=
  '</div>'+
  '</div></div></div></div>';

  return html_str;
}

function GetCloseImg(ud) {  
  var top;
  if(ud) top = 81;
  else top = 10;

  return '<img style="border: 0pt none ; width: 14px; height: 13px; z-index: 4; '+
  '-moz-user-select: none; position: absolute; cursor: pointer; left: '+
  '237px; top: ' + top + 'px;" src="annotationTools/GoogleIcons/close.gif" '+
  'height="13" width="14" onclick="main_handler.SelectedToRest()" />';
}
