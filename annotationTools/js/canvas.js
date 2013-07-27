// annotation canvas
// Keeps track of all information related to the main drawing canvas.
function canvas(div_attach) {
    
  // *******************************************
  // Private variables:
  // *******************************************
  
  this.annotations = Array(); // includes name, deleted, verified info
  this.div_attach = div_attach; // name of DIV element to attach to
  this.rendering_style = Array(); // indicates how to render the annotations

  // *******************************************
  // Public methods:
  // *******************************************
  
  // Returns all of the annotations as an array.
  this.GetAnnotations = function () {
    return this.annotations;
  };

  // Attach the annotation to the canvas.
  this.AttachAnnotation = function (anno,rendering_style) {
    this.annotations.push(anno);
    this.rendering_style.push(rendering_style);
    anno.SetDivAttach(this.div_attach);
  };
  
  // Detach annotation from the canvas.
  this.DetachAnnotation = function(anno_id) {
    var anno = null;
    for(var i=0; i<this.annotations.length; i++) {
      if(this.annotations[i].GetAnnoID()==anno_id) {
	// Remove annotation structure from list:
	anno = this.annotations.splice(i,1)[0];

	// Remove from this.rendering_style:
	this.rendering_style.splice(i,1);
	
	// Remove rendering of polygon from the canvas:
	anno.DeletePolygon();
      }
    }
    return anno;
  };

  // Render all attached annotations:
  this.RenderAnnotations = function () {
    // Clear the canvas:
    this.ClearAnnotations();

    for(var pp=0; pp < this.annotations.length; pp++) {
      // Render the annotation depending on its rendering_style:
      switch(this.rendering_style[pp]) {
      case 'polygon':
	var anno_id = this.annotations[pp].GetAnnoID();
	this.annotations[pp].DrawPolygon(main_image.GetImRatio());
	this.annotations[pp].SetAttribute('onmousedown','main_handler.RestToSelected(' + anno_id + ',evt); return false;');
	this.annotations[pp].SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ anno_id +'); return false;');
	this.annotations[pp].SetAttribute('oncontextmenu','return false');
	this.annotations[pp].SetAttribute('style','cursor:pointer;');
	break;
      default:
	alert('Invalid rendering_style');
      }
    }
  };
  
  // Loop through all of the annotations and clear them from the canvas.
  this.ClearAnnotations = function () {
    for(var i=0;i<this.annotations.length;i++) {
      this.annotations[i].DeletePolygon();
    }
  };
  
}
