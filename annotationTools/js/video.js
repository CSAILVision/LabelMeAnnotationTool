
// IMAGE CLASS
///////////////////////////////////////////////////////////////////////
// Fetches and manipulates the main image that will be annotated.
// From the HTML code, create a <img src...> tag with an id and pass
// this id in as the argument when creating the class.

function video(id) {
    
    // *******************************************
    // Private variables:
    // *******************************************
    this.page_in_use = 0; // Describes if we already see a video.
    this.id = id;
    this.dir_name = null;
    this.im = document.getElementById("im");
    this.dir_name;
    this.video_name = null;
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
    this.GetNewVideo = function(onload_helper) {

        var videodiv = '<div id="'+id+'" videosrc="" videoautoplay="true" style="vertical-align:bottom;z-index:-4;"></div>';
        $('#main_section').append(videodiv);
        $('#main_media').detach().appendTo('#'+id);
        document.getElementById('loading').style.display = '';
        if(IsMicrosoft()) this.im.style.visibility = 'hidden';
        else this.im.style.display = '';
        wait_for_input = 0;
        edit_popup_open = 0;
        this.SetImageDimensions();
        console.time('Load LabelMe XML file');
        oVP = new JSVideo();
        console.time('Load video');
        oVP.loadChunk(1, 1, true, false);
    };
    
    // Returns the ratio of the available width/height to the original
    // width/height.
    this.GetImRatio = function() {
        return this.im_ratio;
    };
    
    // Returns file_info object that contains information about the
    // displayed image.
    this.GetFileInfo = function() {
        return this;
    };
    
    
    // Sets the dimensions of the image based on browser setup.
    this.SetImageDimensions = function() {
        
        this.width_curr = 640;
        this.height_curr = 480;
        
        
        
        $("#myCanvas_bg").width(this.width_curr).height(this.height_curr);
        $("#select_canvas").width(this.width_curr).height(this.height_curr);
        $("#draw_canvas").width(this.width_curr).height(this.height_curr);
        $("#query_canvas").width(this.width_curr).height(this.height_curr);
        
        $("#main_media").width(this.width_curr).height(this.height_curr);
        this.curr_frame_width = this.width_curr;
        this.curr_frame_height = this.height_curr;
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
        
        if(amt=='fitted') {
                this.im_ratio = this.browser_im_ratio;
        } else {
                this.im_ratio = this.im_ratio * amt;
        }
        
        // if the scale factor is bellow the original scale, then do nothing (do not make the image too small)
        if(this.im_ratio < this.browser_im_ratio) {this.im_ratio=this.browser_im_ratio; return;}
        
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
    this.ParseURL = function () {
        var labelme_url = document.URL;
        var idx = labelme_url.indexOf('?');
        if((idx != -1) && (this.page_in_use == 0)) {
            this.page_in_use = 1;
            var par_str = labelme_url.substring(idx+1,labelme_url.length);
            var isMT = false; // In MT mode?
            var default_view_ObjList = false;
            do {
                idx = par_str.indexOf('&');
                var par_tag;
                if(idx == -1) par_tag = par_str;
                else par_tag = par_str.substring(0,idx);
                var par_field = this.GetURLField(par_tag);
                var par_value = this.GetURLValue(par_tag);
                if(par_field=='mode'){
                    this.mode = par_value;
                    if(this.mode=='im' || this.mode=='mt') view_ObjList = false;
                }
                if(par_field=='username') {
                    username = par_value;
                }
                
                if(par_field=='folder') {
                    this.dir_name = par_value;
                    console.log(par_value);
                }
                if(par_field=='videoname') {
                    this.video_name = par_value;
                    
                }
                
                if((par_field=='scribble')&&(par_value=='true')) {
                    scribble_mode = true;
                }
                if((par_field=='video')&&(par_value=='true')) {
                    video_mode = true;
                }
                par_str = par_str.substring(idx+1,par_str.length);
            } while(idx != -1);

            
            
            if((this.mode=='i') || (this.mode=='c') || (this.mode=='f')) {
                document.getElementById('body').style.visibility = 'visible';
            }
            
            else {
                this.mode = 'i';
                document.getElementById('body').style.visibility = 'visible';
            }
            
            if(!view_ObjList) {
                var p = document.getElementById('anno_anchor');
                p.parentNode.removeChild(p);
            }
            
        }
        
        return 1;
    };
    this.GetDirName = function () {
        return this.dir_name;
    };
    
    this.GetImName = function () {
        return this.video_name;
    };
    this.GetImagePath = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return 'VLMVideos/' + this.dir_name + '/' + this.video_name;
    };
    this.GetFullName = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return this.dir_name + '/' + this.video_name;
    };
    this.GetTemplatePath = function () {
        if(!this.dir_name) return 'annotationCache/XMLTemplates/labelme.xml';
        return 'annotationCache/XMLTemplates/' + this.dir_name + '.xml';
    };
    this.GetURLField = function (str) {
        var idx = str.indexOf('=');
        return str.substring(0,idx);
    };
    
    // String is assumed to have field=value form.  Parses string to
    // return the value.
    this.GetURLValue = function (str) {
        var idx = str.indexOf('=');
        return str.substring(idx+1,str.length);
    };
}

