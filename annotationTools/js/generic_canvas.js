// Generic rendering canvas.
function GenericCanvas(div_attach) {

  // *******************************************
  // Private variables:
  // *******************************************

  this.annotations = null; // includes name, deleted, verified info
  this.div_attach = div_attach; // name of DIV element to attach to
  this.rendering_style = null; // indicates how to render the annotation

  // *******************************************
  // Public methods:
  // *******************************************

  // Get the attached annotation:
  this.GetAnnotations = function () {
    return this.annotations;
  };

  // Attach the annotation to the canvas:
  this.AttachAnnotation = function (anno,rendering_style) {
    this.annotations = anno;
    this.rendering_style = rendering_style;
    this.annotations.SetDivAttach(this.div_attach);
  };

  // Detach the annotation from the canvas:
  this.DetachAnnotation = function () {
    var anno = this.annotations;
    this.annotations = null;
    this.rendering_style = null;
    if(anno) anno.DeletePolygon();
    return anno;
  };

  // Render all attached annotations:
  this.RenderAnnotations = function () {
    if(!this.annotations) return;

    // Render the annotation depending on its rendering_style:
    switch(this.rendering_style) {
    case 'filled_polygon':
      this.annotations.DrawPolygon(main_image.GetImRatio());
      this.annotations.FillPolygon();
      break;
    case 'polyline':
      this.annotations.DrawPolyLine();
      break;
    default:
      alert('Invalid rendering_style');
    }
  };

  // *******************************************
  // Private methods:
  // *******************************************
}
