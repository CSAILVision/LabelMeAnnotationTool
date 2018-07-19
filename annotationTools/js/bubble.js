/** @file This file contains functions that draw the popup bubble during labeling or editing an object. */


// *******************************************
// Public methods:
// *******************************************

/** This function creates the popup bubble.  
 * @param {float} left - xlocation of the bubble
 * @param {float} top - ylocation of the bubble
 * @param {string} innerhtml - extra html content for the bubble
 * @param {string} dom_attach - id of the html element where it should be attached
 * @returns {string} bubble_name - dom element name for the popup bubble
*/
var part_bubble;
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
  if (part_bubble) $('#myPopup').css('background-color', 'rgb(255,230,230)')
    
  
  // Place bubble in the right location taking into account the rendered size and the location of the arrow
  if(top > 214) {  
    h = $('#'+bubble_name).height();
    document.getElementById(bubble_name).style.top = (top-h-80) + 'px';
  }
  else {
    document.getElementById(bubble_name).style.top = (top) + 'px';
  }
  setTimeout("$('#objEnter').focus();",1);
  if (autocomplete_mode){
    addAutoComplete();
  }
  return bubble_name;
}
function addAutoComplete(){
	var tags = [];
	$.getScript("./annotationTools/js/wordnet_data.js", function(){
    var NoResultsLabel = 'No results found';
		tags = data_wordnet;
		$( "#objEnter" ).autocomplete({
        
			  source: function( request, response ) {
          if (request.term.length > 0){
            var matcher2 = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term )+'$', "i" );
    			  var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
            res = $.grep( tags, function( item ){
              aux = matcher.test( item );
              return aux
            }); 
            res2 = $.grep( tags, function( item ){
              aux = matcher2.test( item );
              return aux
            });
            if (res2.length == 0){
              $("#objEnter").css('color', 'red');
            }
            else {
              $("#objEnter").css('color', 'black');
            }
            if (res.length == 0){
              res = [NoResultsLabel];
            }
    			  response(res);
          }
          else {
            $("#objEnter").css('color', 'black');
            response(false);
          }
        },
        // response: function(event, ui){
        //   console.log(this.term);
        //   if (ui.content.length > 0 && ui.content[0].label == NoResultsLabel) {
        //     //$("#empty-message").text("No results found");
        //     $("#objEnter").css('color', 'red');
        //   }
        //   else {
        //     $("#objEnter").css('color', 'black');
        //   }
        // },
        select: function (event, ui) {
            $("#objEnter").css('color', 'black');
            if (ui.item.label === NoResultsLabel || event.which == 13) {
                event.preventDefault();
            }
        },
        focus: function (event, ui) {
            if (ui.item.label === NoResultsLabel) {
                event.preventDefault();
            }
        },

        minLength: 0  
		}).data("ui-autocomplete")._renderItem =  function( ul, item ) {
            // Replace the matched text with a custom span. This
            // span uses the class found in the "highlightClass" option.
             var newText = String(item.value).replace(
                new RegExp("^" + $.ui.autocomplete.escapeRegex( this.term ), "i"),
                "<strong>$&</strong>");
            return $("<li></li>")
                .data("ui-item.autocomplete", item)
                .append("<a>" + newText + "</a>")
                .appendTo(ul);
              
          };
    $(".ui-autocomplete").css('font-size', '11px')
    $(".ui-autocomplete").css('font-family', 'BlinkMacSystemFont')
	});	

}

/** This function creates the close button at the top-right corner of the popup bubble
 * @param {string} dom_bubble - dom_bubble name
 * @param {function} close_button - function to run when the close button is pressed
*/
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
function mkPopup(left,top,scribble_popup) {
  wait_for_input = 1;
  var innerHTML = GetPopupFormDraw(scribble_popup);
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

function GetPopupFormDraw(scribble_form) {
  wait_for_input = 1;
  part_bubble = false;
  html_str = "<b>Nom de l'objet</b><br />";
  if (add_parts_to != null){
    html_str = "<b>Nom de l'objet</b><br />";
    part_bubble = true;
  }
  html_str += HTMLobjectBox("");
  
  if(use_attributes) {
    html_str += HTMLoccludedBox("");
    html_str += "<b>Attributs</b><br />";
    html_str += HTMLattributesBox("");
  }
  if(use_parts) {
    html_str += HTMLpartsBox("");
  }
  html_str += "<br />";
  
  // Done button:
  html_str += '<input type="button" value="Terminé" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';
  
  // Delete button:
  html_str += '<input type="button" style="float:right" value="Supprimer" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" />';
  html_str += '<br />' 
  // Undo close button/Keep editting
  if (!scribble_form) if (!bounding_box) html_str += '<input type="button" value="Annuler la fermeture" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="UndoCloseButton();" tabindex="0" />';
  else if (scribble_form) html_str += '<input type="button" value="Edit Scribble" title="Press this button if to keep adding scribbles." onclick="KeepEditingScribbles();" tabindex="0" />';
    
  return html_str;
}

function GetPopupFormEdit(anno) {
  // get object name and attributes from 'anno'
  edit_popup_open =  1;
  part_bubble = false;
  var obj_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
  if(obj_name=="") obj_name = "?";
  var attributes = LMgetObjectField(LM_xml,anno.anno_id,'attributes');
  var occluded = LMgetObjectField(LM_xml,anno.anno_id,'occluded');
  var parts = LMgetObjectField(LM_xml, anno.anno_id, 'parts');
  
  html_str = "<b>Nom de l'objet</b><br />"; 
  html_str += HTMLobjectBox(obj_name);
  
  if(use_attributes) {
    html_str += HTMLoccludedBox(occluded);
    html_str += "<b>Attributs</b><br />";
    html_str += HTMLattributesBox(attributes);
  }
  
  if(use_parts) {
    html_str += HTMLpartsBox(parts);
  }
  
  html_str += "<br />";
  
  // Done button:
  if (video_mode) html_str += '<input type="button" value="Terminé" title="Press this button when you are done editing." onclick="main_media.SubmitEditObject();" tabindex="0" />';
  
  else html_str += '<input type="button" value="Terminé" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" tabindex="0" />';
  
  /*************************************************************/
  /*************************************************************/
  // Scribble: if anno.GetType() != 0 then scribble mode:

  // Delete button:
  html_str += '<input type="button" style="float:right" value="Supprimer" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" tabindex="0" /><br />';
  // Adjust polygon button:
  if (anno.GetType() == 0) {
    html_str += '<input type="button" value="Ajuster le polygone" title="Press this button if you wish to update the polygon\'s control points." onclick="javascript:AdjustPolygonButton();" />';
  }
  else {
    html_str += '<input type="button" value="Edit Scribbles" title="Press this button if you wish to update the segmentation." onclick="javascript:EditBubbleEditScribble();" />';  
  }
  /*************************************************************/
  /*************************************************************/
    
  return html_str;
}

// ****************************
// Simple building blocks:
// ****************************

// Shows the box to enter the object name
function HTMLobjectBox(obj_name) {
  var html_str="";
  
  html_str += '<input name="objEnter" id="objEnter" type="text" style="width:220px;" tabindex="0" value="'+obj_name+'" title="Enter the object\'s name here. Avoid application specific names, codes, long descriptions. Use a name you think other people would agree in using. "';
  
  html_str += ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13){';
  //html_str += 'console.log($(".ui-autocomplete.ui-widget:visible").length);';
  // if obj_name is empty it means that the box is being created
  if (obj_name=='') {
    // If press enter, then submit; if press ESC, then delete:
    if (video_mode) html_str += 'main_media.SubmitObject()};if(c==27) main_handler.WhatIsThisObjectDeleteButton();" ';
    else html_str += 'main_handler.SubmitQuery()};if(c==27)main_handler.WhatIsThisObjectDeleteButton();" ';
  }
  else {
    // If press enter, then submit:
    if (video_mode) html_str += 'main_media.SubmitEditObject()};" ';
    else html_str += 'main_handler.SubmitEditLabel()};" ';
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
  html_str += 'Est obstrué ? <input type="hidden" name="occluded" id="occluded" value="'+occluded+'"/>';
  
  // generate radio button
  if (occluded=='yes') {
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes" checked="yes" onclick="document.getElementById(\'occluded\').value=\'yes\';" />Oui';
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no"  onclick="document.getElementById(\'occluded\').value=\'no\';" />Non';
  }
  else {
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="yes"  onclick="document.getElementById(\'occluded\').value=\'yes\';" />Oui';
    html_str += '<input type="radio" name="rboccluded" id="rboccluded" value="no" checked="yes"  onclick="document.getElementById(\'occluded\').value=\'no\';" />Non';
  }
  html_str += '<br />';
  
  return html_str;
}

// Boxes to enter attributes
function HTMLattributesBox(attList) {    
  return '<textarea name="attributes" id="attributes" type="text" style="width:220px; height:3em;" tabindex="0" title="Entrez une liste d\'attributs, d\'adjectifs ou d\'autres propriétés de l\'objet séparés par des virgules">'+attList+'</textarea>';
}


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
  else {
    html_str = 'Object has no parts.';
  }
  
  return '';
}
