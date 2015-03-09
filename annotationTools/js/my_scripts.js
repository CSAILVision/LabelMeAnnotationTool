// This file contains global variables and functions.  This file
// should be minimized and abstracted whenever possible.  It is 
// best to refrain from adding new variables/functions to this
// file.

var wait_for_input;
var edit_popup_open = 0;
var num_orig_anno;
var global_count = 0;
var req_submit;
var submission_edited = 0; // If polygon has been edited.

// Allowable user actions:
var action_CreatePolygon = 1;
var action_RenameExistingObjects = 0;
var action_ModifyControlExistingObjects = 0;
var action_DeleteExistingObjects = 0;

// Which polygons are visible:
var view_Existing = 1;
var view_Deleted = 0;

// Flag for right-hand object list:
var view_ObjList = true;

// MT variables:
var LMbaseurl = 'http://' + window.location.host + window.location.pathname;
var MThelpPage = 'annotationTools/html/mt_instructions.html';
var externalSubmitURL = 'http://mturk.com/mturk/externalSubmit';
var externalSubmitURLsandbox = 'http://workersandbox.mturk.com/mturk/externalSubmit';
var mt_N = 'inf';

var object_choices = '...';

// Access LabelMe object field.
// i - object index
// fieldname - object field name, e.g. "name", "deleted"
function LMgetObjectField(xml,i,fieldname) {
  if(!xml.getElementsByTagName('object')[i] || !xml.getElementsByTagName('object')[i].getElementsByTagName(fieldname)[0]) return "";
  return xml.getElementsByTagName('object')[i].getElementsByTagName(fieldname)[0].innerHTML;
}

// Returns number of LabelMe objects.
function LMnumberOfObjects(xml) {
  return xml.getElementsByTagName('object').length;
}

// Get the x position of the mouse event.
function GetEventPosX(event) {
  if(IsNetscape()) return event.layerX;
  return event.offsetX;
}

// Get the y position of the mouse event.
function GetEventPosY(event) {
  if(IsNetscape()) return event.layerY;
  return event.offsetY;
}

function RemoveSpecialChars(str) {
  var re = /\$|@|#|~|`|\%|\*|\^|\&|\+|\=|\[|\]|\}|\{|\;|\:|\'|\"|\<|\>|\?|\||\\|\!|\$/g;
  return str.replace(re,"_");
}

function WaitForInput() {
  alert("Need to enter object name.");
}

// Return true if the username is "anonymous".
function IsUserAnonymous() {
  return (username=='anonymous');
}

function IsUserAdmin() {
  var is_admin = false;
  var folder = main_media.GetFileInfo().GetDirName();
  var idx = folder.indexOf('/');
  if((idx != -1) && (folder.substring(0,idx)=='users')) {
    folder = folder.substring(idx+1,folder.length);
    idx = folder.indexOf('/');
    if((idx != -1) && (folder.substring(0,idx)==username)) is_admin = true;
  }
  return (username=='admin') | (username=='mtsupervisor') | is_admin | ((username.indexOf('submitted')!=-1)&(username==folder));
}

function IsCreator(u) {
  return (username==u);
}


function WriteLogMsg(msg) {
  var url = 'annotationTools/perl/write_logfile.cgi';
  var req_submit;
  // branch for native XMLHttpRequest object
  if (window.XMLHttpRequest) {
    req_submit = new XMLHttpRequest();
    req_submit.open("POST", url, true);
    req_submit.send(msg);
  } 
  else if (window.ActiveXObject) {
    req_submit = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_submit) {
      req_submit.open("POST", url, true);
      req_submit.send(msg);
    }
  }
}

// This function gets called when the user clicks on the "Next image" button.
function loadXMLDoc(offset) {
  if (typeof(offset)==='undefined') offset = 1;//default argument
  if(wait_for_input) return WaitForInput();
  if(draw_anno) {
    alert("Need to close current polygon first.");
    return;
  }

  // Remove the image:
  $('#main_media').remove();

  // Remove the object list:
  RemoveObjectList();

  console.log("loadXMLDoc " + offset);
  main_media.GetNewImage(undefined, offset);
  // Get a new image and reset URL to reflect new image:
  //TODO? : main_media.GetFileInfo().SetURL(document.URL);
}

// Shows the previous image in the sequence
function ShowPreviousImage() {
  loadXMLDoc(-1);
}

// Shows the next image in the sequence
function ShowNextImage() {
  console.log("ShowNextImage ");
  loadXMLDoc(1);
}

// Read the last xml frame
function CopyPreviousAnnotations() {
	if(wait_for_input) return WaitForInput();
	if(draw_anno) {
		alert("Need to close current polygon first.");
		return;
	}

	if (window.confirm("Are you sure? This will delete the current annotations (if any)")) {	
			
		// Clean up scribble, if any
		SetDrawingMode( 0 );
		$("#copyPrevious").children("img").attr("src", "Icons/segment_loader.gif")
	
		// Get last image path
		var anno_file = main_media.GetImagePath(-1);  
		
        anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
        ReadXML(anno_file,LoadLastFrameSuccess,LoadLastFrame404);
	}
}

// Read the last xml frame with valid annotations (skipping empty frames)
function CopyLastValid() {
	if(wait_for_input) return WaitForInput();
	if(draw_anno) {
		alert("Need to close current polygon first.");
		return;
	}

	if (window.confirm("Are you sure? This will delete the current annotations (if any)")) {			
	
		var imageOffset = -1;

		var currentImName = main_media.GetFileInfo().GetFullName();
		// Annotation file of the last frame does not exist, so do nothing ... (alert user)
		this.LoadFrameFailed = function (jqXHR,textStatus,errorThrown) { 
			if(jqXHR.status==404 ) {
				imageOffset -= 1;
				var anno_file = main_media.GetImagePath( imageOffset );
				if( currentImName == anno_file ) {
					$("#copyLastValid").children("img").attr("src", "Icons/CopyLastValid.png");
					alert( "There are no annotations the whole sequence. Annotate at least one frame before using this." );
				} else {
					anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
					ReadXML(anno_file, LoadLastFrameSuccess, LoadFrameFailed);	
				}
			}
			else {
				alert(jqXHR.status);
			}
		}
		// Clean up scribble, if any
		SetDrawingMode( 0 );
		$("#copyLastValid").children("img").attr("src", "Icons/segment_loader.gif");
	
		// Get last image path
		var anno_file = main_media.GetImagePath( imageOffset );		
        anno_file = 'Annotations/' + anno_file.substr(0,anno_file.length-4) + '.xml' + '?' + Math.random();
        ReadXML(anno_file, LoadLastFrameSuccess, this.LoadFrameFailed);
	
	}
}


// After reading the last frame to duplicate, we don't want to immediately call
// LoadAnnotationSuccess(), like when we're reading an actual frame, since we
// want to change some paths and copy images before loading the annotations
function LoadLastFrameSuccess(xml) {
	var imName = main_media.GetFileInfo().GetImName();
	var dirName = main_media.GetFileInfo().GetDirName();
	
	// Set folder and image's correct filename (switch from last frame to current frame)
	xml.getElementsByTagName("filename")[0].firstChild.nodeValue = '\n'+imName+'\n';

	// Update all images (copy to new name according to the current frame name)
	var N = $(xml).children("annotation").children("object").length;
	for(var i = 0; i < N; i++) {
		var obj = $(xml).children("annotation").children("object").eq(i);
		if(!parseInt(obj.children("deleted").text())) {
			// Get object name:
			var name = obj.children("name").text();
			if( obj.children("segm").length > 0 ) {
									
				var maskName =  obj.children("segm").children("mask").text();//ex: 'image_00000_mask_0.png
				var scribbleName =  obj.children("segm").children("scribbles").children("scribble_name").text();
								
				if( imName.length > 4 ) {		
					var imBaseName = imName.substring(0,imName.length-4);// ex: 'image_00001.bmp' to 'image_00001'
		
					// Copy mask images
					var newMaskName = ReplaceImage( imBaseName, maskName, "Masks/" + dirName );
					obj.children("segm").children("mask").text(newMaskName);
					
					// Copy scribbles images
					var newScribbleName = ReplaceImage( imBaseName, scribbleName, "Scribbles/" + dirName );
					obj.children("segm").children("scribbles").children("scribble_name").text(newScribbleName);
				}
			}
		}
	}
	$("#copyPrevious").children("img").attr("src", "Icons/CopyPrevious.png");
	$("#copyLastValid").children("img").attr("src", "Icons/CopyLastValid.png");
	LoadAnnotationSuccess(xml);//sets LM_xml to xml and updates the page
	
	// Save changes
	WriteXML(SubmitXmlUrl,LM_xml,function(){return;});		
}

// Annotation file of the last frame does not exist, so do nothing ... (alert user)
function LoadLastFrame404(jqXHR,textStatus,errorThrown) { 
	if(jqXHR.status==404) {
		$("#copyPrevious").children("img").attr("src", "Icons/CopyPrevious.png");
		alert( "There are no annotations in the last frame, keeping current annotations." );
	}
	else {
		alert(jqXHR.status);
	}
}

// Returns the name of imName with the current baseName (imBaseName)
function ReplaceImage( imBaseName, imName, dir ){
	if( imName.length > imBaseName.length ) {
		var imNameEnd = imName.substring(imBaseName.length, imName.length);//ex: '_mask_0.png
		var newImName = imBaseName + imNameEnd;
		copyImage( imName, newImName, dir);
		return newImName;
	}
}

// Copies a file into the server
function copyImage(src, dst, dir) {

	$.ajax({
		async: true,
		type: "POST",
		url: "annotationTools/php/copyImage.php",
		data: {
			src: src,
			dst: dst,
			dir: dir,
		}
	});
};

function InsertServerLogData(modifiedControlPoints) {
  var old_pri = LM_xml.getElementsByTagName("private");
  for(ii=0;ii<old_pri.length;ii++) {
    old_pri[ii].parentNode.removeChild(old_pri[ii]);
  }
  
  // Add information to go into the log:
  var elt_pri = LM_xml.createElement("private");
  var elt_gct = LM_xml.createElement("global_count");
  var elt_user = LM_xml.createElement("pri_username");
  var elt_edt = LM_xml.createElement("edited");
  var elt_onm = LM_xml.createElement("old_name");
  var elt_nnm = LM_xml.createElement("new_name");
  var elt_mcp = LM_xml.createElement("modified_cpts");
  
  var txt_gct = LM_xml.createTextNode(global_count);
  var txt_user = LM_xml.createTextNode(username);
  var txt_edt = LM_xml.createTextNode(submission_edited);
  var txt_onm = LM_xml.createTextNode(old_name);
  var txt_nnm = LM_xml.createTextNode(new_name);
  var txt_mcp = LM_xml.createTextNode(modifiedControlPoints);
  var txt_pri = LM_xml.createTextNode(ref);
  
  LM_xml.documentElement.appendChild(elt_pri);
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
}

function PermissionError() {
  var m = main_media.GetFileInfo().GetMode();
  if((m=='im') || (m=='mt')) {
    alert('This polygon was entered by another user.  You can only modify polygons that you have entered.');
  }
  else {
    alert('This polygon was entered by another user.  You can only modify polygons that you have entered.  Do not forget to sign in if you want to be able to edit your annotations');
  }
}

function GetTimeStamp() {
  var url = 'annotationTools/perl/get_timestamp.cgi';
  // branch for native XMLHttpRequest object
  if (window.XMLHttpRequest) {
    req_anno = new XMLHttpRequest();
    req_anno.open("POST", url, false);
    req_anno.send();
  } 
  else if (window.ActiveXObject) {
    req_anno = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_anno) {
      req_anno.open("POST", url, false);
      req_anno.send();
    }
  }

  if(req_anno.status==200) return req_anno.responseText;
  return '';
}


// Set object list choices for points and lines:
function SetObjectChoicesPointLine(num_control_points) {
  // If point has been labeled, then make autocomplete have "point"
  // be option:
  var isPoint = 0;
  if((num_control_points==1) && (object_choices=='...')) {
    object_choices = 'point';
    object_choices = object_choices.split(/,/);
    isPoint = 1;
  }
  
  // If line has been labeled, then make autocomplete have "line"
  // and "horizon line" be options:
  var isLine = 0;
  if((num_control_points==2) && (object_choices=='...')) {
    object_choices = 'line,horizon line';
    object_choices = object_choices.split(/,/);
    isLine = 1;
  }
  
  return (isPoint || isLine);
}

// Returns true if the point (x,y) is close to polygon p.
function IsNearPolygon(x,y,p) {
  var sx = x / main_media.GetImRatio();
  var sy = y / main_media.GetImRatio();
  
  var pt = AllAnnotations[p].ClosestPoint(sx,sy);
  var minDist = pt[2];
  
  // This is the sensitivity area around the outline of the polygon.
  // Also, when you move the mouse over the sensitivity area, the area 
  // gets bigger so you won't move off of it on accident.
  var buffer = 5;
  if(selected_poly != -1) buffer = 13;
  
  // Note: need to multiply by im_ratio so that the sensitivity area 
  // is not huge when you're zoomed in. 
  return ((minDist*main_media.GetImRatio()) < buffer);
}
    
// Render filled polygons for selected objects:
function selectObject(idx) {
  if(selected_poly==idx) return;
  unselectObjects();
  selected_poly = idx;
  if(view_ObjList) ChangeLinkColorFG(idx);
  AllAnnotations[selected_poly].FillPolygon();
  
  // Select object parts:
  var selected_poly_parts = getPartChildrens(idx);
  for (var i=0; i<selected_poly_parts.length; i++) {
    if((selected_poly_parts[i]!=selected_poly) && AllAnnotations[selected_poly_parts[i]].hidden) {
      AllAnnotations[selected_poly_parts[i]].DrawPolygon(main_media.GetImRatio());
    }
    AllAnnotations[selected_poly_parts[i]].FillPolygon();
  }
}

// Stop fill polygon rendering for selected objects:
function unselectObjects() {
  if(selected_poly == -1) return;
  if(view_ObjList) ChangeLinkColorBG(selected_poly);
  AllAnnotations[selected_poly].UnfillPolygon();
  
  // Unselect object parts:
  var selected_poly_parts = getPartChildrens(selected_poly);
  for (var i=0; i<selected_poly_parts.length; i++) {
    if((selected_poly_parts[i]!=selected_poly) && AllAnnotations[selected_poly_parts[i]].hidden) {
      AllAnnotations[selected_poly_parts[i]].DeletePolygon();
    }
    AllAnnotations[selected_poly_parts[i]].UnfillPolygon();
  }
  
  // Reset selected_poly variable:
  selected_poly = -1;
}

// Deletes the currently selected polygon from the canvas.
function DeleteSelectedPolygon() {
  if(selected_poly == -1) return;
  
  if(((!IsCreator(AllAnnotations[selected_poly].GetUsername()))) && (!IsUserAdmin()) && (selected_poly<num_orig_anno) && !action_DeleteExistingObjects) {
    alert('You do not have permission to delete this polygon');
    return;
  }
  
  if(AllAnnotations[selected_poly].GetVerified()) {
    StartEditEvent(selected_poly,null);
    return;
  }
  
  submission_edited = 0;
  old_name = LMgetObjectField(LM_xml,AllAnnotations[selected_poly].anno_id,'name');
  new_name = old_name;
  
  // Write to logfile:
  WriteLogMsg('*Deleting_object');
  InsertServerLogData('cpts_not_modified');
  
  // Set <deleted> in LM_xml:
  $(LM_xml).children("annotation").children("object").eq(selected_poly).children("deleted").text('1');
  
  // Write XML to server:
  WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
  
  //     SubmitAnnotations(0);
  
  // Need to keep track of the selected polygon since it gets reset
  // in the next step:
  var ndx = selected_poly;
  
  // Unselect the object:
  unselectObjects();
  if(view_ObjList) RenderObjectList();
  
  // Delete the polygon from the canvas:
  AllAnnotations[ndx].DeletePolygon();
}


// UTILITIES    
function CheckXMLExists() {
  if(req_submit.readyState==4) {
    if(req_submit.status != 200) {
      alert("The XML annotation file does not exist yet.  Please label an object and try again");
    }
    else {
      window.open(main_media.GetFileInfo().GetAnnotationPath());
    }
  }
}

function GetXMLFile() {
  var xml_url = main_media.GetFileInfo().GetAnnotationPath();

  // Check if VRML file exists:
  if (window.XMLHttpRequest) {
    req_submit = new XMLHttpRequest();
    req_submit.onreadystatechange = CheckXMLExists;
    req_submit.open("GET", xml_url, true);
    req_submit.send('');
  } 
  else if (window.ActiveXObject) {
    req_submit = new ActiveXObject("Microsoft.XMLHTTP");
    if (req_submit) {
      req_submit.onreadystatechange = CheckXMLExists;
      req_submit.open("GET", xml_url, true);
      req_submit.send('');
    }
  }
}

