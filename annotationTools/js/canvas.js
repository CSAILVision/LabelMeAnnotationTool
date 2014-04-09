// Generic rendering canvas.
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
  
  // Returns the last annotation in the array (null if empty).
  this.Peek = function () {
    var i = this.annotations.length-1;
    if(i < 0) return null;
    return this.annotations[i];
  };

  // Attach the annotation to the canvas.
  this.AttachAnnotation = function (anno,rendering_style) {
    this.annotations.push(anno);
    this.rendering_style.push(rendering_style);
    anno.SetDivAttach(this.div_attach);
  };
  
  // Detach annotation from the canvas. 
  // 1. If zero arguments are passed in, then the last annotation is 
  // detached and returned.
  // 2. If the annotation ID is passed in, then the corresponding
  // annotation is located, detached, and returned.
  this.DetachAnnotation = function() {
    var i;
    if(arguments.length==0) {
      // Get index of last annotation:
      i = (this.annotations.length-1);
    }
    else {
      // Get index of annotation matching input annotation ID:
      var anno_id = arguments[0];
      var is_matched = false;
      for(i=0; i<this.annotations.length; i++) {
	if(this.annotations[i].GetAnnoID()==anno_id) {
	  is_matched = true;
	  break;
	}
      }
      if(!is_matched) i = -1;
    }

    // If invalid index, then did not find valid annotation, so return null:
    if(i<0) return null;

    // Remove annotation structure from list:
    var anno = this.annotations.splice(i,1)[0];
    
    // Remove from this.rendering_style:
    this.rendering_style.splice(i,1);
    
    // Remove rendering of polygon from the canvas:
    anno.DeletePolygon();

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
	
	// Set polygon actions:
	this.annotations[pp].SetAttribute('onmousedown','StartEditEvent(' + anno_id + ',evt); return false;');
	this.annotations[pp].SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ anno_id +'); return false;');
	this.annotations[pp].SetAttribute('oncontextmenu','return false');
	this.annotations[pp].SetCSS('cursor','pointer');

	break;
      case 'filled_polygon':
	FillPolygon(this.annotations[pp].DrawPolygon(main_image.GetImRatio()));
	break;
      case 'polyline':
	this.annotations[pp].DrawPolyLine();
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
