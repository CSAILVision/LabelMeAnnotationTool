// Created: 05/07/2007
// Updated: 05/07/2007

// Select canvas
// Keeps track of all information related to the select canvas.
function DrawCanvas() {

  // *******************************************
  // Private variables:
  // *******************************************

  this.annotation = null; // includes name, deleted, verified info

  // *******************************************
  // Public methods:
  // *******************************************

  this.GetAnnotation = function () {
    return this.annotation;
  };

  // Add a new annotation to the drawing canvas.
  this.AddAnnotation = function(x,y,anno_id) {
    if(username_flag) submit_username();
    this.annotation = new annotation(anno_id);
    this.annotation.SetDivAttach('draw_canvas');
    this.annotation.SelectPoly();
    this.annotation.AddFirstControlPoint(x,y);
    WriteLogMsg('*start_polygon');
  };

  // Attach an existing annotation to the canvas.
  this.AttachAnnotation = function (anno) {
    this.annotation = anno;
    this.annotation.SetDivAttach('draw_canvas');
    this.annotation.SelectPoly();
    this.RedrawAnnotation();
    this.annotation.RefreshLastControlPoint();
//     var im_ratio = main_image.GetImRatio();
//     this.annotation.DrawPolyLine(im_ratio);
//     var pt = this.annotation.GetPopupPoint();
//     this.annotation.AddFirstControlPoint(pt[0],pt[1]);
  };

  // Detach the annotation from the canvas.
  this.DetachAnnotation = function () {
    var anno = this.annotation;
    this.annotation = null;
    anno.DeletePolygon();
    return anno;
  };

  this.ClearAnnotation = function () {
    if(this.annotation) this.annotation.DeletePolygon();
    return this.annotation;
  };

  this.RedrawAnnotation = function () {
    if(this.annotation) this.annotation.DrawPolyLine(main_image.GetImRatio());
  };

  this.AddControlPoint = function(x,y) {
    this.annotation.AddControlPoint(x,y);
  };

  this.ClosePolygon = function () {
    return this.annotation.ClosePolygon();
  };

  // Move this canvas to the front.
  this.MoveToFront = function () {
      document.getElementById('draw_canvas').style.zIndex = 0;
      if(!IsMicrosoft()) document.getElementById('draw_canvas_div').style.zIndex = 0;
  };

  // Move this canvas to the back.
  this.MoveToBack = function () {
      document.getElementById('draw_canvas').style.zIndex = -2;
      if(!IsMicrosoft()) document.getElementById('draw_canvas_div').style.zIndex = -2;
  };

  // *******************************************
  // Private methods:
  // *******************************************
}
