// Created: 05/07/2007
// Updated: 05/07/2007

// Query canvas
// Keeps track of all information related to the query canvas.
function QueryCanvas() {

  // *******************************************
  // Private variables:
  // *******************************************

  this.annotation = null; // includes name, deleted, verified info

  // *******************************************
  // Public methods:
  // *******************************************

  // Attach the annotation to the canvas.
  this.AttachAnnotation = function (anno) {
    this.annotation = anno;
    this.annotation.SetDivAttach('query_canvas');
    this.DrawPolygon();

    // If line has been labeled, then make autocomplete have "line"
    // and "horizon line" be options:
    var isLine = 0;
    if((this.annotation.GetPtsX().length==2) && (object_choices=='...')) {
      object_choices = 'line,horizon line';
      object_choices = object_choices.split(/,/);
      isLine = 1;
    }
    
    // Make query popup appear.
    var pt = this.annotation.GetPopupPoint();
    pt = main_image.SlideWindow(pt[0],pt[1]);
    main_image.ScrollbarsOff();
    WriteLogMsg('*What_is_this_object_query');
    mkPopup(pt[0],pt[1]);

    if(isLine) object_choices = '...';
  };

  // Draw the polygon.
  this.DrawPolygon = function () {
    if(!this.annotation) return;
    var im_ratio = main_image.GetImRatio();
    this.annotation.DrawPolygon(im_ratio);
    this.annotation.FillPolygon();
  };

  // Detach the annotation from the canvas.
  this.DetachAnnotation = function () {
    var anno = this.annotation;
    this.annotation = null;
    anno.DeletePolygon();
    CloseQueryPopup();
    main_image.ScrollbarsOn();
    return anno;
  };

  // Move this canvas to the front.
  this.MoveToFront = function () {
    document.getElementById('query_canvas').style.zIndex = 0;
    document.getElementById('query_canvas_div').style.zIndex = 0;
  };

  // Move this canvas to the back.
  this.MoveToBack = function () {
    document.getElementById('query_canvas').style.zIndex = -2;
    document.getElementById('query_canvas_div').style.zIndex = -2;
  };

  // *******************************************
  // Private methods:
  // *******************************************
}
