
// IMAGE CLASS
///////////////////////////////////////////////////////////////////////
// Fetches and manipulates the main image that will be annotated.
// From the HTML code, create a <img src...> tag with an id and pass
// this id in as the argument when creating the class.

function image(id) {
    
    // *******************************************
    // Private variables:
    // *******************************************
	
	var SMALLEST_RATIO = 1.0;
    
    this.file_info = new file_info();
    this.id = id;
    this.im = document.getElementById(this.id);
    this.width_orig;
    this.height_orig;
    this.width_curr;  //current width and height of the image itself
    this.height_curr;
    this.im_ratio; // Ratio of (displayed image dims) / (orig image dims)
    this.browser_im_ratio; // Initial im_ratio; this should not get changed!!
    this.curr_frame_width;  // Current width of main_media.
    this.curr_frame_height; // Current height of main_media.
    
    // *******************************************
    // Public methods:
    // *******************************************
    
    // Fetches a new image based on the URL string or gets a new one at
    // random from the dirlist.  onload_helper is a pointer to a helper
    // function that is called when the image is loaded.  Typically, this
    // will call obj.SetImageDimensions().
    this.GetNewImage = function(onload_helper, offset) {
		if (typeof(offset)==='undefined') offset = 1;//default argument
        document.getElementById('loading').style.display = '';
        if(IsMicrosoft()) this.im.style.visibility = 'hidden';
        else this.im.style.display = 'none';
        if(!this.file_info.ParseURL(offset)) return;
        this.im.src = this.file_info.GetImagePath();
        this.im.onload = onload_helper;
        wait_for_input = 0;
        edit_popup_open = 0;
    };
	
	// Returns the full name of a frame with the specified offset	
    this.GetImagePath = function(offset) {
		if (typeof(offset)==='undefined') offset = 1;//default argument
				
        if( this.file_info.FetchImage( offset ) ) {	
			var retVal = this.file_info.GetFullName();			
			this.file_info.FetchImage( -offset );//revert to previous image
			return retVal;
		}
		return "";
    };
    
    
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
    
    
    // Sets the dimensions of the image based on browser setup.
    this.SetImageDimensions = function() {
        
        this.SetOrigImDims(this.im);
        var avail_width = this.GetAvailWidth();
        var avail_height = this.GetAvailHeight();
        var width_ratio = avail_width/this.width_orig;
        var height_ratio = avail_height/this.height_orig;
        
        if(width_ratio<height_ratio) this.im_ratio = width_ratio;
        else this.im_ratio = height_ratio;
        
        // Do not start with a smaller image than it should be!
        if(this.im_ratio < SMALLEST_RATIO) { 
        	this.im_ratio = SMALLEST_RATIO; 
        }
		
        this.browser_im_ratio = this.im_ratio;		
		this.Zoom( 1.0 );
        
        document.getElementById('loading').style.visibility = 'hidden';
        document.getElementById('main_media').style.visibility = 'visible';
        
        if(IsMicrosoft()) {
            this.im.style.visibility = '';
            document.getElementById('main_media').style.overflow = 'visible';
            this.ScaleFrame();
        }
        else this.im.style.display = '';
    };
    
    
    // If (x,y) is not in view, then scroll it into view.  Return adjusted
    // (x,y) point that takes into account the slide offset.
    this.SlideWindow = function (x,y) {
        var pt = Array(2);
        if(!this.IsPointVisible(x,y)) {
            document.getElementById('main_media').scrollLeft = x-100;
            document.getElementById('main_media').scrollTop = y-100;
        }
        pt[0] = x-$("#main_media").scrollLeft();
        pt[1] = y-$("#main_media").scrollTop();
        return pt;
    };
    
    // Turn off image scrollbars if zoomed in.
    this.ScrollbarsOff = function () {
        if(!this.IsFitImage()) {
            document.getElementById('main_media').style.overflow = 'hidden';
        }
    };
    
    // Turn on image scrollbars if zoomed in.
    this.ScrollbarsOn = function () {
        if(!this.IsFitImage()) {
            document.getElementById('main_media').style.overflow = 'auto';
        }
    };
    
    // Zoom the image given a zoom level (amt) between 0 and inf (or 'fitted').
    this.Zoom = function(amt) {
        // if a new polygon is being added while the user press the zoom button then do nothing.
        if(wait_for_input) return;
        
        // if an old polygon is being edited while the user press the zoom button then close the polygon and zoom.
        if(edit_popup_open) StopEditEvent();
        
		var im_ratio = this.im_ratio;
        if(amt=='fitted') {
                im_ratio = this.browser_im_ratio;
        } else {
                im_ratio = im_ratio * amt;
        }
        
        // if the scale factor is bellow the original scale, then do nothing (do not make the image too small)
        if(im_ratio < this.browser_im_ratio) {
			this.im_ratio=this.browser_im_ratio; return;
		}
		this.im_ratio = im_ratio;
        
        // New width and height of the rescaled picture
        this.width_curr = Math.round(this.im_ratio*this.width_orig);
        this.height_curr = Math.round(this.im_ratio*this.height_orig);
		
        // Scale and scroll the image so that the center stays in the center of the visible area
        this.ScaleFrame(amt);
			
		// Remove polygon from draw canvas:
		var anno = null;
		if(draw_anno) {
		  draw_anno.DeletePolygon();
		  anno = draw_anno;
		  draw_anno = null;
        }

        // set the size of the image (this.im is the image object)
        this.im.width = this.width_curr;
        this.im.height = this.height_curr;
        // set the size of all the canvases
        $("#myCanvas_bg").width(this.width_curr).height(this.height_curr);
        $("#select_canvas").width(this.width_curr).height(this.height_curr);
        $("#draw_canvas").width(this.width_curr).height(this.height_curr);
        $("#query_canvas").width(this.width_curr).height(this.height_curr);
        
        // Redraw polygons.
	main_canvas.RenderAnnotations();

	if(anno) {
	  // Draw polyline:
	  draw_anno = anno;
	  draw_anno.SetDivAttach('draw_canvas');
	  draw_anno.DrawPolyLine();
	}

	/*************************************************************/
	/*************************************************************/
	// Scribble: 
	if (drawing_mode == 1){
	    scribble_canvas.UpdateSize(true);
		scribble_canvas.redraw();
		scribble_canvas.drawMask();
        }
	/*************************************************************/
	/*************************************************************/
    };
    
    
    
    // *******************************************
    // Private methods:
    // *******************************************
    
    //Tells the picture to take up the available
    //space in the browser, if it needs it. 6.29.06
    this.ScaleFrame = function(amt) {
        // Look at the available browser (height,width) and the image (height,width),
        // and use the smaller of the two for the main_media (height,width).
        // also center the image so that after rescaling, the center pixels visible stays at the same location
        //var avail_height = this.GetAvailHeight();
        this.curr_frame_height = Math.min(this.GetAvailHeight(), this.height_curr);
        
        //var avail_width = this.GetAvailWidth();
        this.curr_frame_width = Math.min(this.GetAvailWidth(), this.width_curr);
        
        // also center the image so that after rescaling, the center pixels visible stays at the same location
        cx = $("#main_media").scrollLeft()+this.curr_frame_width/2.0; // current center
        cy = $("#main_media").scrollTop()+this.curr_frame_height/2.0;
        Dx = Math.max(0, $("#main_media").scrollLeft()+(amt-1.0)*cx); // displacement needed
        Dy = Math.max(0, $("#main_media").scrollTop()+(amt-1.0)*cy);
        
        // set the width and height and scrolls
        $("#main_media").scrollLeft(Dx).scrollTop(Dy);
        $("#main_media").width(this.curr_frame_width).height(this.curr_frame_height);
        
    };
    
    
    // Retrieves and sets the original image's dimensions (width/height).
    this.SetOrigImDims = function (im) {
        this.width_orig = im.width;
        this.height_orig = im.height;
        return;
    };
    
    //gets available width (6.14.06)
    this.GetAvailWidth = function() {
        return $(window).width() - $("#main_media").offset().left -10 - 200;
        // we could include information about the size of the object box using $("#anno_list").offset().left
    };
    
    //gets available height (6.14.06)
    this.GetAvailHeight = function() {
        var m = main_media.GetFileInfo().GetMode();
        if(m=='mt') {
            return $(window).height() - $("#main_media").offset().top -75;
        }
        return $(window).height() - $("#main_media").offset().top -10;
    };
    
    
    
    // Returns true if the image is zoomed to the original (fitted) resolution.
    this.IsFitImage = function () {
        return (this.im_ratio < 0.01+this.browser_im_ratio);
    };
    
    // Returns true if (x,y) is viewable.
    this.IsPointVisible = function (x,y) {        
        var scrollLeft = $("#main_media").scrollLeft();
        var scrollTop = $("#main_media").scrollTop();
        
        if(((x*this.im_ratio < scrollLeft) ||
            (x*this.im_ratio - scrollLeft > this.curr_frame_width - 160)) || 
           ((y*this.im_ratio < scrollTop) || 
            (y*this.im_ratio - scrollTop > this.curr_frame_height))) 
            return false;  //the 160 is about the width of the right-side div
        return true;
    };
    
}

