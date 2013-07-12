// This code is very complex for what it is doing.
// Needs optimization
//
// PlaceSignInHTML() is complex. Needs to make more explicit all the elements.


function initUserName() {
    // The first time we get the username will give preference to the username passed
    //   in the URL as it might come from the LabelMe browser.
    username = getQueryVariable("username");

    if (username.length==0) {
        username = getCookie("username");
        if (username.length==0) {
            username = "anonymous";
        }
    }
    
    if (username=="null") {username = "anonymous";}
    
    setCookie("username",username);
    $("#usernametxt").text(username);
}

function show_enterUserNameDIV() {
    // This function simply swaps the divs to show the "changeAndDisplayUserName" div
    $("#display_user").hide();
    $("#enterUserName").show();
    // put the cursor inside the text box
    document.getElementById('userEnter').focus();
    document.getElementById('userEnter').select();

    return false;
}

function changeAndDisplayUserName(c) {
    // Shows the entered name.
    // c is the key that produced getting out of the text box.
    // only change the username is the user pressed "enter" -> c==13
    if (c==13){
        username = $("#userEnter").val();
    
        if (username.length==0) {
            username = getCookie("username");
        }   
    
        setCookie("username",username);
        $("#usernametxt").text(username);
    }

    $("#display_user").show();
    $("#enterUserName").hide();
}


/*

function PlaceSignInHTML() {
  var el_div = document.createElementNS(xhtmlNS,'div');
  el_div.setAttributeNS(null,"id","you_are_div");
  document.getElementById('username_main_div').appendChild(el_div);
  
  var el_a1 = document.createElementNS(xhtmlNS,'a');
  el_a1.setAttributeNS(null,"href","javascript:get_username_form();");
  el_div.appendChild(el_a1);
  
  var el_font = document.createElementNS(xhtmlNS,'font');
  el_font.setAttributeNS(null,"size","2");
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

function write_username() {
  username_flag = 0;
  var html_str;
  if(getCookie('username')) username = getCookie('username');
  if(username=="anonymous") PlaceSignInHTML();
  else {
    html_str = '<div id="you_are_div"><br />You are: <b>' + username + 
      '</b> <br />(' +
      '<a href="javascript:sign_out()">change username</a>)</div>';
    InsertAfterDiv(html_str,'username_main_div');
  }
}

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
  
  //var el_br1 = document.createElementNS(xhtmlNS,'br');
  //el_td.appendChild(el_br1);
  
  var el_txt1 = document.createTextNode('Username: ');
  el_td.appendChild(el_txt1);
  
  var el_input1 = document.createElementNS(xhtmlNS,'input');
  el_input1.setAttributeNS(null,"type","text");
  el_input1.setAttributeNS(null,"id","username");
  el_input1.setAttributeNS(null,"name","username");
  el_input1.setAttributeNS(null,"size","20em");
  el_input1.setAttributeNS(null,"style","font-family:Arial;font-size:small;");
  el_td.appendChild(el_input1);
  
  //var el_br2 = document.createElementNS(xhtmlNS,'br');
  //el_td.appendChild(el_br2);
  
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

*/