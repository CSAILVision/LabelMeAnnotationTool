// annotation canvas
// Keeps track of all information related to the main drawing canvas.
function canvas(div_attach) {
    
  // *******************************************
  // Private variables:
  // *******************************************
  
//   this.annotations; // includes name, deleted, verified info
  this.div_attach = div_attach; // name of DIV element to attach to
    
  // *******************************************
  // Public methods:
  // *******************************************
  
  // Returns all of the annotations as an array.
  this.GetAnnotations = function () {
    return AllAnnotations;
  };
  
  // Loop through all of the annotations and draw the polygons.
  this.DrawAllPolygons = function () {
    for(var pp=0; pp < this.GetAnnotations().length; pp++) {
      var isDeleted = this.GetAnnotations()[pp].GetDeleted();
      if(((pp<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || (pp>=num_orig_anno)) {
	this.GetAnnotations()[pp].DrawPolygon(main_image.GetImRatio());
        
	// *****************************************
	this.GetAnnotations()[pp].SetAttribute('onmousedown','main_handler.RestToSelected(' + pp + ',evt); return false;');
	this.GetAnnotations()[pp].SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ pp +'); return false;');
	this.GetAnnotations()[pp].SetAttribute('oncontextmenu','return false');
	this.GetAnnotations()[pp].SetAttribute('style','cursor:pointer;');
	// *****************************************
      }
    }
  };
  
  // Loop through all of the annotations and clear them from the canvas.
  this.ClearAllAnnotations = function () {
    for(var i=0;i<this.GetAnnotations().length;i++) {
      this.GetAnnotations()[i].DeletePolygon();
    }
  };
  
  // Add a new annotation to the canvas.
  this.AddAnnotation = function (anno) {
    this.GetAnnotations().push(anno);
    this.AttachAnnotation(anno);
  };
  
  // Attach the annotation to the canvas.
  this.AttachAnnotation = function (anno) {
    if(anno.GetDeleted()&&(!view_Deleted)) return;
    anno.SetDivAttach(this.div_attach);
    anno.DrawPolygon(main_image.GetImRatio());
    
    // *****************************************
    var anno_id = anno.GetAnnoID();
    anno.SetAttribute('onmousedown','main_handler.RestToSelected(' + anno_id + ',evt); return false;');
    anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,' + anno_id + ');');
    anno.SetAttribute('oncontextmenu','return false');
    anno.SetAttribute('style','cursor:pointer;');
    // *****************************************
  };
  
  // Detach annotation from the canvas.
  this.DetachAnnotation = function(anno_id) {
    var anno = this.GetAnnotations()[anno_id];
    anno.DeletePolygon();
    return anno;
  };
}
