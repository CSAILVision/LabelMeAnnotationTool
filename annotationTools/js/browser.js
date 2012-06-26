// This file contains functions for interacting with the browser type.

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

