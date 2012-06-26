function request(){
var thandler;

this.makeRequest = function(url, handler) {
	req = false;
    if(window.XMLHttpRequest && !(window.ActiveXObject)) {
    	try {
			req = new XMLHttpRequest();
        } catch(e) {
			req = false;
        }
    } else if(window.ActiveXObject) {
       	try {
        	req = new ActiveXObject("Msxml2.XMLHTTP");
      	} catch(e) {
        	try {
          		req = new ActiveXObject("Microsoft.XMLHTTP");
        	} catch(e) {
          		req = false;
        	}
		}
    }
	if(req) {
		thandler = handler;
		req.onreadystatechange = this.processReqChange;		
		req.open("GET", url, true);
		req.send("");
	}
}

this.processReqChange = function() {
    // only if req shows "loaded"
    if (req.readyState == 4) {
		results = req.responseText;
		thandler.handleResult(results);
    }
}

}
