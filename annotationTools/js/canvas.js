/** @file Generic rendering canvas */
/**
 * Creates the rendering canvas
 * @constructor
 * @param {string} div_attach - The div element where the canvas lives
*/
function canvas(div_attach) {
    
  // *******************************************
  // Private variables:
  // *******************************************
  
  this.annotations = Array(); // includes name, deleted, verified info
  this.div_attach = div_attach; // name of DIV element to attach to

  // *******************************************
  // Public methods:
  // *******************************************
  
  /** Attach the annotation to the canvas. 
    * @param {annotation} anno - The annotation to attach

  */
  this.AttachAnnotation = function (anno) {
    this.annotations.push(anno);
    anno.SetDivAttach(this.div_attach);
  };
  
  /** Detach annotation from the canvas. Given the annotation ID, the 
   corresponding annotation is located, detached, and returned.
    * @param {integer} anno_id - id of the annotation to dettach
   */
  this.DetachAnnotation = function(anno_id) {
    var i;

    // Get index of annotation matching input annotation ID:
    var is_matched = false;
    for(i=0; i<this.annotations.length; i++) {
      if(this.annotations[i].GetAnnoID()==anno_id) {
	is_matched = true;
	break;
      }
    }

    // Did not find valid annotation, so return null:
    if(!is_matched) return null;

    // Remove annotation structure from list:
    var anno = this.annotations.splice(i,1)[0];
    
    // Remove rendering of polygon from the canvas:
    anno.DeletePolygon();

    return anno;
  };

  /** Unhide all annotations: */
  this.UnhideAllAnnotations = function () {
    for(var pp=0; pp < this.annotations.length; pp++) {
      this.annotations[pp].hidden = false;
    }
  };

  /* Render all attached annotations: */
  this.RenderAnnotations = function () {
    // Loop through all of the annotations and clear them from the canvas.
    for(var i=0;i<this.annotations.length;i++) {
      this.annotations[i].DeletePolygon();
    }

    // Render the annotations:
    for(var pp=0; pp < this.annotations.length; pp++) {
      if(!this.annotations[pp].hidden) {
	this.annotations[pp].RenderAnnotation('rest');
      }
    }
  };
  
}
