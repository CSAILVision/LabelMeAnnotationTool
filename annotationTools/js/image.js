// Created: 04/12/2006
// Updated: 04/12/2006
// Updated: 06/13/2006 zoom added

// image class
// Fetches and manipulates the main image that will be annotated.
// From the HTML code, create a <img src...> tag with an id and pass
// this id in as the argument when creating the class.
function image(id) {

  // *******************************************
  // Private variables:
  // *******************************************

  this.file_info = new file_info();
  this.id = id;
  this.im = document.getElementById(this.id);
  this.width_orig;
  this.height_orig;
  this.width_curr;  //current width and height of the image itself
  this.height_curr;
  this.im_ratio; // Ratio of (displayed image dims) / (orig image dims)
  this.browser_im_ratio; // Initial im_ratio; this should not get changed!!
  this.curr_frame_width;  // Current width of main_image.
  this.curr_frame_height; // Current height of main_image.

  // *******************************************
  // Public methods:
  // *******************************************

  // Fetches a new image based on the URL string or gets a new one at
  // random from the dirlist.  onload_helper is a pointer to a helper
  // function that is calld when the image is loaded.  Typically, this
  // will call obj.SetImageDimensions().
  this.GetNewImage = function(onload_helper) {
    document.getElementById('loading').style.display = '';
    if(IsMicrosoft()) this.im.style.visibility = 'hidden';
    else this.im.style.display = 'none';
    LoadCounterText();
    if(!this.file_info.ParseURL()) return;
    this.im.src = this.file_info.GetImagePath();
    this.im.onload = onload_helper;
    wait_for_input = 0;
    edit_popup_open = 0;
  };

  // Handles when the user clicks on a frame (video mode)
  this.SetNewImage = function(onload_helper){
    this.im.src = this.file_info.GetImagePath();
    this.im.onload = onload_helper;
    wait_for_input = 0;
    edit_popup_open = 0;
  }

  // Returns the ratio of the available width/height to the original
  // width/height.
  this.GetImRatio = function() {
    return this.im_ratio;
  };

  // Returns file_info object that contains information about the
  // displayed image.
  this.GetFileInfo = function() {
    return this.file_info;
  };

  //gets available width (6.14.06)
  this.GetAvailWidth = function() {
    if(document.getElementById('right_side')) {
      var rhs_width = document.getElementById('right_side').offsetLeft;
      return rhs_width - 24;
    }
    else return document.getElementById('main_section').offsetRight;
  };

  // Sets the dimensions of the image based on browser setup.
  this.SetImageDimensions = function() {
    this.SetOrigImDims(this.im);
    var avail_width = this.GetAvailWidth();    
    var avail_height = this.GetAvailHeight();
    var width_ratio = avail_width/this.width_orig;
    var height_ratio = avail_height/this.height_orig;

    if(width_ratio<height_ratio) this.im_ratio = width_ratio;
    else this.im_ratio = height_ratio;
    this.browser_im_ratio = this.im_ratio;

    this.width_curr = Math.round(this.im_ratio*this.width_orig);
    this.height_curr = Math.round(this.im_ratio*this.height_orig);
    
    this.im.width = this.width_curr;
    this.im.height = this.height_curr;

    if(!IsMicrosoft()) {
      document.getElementById('myCanvas_bg').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('myCanvas_bg').setAttributeNS(null,"height",this.height_curr);
      document.getElementById('select_canvas').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('select_canvas').setAttributeNS(null,"height",this.height_curr);
      document.getElementById('draw_canvas').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('draw_canvas').setAttributeNS(null,"height",this.height_curr);
      document.getElementById('query_canvas').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('query_canvas').setAttributeNS(null,"height",this.height_curr);
    }

    this.curr_frame_width = this.width_curr;
    this.curr_frame_height = this.height_curr;

    document.getElementById('loading').style.visibility = 'hidden';
    document.getElementById('main_image').style.visibility = 'visible';
    if(IsMicrosoft()) {
      this.im.style.visibility = '';
      document.getElementById('main_image').style.overflow = 'visible';
      this.ScaleFrame();
    }
    else this.im.style.display = '';
  };

  // If (x,y) is not in view, then scroll it into view.  Return adjusted
  // (x,y) point that takes into account the slide offset.
  this.SlideWindow = function (x,y) {
    var pt = Array(2);
    if(!this.IsPointVisible(x,y)) {
      document.getElementById('main_image').scrollLeft = x-100;
      document.getElementById('main_image').scrollTop = y-100;
    }
    pt[0] = x-document.getElementById('main_image').scrollLeft;
    pt[1] = y-document.getElementById('main_image').scrollTop;
    return pt;
  };

  // Turn off image scrollbars if zoomed in.
  this.ScrollbarsOff = function () {
    if(!this.IsFitImage()) {
      document.getElementById('main_image').style.overflow = 'hidden';
    }
  };

  // Turn on image scrollbars if zoomed in.
  this.ScrollbarsOn = function () {
    if(!this.IsFitImage()) {
      document.getElementById('main_image').style.overflow = 'auto';
    }
  };
  
  // Zoom the image given a zoom level (amt) between 0 and 1 (or 'fitted').
  this.Zoom = function(amt) { 
    switch(amt) {
      case 'fitted':
      amt = this.browser_im_ratio;
      break;
      default:
      amt = this.im_ratio+amt;
    }

    // If it is Safari and if a polygon is open, then disallow zooming.
    if(IsSafari() && main_draw_canvas.GetAnnotation()) {
      alert('Please close or remove the current polygon before zooming.');
    }

    if(amt < this.browser_im_ratio) return;
    if(wait_for_input) return WaitForInput();
    if(edit_popup_open && main_select_canvas.GetAnnotation().GetVerified()) main_handler.SelectedToRest();

    // New width and height of the rescaled picture
    this.im_ratio = amt;
    this.width_curr = Math.round(this.im_ratio*this.width_orig);
    this.height_curr = Math.round(this.im_ratio*this.height_orig);

    this.ScaleFrame();

    // Remove unnecessary scrollbars if in "fitted" view (this is mostly 
    // an IE bug fix).
    var mainImage = document.getElementById('main_image');
    if(this.im_ratio.toFixed(5) == this.browser_im_ratio.toFixed(5)) {
      mainImage.style.overflow = 'visible';
      this.im_ratio = this.browser_im_ratio;
    }
    else mainImage.style.overflow = 'auto';

    main_canvas.ClearAllAnnotations();
    var anno = main_draw_canvas.ClearAnnotation();
    var anno_select = main_select_canvas.ClearAnnotation();
    this.im.width = this.width_curr;
    this.im.height = this.height_curr;

    if(IsMicrosoft()) {
      document.getElementById('myCanvas_bg').style.width = this.width_curr;
      document.getElementById('myCanvas_bg').style.height = this.height_curr;
      document.getElementById('select_canvas').style.width = this.width_curr;
      document.getElementById('select_canvas').style.height = this.height_curr;
      document.getElementById('draw_canvas').style.width = this.width_curr;
      document.getElementById('draw_canvas').style.height = this.height_curr;
      document.getElementById('query_canvas').style.width = this.width_curr;
      document.getElementById('query_canvas').style.height = this.height_curr;
    }
    else {
      document.getElementById('myCanvas_bg').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('myCanvas_bg').setAttributeNS(null,"height",this.height_curr);
      document.getElementById('select_canvas').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('select_canvas').setAttributeNS(null,"height",this.height_curr);
      document.getElementById('draw_canvas').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('draw_canvas').setAttributeNS(null,"height",this.height_curr);
      document.getElementById('query_canvas').setAttributeNS(null,"width",this.width_curr);
      document.getElementById('query_canvas').setAttributeNS(null,"height",this.height_curr);
    }

    // Redraw polygons.
    main_canvas.DrawAllPolygons();
    main_draw_canvas.RedrawAnnotation();
    main_select_canvas.RedrawAnnotation();
  };

  
  // *******************************************
  // Private methods:
  // *******************************************

  //tells the picture to take up the available 
  //space in the browser, if it needs it. 6.29.06 
  this.ScaleFrame = function() {
    var mainImage = document.getElementById('main_image');
    //look at the available browser height and the image height,
    //and use the smaller of the two for the main_image height.
    var avail_height = this.GetAvailHeight();
    if(this.height_curr > avail_height) this.curr_frame_height = avail_height;
    else this.curr_frame_height = this.height_curr;	 
    //likewise for width
    var avail_width = this.GetAvailWidth();
    if(this.width_curr > avail_width) this.curr_frame_width = avail_width;
    else this.curr_frame_width = this.width_curr;
    
    mainImage.style.width = this.curr_frame_width + 'px';
    mainImage.style.height = this.curr_frame_height + 'px';  
    
  };
  
  /*  //6.14.06 - center the zoomed image over a specified point on the image.
       this.center_point = function(x,y) {
       var horiz_middle = Math.round(this.curr_frame_width / 2);
       var vert_middle = Math.round(this.curr_frame_height / 2);
       this.im.offsetLeft = 20;
       //alert(horiz_middle + ' by ' + vert_middle);
       //FINISH THIS  (all this does is tell you where the center of the frame is.)
       //use this when zoomed in and editing an image that you've clicked from the sidebar
       //so it jumps to the image so you dont have to scroll to find it.
       //also use this for click a point and it zooms in on that point at the center.
       //also use this to ensure that zooming in zooms in based on the center of the image
       //and not the top left corner.
       //(useful for many things)
       };  */
  
  // Retrieves and sets the original image's dimensions (width/height).

  this.SetOrigImDims = function (im) {
    //7.12.06 Safari image dimensions fix
    if(IsSafari()) {
      var url = im.src;
      var img = new Image;
      img.src=url;
      img.visibility='hidden';
      img.display='none';
      this.width_orig = img.width;
      this.height_orig = img.height;
    }
    else {
      this.width_orig = im.width;
      this.height_orig = im.height;
    }
  };

  //gets available height (6.14.06)
  this.GetAvailHeight = function() {
    var top_height = document.getElementById('main_section').offsetTop;
    var bot_height = 100;
    var m = main_image.GetFileInfo().GetMode();
    if(m=='mt') {
      top_height += 64;
    }

    if(IsNetscape() || IsSafari()){
      if(main_handler.IsMovieMode()){
	return window.innerHeight - (bot_height+top_height) +4;      
      }
      else if(main_handler.IsPictureMode()){
	return window.innerHeight - top_height - 8;
      }
    }
    else if(IsMicrosoft()){
      if(main_handler.IsMovieMode()){
	return document.body.offsetHeight - (bot_height+top_height) - 8;
      }
      else if(main_handler.IsPictureMode()){
	return document.body.offsetHeight - top_height - 8;
      }
    }
  };

  // Returns true if the image is zoomed to the original (fitted) resolution.
  this.IsFitImage = function () {
    return (this.im_ratio == this.browser_im_ratio);
  };

  // Returns true if (x,y) is viewable.
  this.IsPointVisible = function (x,y) {
    var scrollLeft = document.getElementById('main_image').scrollLeft;
    var scrollTop = document.getElementById('main_image').scrollTop;
    if(((x*this.im_ratio < scrollLeft) || 
	(x*this.im_ratio - scrollLeft > this.curr_frame_width - 160)) || 
       ((y*this.im_ratio < scrollTop) || 
	(y*this.im_ratio - scrollTop > this.curr_frame_height))) 
      return false;  //the 160 is about the width of the right-side div
    return true;
  };

}

