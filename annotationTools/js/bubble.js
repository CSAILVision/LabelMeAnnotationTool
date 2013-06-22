// *******************************************
// Public methods:
// *******************************************

function mkPopup(left,top) {
    wait_for_input = 1;
    mkBubbleHTML(left,top,'query');
}

function CloseQueryPopup() {
    wait_for_input = 0;
    var p = document.getElementById('myPopup');
    p.parentNode.removeChild(p);
}

function mkEditPopup(left,top,obj_name) {
    edit_popup_open = 1;
    mkBubbleHTML(left,top,'edit',obj_name);
}

function mkVerifiedPopup(left,top) {
    edit_popup_open = 1;
    mkBubbleHTML(left,top,'verified');
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
    var html_str;
    
    // adjust location to account for the displacement of the arrow:
    left = left - 22;
    if (left<5){left=5;}
    
    // select the vertical position of the arrow
    if (top>214){
        html_str  = '<div class= "bubble" id="myPopup" style="position:absolute; left:'+left+'px; top:'+top+'px;">';
    }else{
        html_str  = '<div class= "bubble top" id="myPopup" style="position:absolute; left:'+left+'px; top:'+top+'px;">';
    }
    
    // select the type of bubble (adding new object, editing existing object, ...) 
    switch(bubble_type) {
        case 'query':
            html_str += GetPopupForm("");
            break;
        case 'edit':
            html_str += GetCloseImg() + GetPopupForm(obj_name);
            break;
        case 'verified':
            html_str += GetCloseImg() + GetVerifiedPopupForm();
            break;
        default:
            alert('Invalid bubble_type');
    }
    html_str += '</div>';

    // Insert in page created HTML and place it in the right location taking into account the rendered size 
    InsertAfterDiv(html_str,'main_section');
    
    if (top>214){
        h = $("#myPopup").height();
        document.getElementById('myPopup').style.top = (top -h -80) + 'px';
    }else{
        document.getElementById('myPopup').style.top = (top) + 'px';
    }
    
    // Focus the cursor inside the box
    document.getElementById('objEnter').focus();
    document.getElementById('objEnter').select();
}

// ****************************
// Forms:
// ****************************

// Forms to enter a new object
function GetPopupForm(obj_name) {
    var html_str = "";
    
    html_str = "<b>Enter object name</b><br />";
    html_str += HTMLobjectBox(obj_name);

    /*** INSERT THIS BACK IN:
    html_str += HTMLoccludedBox();

    html_str += "<b>Enter attributes</b><br />";
    html_str += HTMLattributesBox("");
    ***/
    
    // Buttons
    html_str += "<br />";
    if (obj_name==''){
        html_str += HTMLdoneButton() + HTMLundocloseButton() + HTMLdeleteButton();
    }else{
        // treat the special case of edditing a polygon:
        html_str += HTMLdoneeditButton() + HTMLadjustpolygonButton() + HTMLdeleteeditButton();
    }
        
    return html_str;
}


function GetVerifiedPopupForm() {
    return "<b>This annotation has been blocked.</b><br />";
}


// ****************************
// Simple building blocks:
// ****************************

// Shows the box to enter the object name
function HTMLobjectBox(obj_name) {
    var html_str="";
        
    html_str += '<input name="objEnter" id="objEnter" type="text" style="width:220px;" tabindex="0" value="'+obj_name+'" title="Enter the object\'s name here. Avoid application specific names, codes, long descriptions. Use a name you think other people would agree in using. "';
        
    html_str += ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)';
        
    // if obj_name is empty it means that the box is being created
    if (obj_name==''){
            // If press enter, then submit; if press ESC, then delete:
            html_str += 'main_handler.SubmitQuery();if(c==27)main_handler.WhatIsThisObjectDeleteButton();" ';
    }else{
            // If press enter, then submit:
            html_str += 'main_handler.SubmitEditLabel();" ';
    }
    
    // if there is a list of objects, we need to habilitate the list
    if(object_choices=='...') {
        html_str += '/>'; // close <input
    }else{
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





// show basic buttons
function HTMLdoneButton() {
    return '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" /> ';
}

function HTMLdoneeditButton() {
    return '<input type="button" value="Done" title="Press this button when you are done editing." onclick="main_handler.SubmitEditLabel();" tabindex="0" /> ';
}

function HTMLundocloseButton() {
    return '<input type="button" value="Undo close" title="Press this button if you accidentally closed the polygon. You can continue adding control points." onclick="main_handler.WhatIsThisObjectUndoCloseButton();" tabindex="0" /> ';
}

function HTMLdeleteButton() {
    return '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.WhatIsThisObjectDeleteButton();" tabindex="0" /> ';
}

function HTMLdeleteeditButton() {
    return '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="main_handler.EditBubbleDeleteButton();" tabindex="0" /> ';
}

function HTMLadjustpolygonButton() {
    return '<input type="button" value="Adjust polygon" title="Press this button if you wish to update the polygon\'s control points." onclick="main_handler.EditBubbleAdjustPolygon();" /> ';
}

// show small icon on the top-right to close the window
function GetCloseImg() {
    return '<img style="border: 0pt none; width:14px; height:14px; z-index:4; -moz-user-select:none; position:absolute; cursor:pointer; right:8px;'+
    'top: 8px;" src="Icons/close.png" height="14" width="14" onclick="main_handler.SelectedToRest()" />';
}



// ****************************
// ATTRIBUTES:
// ****************************
// ?attributes=object:car;brand:seat/ford;color:...;comments:...

// is the object occluded?
function HTMLoccludedBox() {
    var html_str="";
    
    html_str += "Is occluded? <input type='radio' name='occluded' value='yes' />yes";
    html_str += "<input type='radio' name='occluded' value='no' />no";
    //html_str += "<input type='radio' name='option' value='Option 3' />n.a.";
    html_str += "<br />";
        
    return html_str;
}

// Boxes to enter attributes
function HTMLattributesBox(attList) {
    var html_str="";
    
    //for(var i = 0; i < attributesList.length; i++) {
    //}
    
    html_str += '<textarea name="attEnter" id="attEnter" type="text" style="width:220px; height:3em;" tabindex="0" value="'+attList+'" title="Enter a comma separated list of attributes, adjectives or other object properties" />';
    
    return html_str;
}



