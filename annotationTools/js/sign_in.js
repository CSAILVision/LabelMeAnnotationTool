/** @file  Sign in form for a user to enter their LabelMe username. */

// This code is very complex for what it is doing.
// Needs optimization
//
// PlaceSignInHTML() is complex. Needs to make more explicit all the elements.


function initUserName() {
    // The first time we get the username will give preference to the username passed
    //   in the URL as it might come from the LabelMe browser.
    username = getQueryVariable("username");

    if (!username || (username.length==0)) {
        username = getCookie("username");
        if (!username || (username.length==0)) {
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
