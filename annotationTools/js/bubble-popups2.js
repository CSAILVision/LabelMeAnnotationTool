
 //mg
 function mkImageAttributePopup(left, top) {

    wait_for_input = 1;

    var html_str = mkBubbleHTML(left,top,'image_attribute');
    InsertAfterDiv(html_str,'main_section');

    //document.getElementById('objEnter').focus();
    //document.getElementById('objEnter').focus();
 }

//mg
function CloseImageAttributePopup() {
  attrib_popup_open = 0;
  var p = document.getElementById('myPopup');
  if(p) p.parentNode.removeChild(p);
}

//mg
function GetImageAttributePopupForm(ud,obj_name) {
//   WriteLogMsg('*Editing_object');
  var top;
  if(ud) top = 86;
  else top = 15;

  var html_str =
  '<div style="position: absolute; left: 15px;'+
  'top: ' + top + 'px; z-index: 0; cursor: auto; width: 232px; height: 112px;'+
  'visibility: visible;"><div><div style="padding-right: 8px; width: 14em;">'+
  '<div id="objQuery" style="font-weight: bold; visibility: visible;">'+
    'Add Image Attribute<\/div><div style="margin-top: 20px; z-index: 0;">';

  html_str +=
    '<input name="imageAttribEnter" id="imageAttribEnter" type="text" ';
  html_str +='value="' + obj_name + '" ';
  // If press enter, then submit:
  html_str +=
    ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)main_handler.SubmitImageAttribute();" /><br />';


  html_str +=
    '<input type="button" value="Done" title="Press this button when you are done." onclick="main_handler.SubmitImageAttribute();" /> ';

  html_str +=
    '<input type="button" value="Delete" title="Press this button if you wish to delete the attribute." onclick="main_handler.AddImageAttributeDeleteButton();" /> ';

  html_str +=
  '</div>'+
  '</div></div></div></div>';

  return html_str;
}

