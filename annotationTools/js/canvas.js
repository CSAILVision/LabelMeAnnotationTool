// Created: 04/13/2006
// Updated: 04/13/2006

// annotation canvas
// Keeps track of all information related to the main drawing canvas.
function canvas() {

  // *******************************************
  // Private variables:
  // *******************************************

  this.annotations; // includes name, deleted, verified info
  this.is_poly_selected; // Indicates whether a polygon is selected
  this.selected_poly; // Indicates which polygon is selected

  // *******************************************
  // Public methods:
  // *******************************************

  // Returns all of the annotations as an array.
  this.GetAnnotations = function () {
    return this.annotations;
  };

  // Allocates an array to hold 'num' annotations.
  this.CreateNewAnnotations = function (num) {
    this.annotations = Array(num);
  };

  this.selectObject = function (idx) { 
    if((this.is_poly_selected) && (this.selected_poly==idx)) return;
    this.unselectObjects();
    this.is_poly_selected = 1;
    this.selected_poly = idx;
    this.annotations[idx].SelectPoly();
    var m = main_image.GetFileInfo().GetMode();
    if(view_ObjList) ChangeLinkColorFG(idx);
    this.annotations[idx].FillPolygon();

  };

  this.unselectObjects = function () { 
    if(!this.is_poly_selected) return;
    var m = main_image.GetFileInfo().GetMode();
    if(view_ObjList) ChangeLinkColorBG(this.selected_poly);
    this.annotations[this.selected_poly].UnfillPolygon();
    this.annotations[this.selected_poly].UnselectPoly();
    this.is_poly_selected = 0;
  };

  // Send annotation information to server CGI script for recording.
  this.SubmitAnnotations = function (modifiedControlPoints) {
    var url = 'annotationTools/perl/submit.cgi';
    var tmp_xml = anno_xml;//anno_xml.cloneNode(true);
    if(modifiedControlPoints) modifiedControlPoints = "cpts_modified";
    else modifiedControlPoints = "cpts_not_modified";

    var old_pri = tmp_xml.getElementsByTagName("private");
    for(ii=0;ii<old_pri.length;ii++) {
      old_pri[ii].parentNode.removeChild(old_pri[ii]);
    }
    
    // Add information to go into the log:
    var elt_pri = tmp_xml.createElement("private");
    var elt_gct = tmp_xml.createElement("global_count");
    var elt_user = tmp_xml.createElement("pri_username");
    var elt_edt = tmp_xml.createElement("edited");
    var elt_onm = tmp_xml.createElement("old_name");
    var elt_nnm = tmp_xml.createElement("new_name");
    var elt_mcp = tmp_xml.createElement("modified_cpts");
    
    var txt_gct = tmp_xml.createTextNode(global_count);
    var txt_user = tmp_xml.createTextNode(username);
    var txt_edt = tmp_xml.createTextNode(submission_edited);
    var txt_onm = tmp_xml.createTextNode(old_name);
    var txt_nnm = tmp_xml.createTextNode(new_name);
    var txt_mcp = tmp_xml.createTextNode(modifiedControlPoints);
    var txt_pri = tmp_xml.createTextNode(ref);
    
    tmp_xml.documentElement.appendChild(elt_pri);
    elt_pri.appendChild(elt_gct);
    elt_pri.appendChild(elt_user);
    elt_pri.appendChild(elt_edt);
    elt_pri.appendChild(elt_onm);
    elt_pri.appendChild(elt_nnm);
    elt_pri.appendChild(elt_mcp);
    elt_pri.appendChild(txt_pri);
    
    elt_gct.appendChild(txt_gct);
    elt_user.appendChild(txt_user);
    elt_edt.appendChild(txt_edt);
    elt_onm.appendChild(txt_onm);
    elt_nnm.appendChild(txt_nnm);
    elt_mcp.appendChild(txt_mcp);
    
    var elts_obj = tmp_xml.getElementsByTagName("object");
    for(ii=0; ii < num_orig_anno; ii++) {
      if(!elts_obj[ii].getElementsByTagName("name")[0].firstChild) {
	if(main_canvas.GetAnnotations()[ii].GetObjName().length > 0) {
	  var txt_nam = tmp_xml.createTextNode(main_canvas.GetAnnotations()[ii].GetObjName());
	  elts_obj[ii].getElementsByTagName("name")[0].appendChild(txt_nam);
	}
      }
      else {
	elts_obj[ii].getElementsByTagName("name")[0].firstChild.nodeValue = main_canvas.GetAnnotations()[ii].GetObjName();
      }
      elts_obj[ii].getElementsByTagName("deleted")[0].firstChild.nodeValue = main_canvas.GetAnnotations()[ii].GetDeleted();
      
      var id = elts_obj[ii].getElementsByTagName("id");
      if(id!=null && id.length>0 && id[0].firstChild!=null) {
	id[0].firstChild.nodeValue = ""+ii;
	main_canvas.GetAnnotations()[ii].SetID(""+ii);
      }
      else {
	var elt_id = tmp_xml.createElement("id");
	var txt_id = tmp_xml.createTextNode(""+ii);
	main_canvas.GetAnnotations()[ii].SetID(""+ii);
	elt_id.appendChild(txt_id);
	elts_obj[ii].appendChild(elt_id);
      }

      for(jj=0; jj < main_canvas.GetAnnotations()[ii].GetPtsX().length; jj++) {
	elts_obj[ii].getElementsByTagName("polygon")[0].getElementsByTagName("pt")[jj].getElementsByTagName("x")[0].firstChild.nodeValue = main_canvas.GetAnnotations()[ii].GetPtsX()[jj];
	elts_obj[ii].getElementsByTagName("polygon")[0].getElementsByTagName("pt")[jj].getElementsByTagName("y")[0].firstChild.nodeValue = main_canvas.GetAnnotations()[ii].GetPtsY()[jj];
      }
    }
    
    while(elts_obj.length>num_orig_anno) {
      elts_obj[num_orig_anno].parentNode.removeChild(elts_obj[num_orig_anno]);
      elts_obj = tmp_xml.getElementsByTagName("object");
    }
    
    
      
    for(ii=0; ii < (main_canvas.GetAnnotations().length-num_orig_anno); ii++) {
      if(main_canvas.GetAnnotations()[num_orig_anno+ii].GetDeleted()==1) continue;
      var elt_obj = tmp_xml.createElement("object");
      var elt_nam = tmp_xml.createElement("name");
      var txt_nam = tmp_xml.createTextNode(main_canvas.GetAnnotations()[num_orig_anno+ii].GetObjName());
      var elt_del = tmp_xml.createElement("deleted");
      var txt_del = tmp_xml.createTextNode(main_canvas.GetAnnotations()[num_orig_anno+ii].GetDeleted());
      var elt_ver = tmp_xml.createElement("verified");
      var txt_ver = tmp_xml.createTextNode('0');
      var elt_dat = tmp_xml.createElement("date");
      var ts = main_canvas.GetAnnotations()[num_orig_anno+ii].GetTimeStamp();
      if(ts.length>0) elt_dat.appendChild(tmp_xml.createTextNode(ts));
      var elt_id = tmp_xml.createElement("id");
      var txt_id = tmp_xml.createTextNode(""+(num_orig_anno+ii));
      main_canvas.GetAnnotations()[num_orig_anno+ii].SetID(""+(num_orig_anno+ii));
      var elt_pol = tmp_xml.createElement("polygon");
      
      tmp_xml.documentElement.appendChild(elt_obj);
      elt_obj.appendChild(elt_nam);
      elt_obj.appendChild(elt_del);
      elt_obj.appendChild(elt_ver);
      elt_obj.appendChild(elt_dat);
      elt_obj.appendChild(elt_id);
      elt_obj.appendChild(elt_pol);
      elt_nam.appendChild(txt_nam);
      elt_del.appendChild(txt_del);
      elt_ver.appendChild(txt_ver);
      elt_id.appendChild(txt_id);
      
      var elt_user = tmp_xml.createElement("username");
      var txt_user = tmp_xml.createTextNode(username);
      elt_pol.appendChild(elt_user);
      elt_user.appendChild(txt_user);
      
      for(jj=0; jj < main_canvas.GetAnnotations()[num_orig_anno+ii].GetPtsX().length; jj++) {
	var elt_pt = tmp_xml.createElement("pt");
	var elt_x = tmp_xml.createElement("x");
	var elt_y = tmp_xml.createElement("y");
	var txt_x = tmp_xml.createTextNode(main_canvas.GetAnnotations()[num_orig_anno+ii].GetPtsX()[jj]);
	var txt_y = tmp_xml.createTextNode(main_canvas.GetAnnotations()[num_orig_anno+ii].GetPtsY()[jj]);
	
	elt_pol.appendChild(elt_pt);
	elt_pt.appendChild(elt_x);
	elt_pt.appendChild(elt_y);
	elt_x.appendChild(txt_x);
	elt_y.appendChild(txt_y);
      }
    }
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest) {
      req_submit = new XMLHttpRequest();
      req_submit.onreadystatechange = this.processReqChange;
      req_submit.open("POST", url, true);
      req_submit.send(tmp_xml);
    } 
    else if (window.ActiveXObject) {
      req_submit = new ActiveXObject("Microsoft.XMLHTTP");
      if (req_submit) {
	req_submit.onreadystatechange = this.processReqChange;
	req_submit.open("POST", url, true);
	req_submit.send(tmp_xml);
      }
    }
  };

  // Loop through all of the annotations and draw the polygons.
  this.DrawAllPolygons = function () {
    var nn = this.annotations.length;
    var im_ratio = main_image.GetImRatio();

    for(pp=0; pp < nn; pp++) {
//       if(this.annotations[pp].GetDeleted()) continue;
//       else {
      var isDeleted = this.annotations[pp].GetDeleted();
      if(((pp<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || (pp>=num_orig_anno)) {
	this.annotations[pp].DrawPolygon(im_ratio);

	// *****************************************
	if(IsMicrosoft()) {
	  this.annotations[pp].SetAttribute('onmousedown',new Function('main_handler.RestToSelected(' + pp + ',null); return false;'));
	  this.annotations[pp].SetAttribute('onmousemove',new Function('main_handler.CanvasMouseMove(event,' + pp + '); return false;'));
	  this.annotations[pp].SetAttribute('oncontextmenu',function() {return false;});
	}
	else {
	  this.annotations[pp].SetAttribute('onmousedown','main_handler.RestToSelected(' + pp + ',evt); return false;');
	  this.annotations[pp].SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ pp +'); return false;');
// 	  this.annotations[pp].SetAttribute('onmousedown','parent.main_handler.RestToSelected(' + pp + '); return false;');
// 	  this.annotations[pp].SetAttribute('onmousemove','parent.main_handler.CanvasMouseMove(evt,'+ pp +'); return false;');
	  this.annotations[pp].SetAttribute('oncontextmenu','return false');
	}
	this.annotations[pp].SetAttribute('style','cursor:pointer;');
	// *****************************************
      }
    }
  };

  // Detects if the point (x,y) is close to a polygon.  If so, return 
  // the index of the closest polygon.  Else, return -1.
  this.IsNearPolygon = function (x,y,p) {
    var sx = x / main_image.GetImRatio();
    var sy = y / main_image.GetImRatio();
    
    var pt = this.annotations[p].ClosestPoint(sx,sy);
    var minDist = pt[2];

    // this is the sensitivity area around the outlines of the polygon.  
    // 7.31.2006 - changed from dividing by im_ratio to multiplying by it
    // so that the sensitivity area is not huge when you're zoomed in.
    // also changed from 10 to 5.
    // also - changed it so that when you move the mouse over the sensitivity 
    // area, the area gets bigger so you won't move off of it on accident.
    var buffer = 5; //7.31.06
    if(main_canvas.is_poly_selected) { 
      buffer = 13;
    }

    return ((minDist*main_image.GetImRatio()) < buffer);
  };

  // Loop through all of the annotations and clear them from the canvas.
  this.ClearAllAnnotations = function () {
    for(var i=0;i<this.annotations.length;i++) {
      this.annotations[i].DeletePolygon();
    }
  };

  // Deletes the currently selected polygon from the canvas.
  this.DeleteSelectedPolygon = function () {  
    if(!this.is_poly_selected) return;
    var idx = this.selected_poly;
    
    if((IsUserAnonymous() || (!IsCreator(this.annotations[idx].GetUsername()))) && (!IsUserAdmin()) && (idx<num_orig_anno) && !action_DeleteExistingObjects) {
      alert('You do not have permission to delete this polygon');
//       PermissionError();
      return;
    }
    
    if(this.annotations[idx].GetVerified()) {
      main_handler.RestToSelected(idx,null);
      return;
    }
    
    if(!CheckIsSureToDelete()) return;

    this.annotations[idx].SetDeleted(1);
    
    if(idx>=num_orig_anno) {
      anno_count--;
      setCookie('counter',anno_count);
      UpdateCounterHTML();
    }
    
    this.unselectObjects();
    if(view_ObjList) {
      RemoveAnnotationList();
      LoadAnnotationList();
    }

    submission_edited = 0;
    old_name = this.annotations[idx].GetObjName();
    new_name = this.annotations[idx].GetObjName();
    WriteLogMsg('*Deleting_object');

    this.SubmitAnnotations(0);
    this.annotations[idx].DeletePolygon();
  };

  // Add a new annotation to the canvas.
  this.AddAnnotation = function (anno) {
    this.annotations.push(anno);
    this.AttachAnnotation(anno);
  };

  // Attach the annotation to the canvas.
  this.AttachAnnotation = function (anno) {
    if(anno.GetDeleted()&&(!view_Deleted)) return;
    var im_ratio = main_image.GetImRatio();
    anno.SetDivAttach('myCanvas_bg');
    anno.DrawPolygon(im_ratio);

    // *****************************************
    var anno_id = anno.GetAnnoID();
    if(IsMicrosoft()) {
      anno.SetAttribute('onmousedown',new Function('main_handler.RestToSelected(' + anno_id + ',null); return false;'));
      anno.SetAttribute('onmousemove',new Function('main_handler.CanvasMouseMove(event,' + anno_id + '); return false;'));
      anno.SetAttribute('oncontextmenu',function() {return false;});
    }
    else {
      anno.SetAttribute('onmousedown','main_handler.RestToSelected(' + anno_id + ',evt); return false;');
      anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,' + anno_id + ');');
//       anno.SetAttribute('onmousedown','parent.main_handler.RestToSelected(' + anno_id + '); return false;');
//       anno.SetAttribute('onmousemove','parent.main_handler.CanvasMouseMove(evt,' + anno_id + ');');
      anno.SetAttribute('oncontextmenu','return false');
    }
    anno.SetAttribute('style','cursor:pointer;');
    // *****************************************
  };

  // Detach annotation from the canvas.
  this.DetachAnnotation = function(anno_id) {
    var anno = this.annotations[anno_id];
    anno.DeletePolygon();
    return anno;
  };

  // *******************************************
  // Private methods:
  // *******************************************

  // Handles after we return from sending an XML message to the 
  // server.
  this.processReqChange = function () {
    // only if req shows "loaded"
    if(req_submit.readyState == 4) {
      if(req_submit.status == 200) {
	if(req_submit.responseText) {
	  alert(req_submit.responseText);
	}
      }
      if(req_submit.status != 200) {
	alert("There was a problem retrieving the XML data:\n" +
	      req_submit.statusText);
      }
    }
  };

}
