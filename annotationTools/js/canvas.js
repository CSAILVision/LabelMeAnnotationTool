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
	this.annotations[pp].SetAttribute('onmousedown','main_handler.RestToSelected(' + pp + ',evt); return false;');
	this.annotations[pp].SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ pp +'); return false;');
	
// 	  this.annotations[pp].SetAttribute('onmousedown','parent.main_handler.RestToSelected(' + pp + '); return false;');
// 	  this.annotations[pp].SetAttribute('onmousemove','parent.main_handler.CanvasMouseMove(evt,'+ pp +'); return false;');
	this.annotations[pp].SetAttribute('oncontextmenu','return false');
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

    // Write to logfile:
    WriteLogMsg('*Deleting_object');
    InsertServerLogData('cpts_not_modified');

    // Set <deleted> in LM_xml:
    $(LM_xml).children("annotation").children("object").eq(idx).children("deleted").text('1');

    // Write XML to server:
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});

//     SubmitAnnotations(0);

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
    anno.SetAttribute('onmousedown','main_handler.RestToSelected(' + anno_id + ',evt); return false;');
    anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,' + anno_id + ');');
      
//       anno.SetAttribute('onmousedown','parent.main_handler.RestToSelected(' + anno_id + '); return false;');
//       anno.SetAttribute('onmousemove','parent.main_handler.CanvasMouseMove(evt,' + anno_id + ');');
    anno.SetAttribute('oncontextmenu','return false');
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

}
