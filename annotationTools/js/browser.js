/** @file This file contains functions for detecting and interacting with the different browser types. */

var bname;
var bversion;

function GetBrowserInfo() {
//   alert(navigator.appCodeName);
//   alert(navigator.appName);
//   alert(navigator.appVersion);
//   alert(navigator.cookieEnabled);
//   alert(navigator.platform);
//   alert(navigator.userAgent);
  WriteLogMsg('*Browser_Information ' + navigator.userAgent);

  bname = navigator.appName;
  if(IsMicrosoft()) {
    var arVersion = navigator.appVersion.split("MSIE");
    bversion = parseFloat(arVersion[1]);
  }
  else if(IsNetscape() || IsSafari()) {
    bversion = parseInt(navigator.appVersion);
    //check for Safari.  
    if(navigator.userAgent.match('Safari')) bname = 'Safari';
  }
  else bversion = 0;
}

function IsNetscape() {
  return (bname.indexOf("Netscape")!=-1);
}

function IsMicrosoft() {
  return (bname.indexOf("Microsoft")!=-1);
}

function IsSafari() {
  return (bname.indexOf("Safari")!=-1);
}

function IsChrome() {
  return (bname.indexOf("chrome")!=-1);
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

/** This function gets a variable from the URL (or the COOKIES)
 * @example: 
 * // returns the username
 * var username = getQueryVariable("username");
 */
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return getCookie(variable);
}
