// THIS CODE TAKES CARE OF THE BUBBLE THAT APPEARS ON THE ANNOTATION TOOL
// WHEN EDITING OBJECT PROPERTIES

// *******************************************
// Public methods:
// *******************************************

// This function creates the popup bubble.  Takes as input (x,y) location,
// the html to include inside the popup bubble, and the dom element to 
// attach to. Returns the dom element name for the popup bubble.
function CreatePopupBubble(left,top,innerHTML,dom_attach) {
  var html_str;
  var bubble_name = 'myPopup';
  
  // Adjust location to account for the displacement of the arrow:
  left -= 22;
  if (left < 5) left = 5;
  
  // Select the vertical position of the bubble decoration arrow
  if (top > 214) {
    html_str  = '<div class= "bubble" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
  }
  else {
    html_str  = '<div class= "bubble top" id="' + bubble_name + '" style="position:absolute;z-index:5; left:' + left + 'px; top:' + top + 'px;">';
  }

  // Insert bubble inner contents:
  html_str += innerHTML;

  // Close div tag:
  html_str += '</div>';
  
  // Insert bubble into the DOM tree:
  $('#'+dom_attach).append(html_str);
  
  // Place bubble in the right location taking into account the rendered size and the location of the arrow
  if(top > 214) {  
    h = $('#'+bubble_name).height();
    document.getElementById(bubble_name).style.top = (top-h-80) + 'px';
  }
  else {
    document.getElementById(bubble_name).style.top = (top) + 'px';
  }

  return bubble_name;
}

// This function creates the close button at the top-right corner of the 
// popup bubble. Inputs are the dom_bubble name (returned from 
// CreatePopupBubble()) and (optionally) a function to run when the close
// button is pressed.
function CreatePopupBubbleCloseButton(dom_bubble,close_function) {
  if(arguments.length==1) {
    close_function = function() {return;};
  }
  var html_str = '<img id="' + dom_bubble + '_closebutton" style="border: 0pt none; width:14px; height:14px; z-index:4; -moz-user-select:none; position:absolute; cursor:pointer; right:8px; top: 8px;" src="Icons/close.png" height="14" width="14" />';
  $('#'+dom_bubble).append(html_str);
  $('#'+dom_bubble+'_closebutton').mousedown(function () {
      $('#'+dom_bubble).remove();
      close_function();
      return;
    });
}


// *******************************************
// All functions below here need to be moved to their appropriate module:
// *******************************************

// THINGS THAT WILL BE GOOD TO SIMPLIFY:
//  1- why are there two functions -almost-identical- to close the bubble?
//  2- why is different the way the data is submitted in edit and query? I think with LM_xml data handling this will be simplified.
//  3- I want functions
//        LM_xml.store(obj_index, fieldname, value)
//        LM_xml.getvalue(obj_index, fieldname)
//        LM_xml.sendtoserver
//

// Query popup bubble:
function mkPopup(left,top) {
  wait_for_input = 1;
  var innerHTML = GetPopupFormDraw();
  CreatePopupBubble(left,top,innerHTML,'main_section');

  // Focus the cursor inside the box
  setTimeout("$('#objEnter').focus();",1);
}

function mkEditPopup(left,top,anno) {
  edit_popup_open = 1;
  var innerHTML = GetPopupFormEdit(anno);
  var dom_bubble = CreatePopupBubble(left,top,innerHTML,'main_section');
  CreatePopupBubbleCloseButton(dom_bubble,StopEditEvent);

  // Focus the cursor inside the box
  $('#objEnter').select();
  $('#objEnter').focus();
}

function CloseQueryPopup() {
  wait_for_input = 0;
  $('#myPopup').remove();
}

function CloseEditPopup() {
  edit_popup_open = 0;
  $('#myPopup').remove();
}

// ****************************
// Forms:
// ****************************

function GetPopupFormDraw() {
	
  html_str = GetPopupFormDrawButtons();
  
  html_str += "<b>Enter object name</b><br />";
  html_str += HTMLobjectBox("");
  
  if(use_attributes) {
    html_str += "<b>Enter attributes</b><br />";
    html_str += HTMLattributesBox("");
    html_str += HTMLoccludedBox("");
  }
  if(use_parts) {
    html_str += HTMLpartsBox("");
  }
  //console.log(html_str);
  html_str += GetPopupFormDrawButtons();
    
  return html_str;
}

function GetPopupFormDrawButtons() {
  html_str = "<div style='text-align: center;'>";
  // Done button:
  html_str += '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';
  // Undo close button:
  html_str += '<input type="button" value="Undo close" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="UndoCloseButton();" tabindex="0" />';
  // Delete button:
  html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" />';
  
  html_str += "</div>";
  return html_str;
}

function GetPopupFormEdit(anno) {
  // get object name and attributes from 'anno'
  var obj_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
  if(obj_name=="") obj_name = "?";
  var attributes = LMgetObjectField(LM_xml,anno.anno_id,'attributes');
  var occluded = LMgetObjectField(LM_xml,anno.anno_id,'occluded');
  var parts = anno.GetParts();
  
  html_str = GetPopupFormEditButtons(anno);
  html_str += "<b>Enter object name</b><br />";
  html_str += HTMLobjectBox(obj_name);
  
  if(use_attributes) {
    html_str += "<b>Enter attributes</b><br />";
    html_str += HTMLattributesBox(attributes);
    html_str += HTMLoccludedBox(occluded);
  }
  
  if(use_parts) {
    html_str += HTMLpartsBox(parts);
  }
    
  html_str += GetPopupFormEditButtons(anno);
  return html_str;
}

function GetPopupFormEditButtons(anno) {
  
  html_str = "<div style='text-align: center;'>";
  // Done button:
  if (video_mode) html_str += '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_media.SubmitEditObject();" tabindex="0" />';
  
  else html_str += '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" tabindex="0" />';
 
  // Scribble: if anno.GetType() != 0 then scribble mode:
  // Adjust polygon button:
  if (anno.GetType() == 0) {
    html_str += '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="javascript:AdjustPolygonButton();" />';
  }
  else {
    html_str += '<input type="button" value="Edit Scribbles" title="Press this button if you wish to update the segmentation." onclick="javascript:EditBubbleEditScribble();" />';  
  }

  // Delete button:
  html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" tabindex="0" />';
  
  html_str += "</div>";
  return html_str;
}

// ****************************
// Simple building blocks:
// ****************************

var obj_name_gen = 0;

// Shows the box to enter the object name
function HTMLobjectBox(obj_name) {
  var html_str="";
  
  var the_name = obj_name;
  
  if (the_name=='') {
	obj_name_gen++;
	if( obj_name_gen > 9 )
	{
		the_name = '00' + obj_name_gen;
	}
	else
	{
		the_name = '000' + obj_name_gen;
	}
  }
  
  html_str += '<input name="objEnter" id="objEnter" type="text" style="width:345px;" tabindex="0" value="'+the_name+'" title="Enter the object\'s name here. Avoid application specific names, codes, long descriptions. Use a name you think other people would agree in using. "';
  
  html_str += ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)';
        
  // if obj_name is empty it means that the box is being created
  if (obj_name=='') {
    // If press enter, then submit; if press ESC, then delete:
    if (video_mode) html_str += 'main_media.SubmitObject();if(c==27) main_handler.WhatIsThisObjectDeleteButton();" ';
    else html_str += 'main_handler.SubmitQuery();if(c==27)main_handler.WhatIsThisObjectDeleteButton();" ';
  }
  else {
    // If press enter, then submit:
    if (video_mode) html_str += 'main_media.SubmitEditObject();" ';
    else html_str += 'main_handler.SubmitEditLabel();" ';
  }
  
  // if there is a list of objects, we need to habilitate the list
  if(object_choices=='...') {
    html_str += '/>'; // close <input
  }
  else {
    html_str += 'list="datalist1" />'; // insert list and close <input
    html_str += '<datalist id="datalist1"><select style="display:none">';
    for(var i = 0; i < object_choices.length; i++) {
      html_str += '<option value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
    }
    html_str += '</select></datalist>';
  }
  
  html_str += '<br />';
  
  return html_str;
}

// ****************************
// ATTRIBUTES:
// ****************************
// ?attributes=object:car;brand:seat/ford;color:...;comments:...

// is the object occluded?
function HTMLoccludedBox(occluded) {
  var html_str="";
  
  // by default, the value of occluded is "no"
  if (!(occluded=="no" || occluded=="yes")) {
    occluded="no";
  }
  
  // the value of the selection is inside a hidden field:
  html_str += 'Is occluded? <input type="hidden" name="occluded" id="occluded" value="'+occluded+'"/>';

  // generate radio button
  if (occluded=='yes') {
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes" checked="yes" onclick="document.getElementById(\'occluded\').value=\'yes\';" />yes';
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no"  onclick="document.getElementById(\'occluded\').value=\'no\';" />no';
  }
  else {
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes"  onclick="document.getElementById(\'occluded\').value=\'yes\';" />yes';
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no" checked="yes"  onclick="document.getElementById(\'occluded\').value=\'no\';" />no';
  }
  html_str += '<br />';
  
  return html_str;
}

// Attributes of polygon as a list of radio buttons
function HTMLattributesBox(attList) {
	var html_str="";
	if( attList == "" ) {
		attList = "le eye roi";
	}
	var attribs = attList.split(' ');

	// Useful value for radio buttons
	var checked="checked='true'";
	
	// check valid tags, as of spec TestBenchPluginsFunctionalSpecs
	// positionning
	var valid = true;
	var indexLe = attribs.indexOf( 'le' );
	var indexRi = attribs.indexOf( 'ri' );
	var pos = 0; // def value
	var posChecked = new Array( "", "" );
	if( indexLe != -1 ) {
		pos = 0;
	}
	if( indexRi != -1 ) {
		pos = 1;
	}

	var posVal = attribs[0];
	if( pos != -1 ) {
		posChecked[pos] = checked;
	}

	// object type 
	var indexEye = attribs.indexOf( 'eye' );
	var indexULid = attribs.indexOf( 'upperelid' );
	var indexLLid = attribs.indexOf( 'lowerelid' );
	var indexGli = attribs.indexOf( 'glint' );
	var indexPup = attribs.indexOf( 'pupil' );
	var indexLim = attribs.indexOf( 'limbus' );
	var type = 0; //def val
	var typeChecked = new Array( "", "", "", "", "", "" );
	if( indexEye != -1 ) {
		type = 0;
	}
	if( indexULid != -1 ) {
		type = 1;
	}
	if( indexLLid != -1 ) {
		type = 2;
	}
	if( indexGli != -1 ) {
		type = 3;
	}
	if( indexPup != -1 ) {
		type = 4;
	}
	if( indexLim != -1 ) {
		type = 5;
	}
	var typeVal = attribs[1];
	if( type != -1 ) {
		typeChecked[type] = checked;
	}
	
	// object shape
	var indexRoi = attribs.indexOf( 'roi' );
	var indexCon = attribs.indexOf( 'contour' );
	var indexOco = attribs.indexOf( 'outercorner' );
	var indexIco = attribs.indexOf( 'innercorner' );
	var shape = 0; //def value
	var shapeChecked = new Array( "", "", "", "" );
	if( indexRoi != -1 ) {
		shape = 0;
	}
	if( indexCon != -1 ) {
		shape = 1;
	}
	if( indexOco != -1 ) {
		shape = 2;
	}
	if( indexIco != -1 ) {
		shape = 3;
	}
	var shapeVal = attribs[2];
	if( shape != -1 ) {
		shapeChecked[shape] = checked;
	}

	// Position: the value of the selection is inside a hidden field:
	// generate radio button
	html_str += '<fieldset><legend>Position:</legend>';
	html_str += '<input type="hidden" name="position" id="position" value="'+posVal+'"/>';
	html_str += '<input type="radio" name="pos" id="pos" value="le" '+posChecked[0]+' onclick="document.getElementById(\'position\').value=\'le\';" />left';
	html_str += '<input type="radio" name="pos" id="pos" value="ri" '+posChecked[1]+' onclick="document.getElementById(\'position\').value=\'ri\';" />right';
	html_str += '</fieldset>';

	// Type: the value of the selection is inside a hidden field:
	// generate radio button
	html_str += '<fieldset><legend>Type:</legend>';
	html_str += '<input type="hidden" name="type" id="type" value="'+typeVal+'"/>';
	html_str += '<input type="radio" name="typ" id="typ" value="eye" '+typeChecked[0]+' onclick="document.getElementById(\'type\').value=\'eye\';" />Eye';
	html_str += '<input type="radio" name="typ" id="typ" value="upperelid" '+typeChecked[1]+' onclick="document.getElementById(\'type\').value=\'upperelid\';" />Upper Eyelid';
	html_str += '<input type="radio" name="typ" id="typ" value="lowerelid" '+typeChecked[2]+' onclick="document.getElementById(\'type\').value=\'lowerelid\';" />Lower Eyelid';
	html_str += '<input type="radio" name="typ" id="typ" value="glint" '+typeChecked[3]+' onclick="document.getElementById(\'type\').value=\'glint\';" />Glint';
	html_str += '<input type="radio" name="typ" id="typ" value="pupil" '+typeChecked[4]+' onclick="document.getElementById(\'type\').value=\'pupil\';" />Pupil';
	html_str += '<input type="radio" name="typ" id="typ" value="limbus" '+typeChecked[5]+' onclick="document.getElementById(\'type\').value=\'limbus\';" />Limbus';
	html_str += '</fieldset>';

	// Shape: the value of the selection is inside a hidden field:
	// generate radio button
	html_str += '<fieldset><legend>Shape:</legend>';
	html_str += '<input type="hidden" name="shape" id="shape" value="'+shapeVal+'"/>';
	html_str += '<input type="radio" name="sha" id="sha" value="roi" '+shapeChecked[0]+' onclick="document.getElementById(\'shape\').value=\'roi\';" />ROI';
	html_str += '<input type="radio" name="sha" id="sha" value="contour" '+shapeChecked[1]+' onclick="document.getElementById(\'shape\').value=\'contour\';" />Contour';
	html_str += '<input type="radio" name="sha" id="sha" value="outercorner" '+shapeChecked[2]+' onclick="document.getElementById(\'shape\').value=\'outercorner\';" />OuterCorner';
	html_str += '<input type="radio" name="sha" id="sha" value="innercorner" '+shapeChecked[3]+' onclick="document.getElementById(\'shape\').value=\'innercorner\';" />InnerCorner';
	html_str += '</fieldset>';
  
	return html_str;
}

// Boxes to enter attributes
/*function HTMLattributesBox(attList) {
  return '<textarea name="attributes" id="attributes" type="text" style="width:220px; height:3em;" tabindex="0" title="Enter a comma separated list of attributes, adjectives or other object properties">'+attList+'</textarea>';
}*/


// ****************************
// PARTS:
// ****************************
function HTMLpartsBox(parts) {
  var html_str="";
  if (parts.length>0) {
    if (parts.length==1) {
      html_str = 'Object has 1 part.';
    }
    else {
      html_str = 'Object has '+parts.length+' parts.';
    }
  }
  
  return html_str;
}
