/** @file Generic rendering canvas.
At a high-level, there are 4 canvases that are laid out.  They correspond to the: (i) main canvas, (ii) drawing canvas, (iii) query canvas, (iv) polygon selection canvas.  At any moment, one canvas is at the front and accepts mouse functions.  The other canvases are hidden below and do not accept mouse functions.  All canvases are transparent, meaning that their contents are always visible.  The task of the tool is to switch between these canvases and to refresh their contents.
 */
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
  $('#'+div_attach).empty()
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
  this.ShadePolygons = function (){
    for(var i=0;i<this.annotations.length;i++) {
      this.annotations[i].ShadePolygon();
    }
  }
  this.GetAnnoIndex = function(id){
    var anid = -1;
    for (var i = 0; i < this.annotations.length; i++) if (this.annotations[i].anno_id == id) anid = i;
    return anid;
  };
  
}
