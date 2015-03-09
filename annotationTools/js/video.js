
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
        this.im_ratio = 1.;
        this.width_curr = 640;
        this.height_curr = 480;
        this.width_orig = 640;
        this.height_orig = 480;
        
        
        
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
    this.GetInterpolatedPoints = function (xinit, yinit, xend, yend, tinit, tend, tcurrent){
        Xresp = Array(xinit.length);
        Yresp = Array(xinit.length);
        for (var i = 0; i <Xresp.length; i++){
            alfa = (tend - tcurrent)/(tend-tinit);
            Xresp[i] = alfa*xinit[i] + (1-alfa)*xend[i];
            Yresp[i] = alfa*yinit[i] + (1-alfa)*yend[i];
        }
        return [Xresp, Yresp];
    }
    this.UpdateObjectPosition = function (anno){
        // FALTA AFEGIR FRAMES <t> PER DAVANT QUAN EXTENEM EL POLIGON FRAMES A PRIORI
      console.log(LM_xml);
      var obj_ndx = anno.anno_id;
      var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_ndx);
      var framestamps = (curr_obj.children("polygon").children("t").text()).split(',');
      var userlabeledframes = (curr_obj.children("polygon").children("userlabeled").text()).split(',');
      var pts_x = (curr_obj.children("polygon").children("x").text()).split(';');
      var pts_y = (curr_obj.children("polygon").children("y").text()).split(';');

      for(var ti=0; ti<framestamps.length; ti++) { 
        framestamps[ti] = parseInt(framestamps[ti], 10); 
      }
      for (var ti = 0; ti < userlabeledframes.length; ti++){
        userlabeledframes[ti] = parseInt(userlabeledframes[ti],10);
      }
      while (framestamps[0] > oVP.getcurrentFrame()){
        framestamps.unshift(framestamps[0]-1);
        pts_x.unshift(pts_x[0]);
        pts_y.unshift(pts_y[0]);
      }
      var ti = 0;
      while (ti < userlabeledframes.length && userlabeledframes[ti] <= oVP.getcurrentFrame()) ti++;
      var ti2 = 0;
      while (ti2 < userlabeledframes.length && userlabeledframes[ti2] < oVP.getcurrentFrame()) ti2++;
      ti2--;//

      var framenext = framestamps.length;
      var frameprior = -1;
      if (ti2 >= 0) frameprior = framestamps.indexOf(userlabeledframes[ti2]);
      if (ti < userlabeledframes.length) framenext = framestamps.indexOf(userlabeledframes[ti]);
      var objectind = framestamps.indexOf(oVP.getcurrentFrame());
      // backward interpolation
      for (var i = frameprior+1; i < objectind; i++){
        var coords = [anno.pts_x, anno.pts_y];
        if (frameprior > -1){
            var Xref = pts_x[frameprior].split(',');
            var Yref = pts_y[frameprior].split(',');
            coords = this.GetInterpolatedPoints(Xref, Yref, anno.pts_x, anno.pts_y, framestamps[frameprior], framestamps[objectind], framestamps[i]);
        }
        
        pts_x[i] = coords[0].join();
        pts_y[i] = coords[1].join();
      }
      pts_y[objectind] = anno.pts_y;
      pts_x[objectind] = anno.pts_x;
      // forward interpolation
      for (var i = objectind+1; i < framenext; i++){
        var coords = [anno.pts_x, anno.pts_y];
        if (framenext < framestamps.length){
            var Xref = pts_x[framenext].split(',');
            var Yref = pts_y[framenext].split(',');
            coords = this.GetInterpolatedPoints(anno.pts_x, anno.pts_y, Xref, Yref, framestamps[objectind], framestamps[framenext], framestamps[i]);
        }
        pts_x[i] = coords[0].join();
        pts_y[i] = coords[1].join();
      }
      userlabeledframes.push(oVP.getcurrentFrame());
      jQuery.unique(userlabeledframes);
      userlabeledframes.sort(function(a, b){return a-b});
      new_x_str = pts_x.join(';');
      new_y_str = pts_y.join(';');
      curr_obj.children("polygon").children("t").text(framestamps.join(','));
      curr_obj.children("polygon").children("x").text(new_x_str);
      curr_obj.children("polygon").children("y").text(new_y_str);   
      curr_obj.children("polygon").children("userlabeled").text(userlabeledframes.join());  
        
    }
    this.SubmitEditObject = function (){
        submission_edited = 1;
        var anno = select_anno;
      
      // object name
      old_name = LMgetObjectField(LM_xml,anno.anno_id,'name');
      if(document.getElementById('objEnter')) new_name = RemoveSpecialChars(document.getElementById('objEnter').value);
      else new_name = RemoveSpecialChars(adjust_objEnter);
      
      var re = /[a-zA-Z0-9]/;
      if(!re.test(new_name)) {
        alert('Please enter an object name');
        return;
      }
      
      if (use_attributes) {
        // occlusion field
        if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
        else new_occluded = RemoveSpecialChars(adjust_occluded);
        
        // attributes field
        if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
        else new_attributes = RemoveSpecialChars(adjust_attributes);
      }
      
      StopEditEvent();
      
      // Object index:
      var obj_ndx = anno.anno_id;
      
      // Pointer to object:
      var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_ndx);
      
      // Set fields:
      curr_obj.children("name").text(new_name);
      if(curr_obj.children("automatic").length > 0) curr_obj.children("automatic").text("0");
      
      // Insert attributes (and create field if it is not there):
      if(curr_obj.children("attributes").length>0) curr_obj.children("attributes").text(new_attributes);
      else curr_obj.append("<attributes>" + new_attributes + "</attributes>");
        
      if(curr_obj.children("occluded").length>0) curr_obj.children("occluded").text(new_occluded);
      else curr_obj.append("<occluded>" + new_occluded + "</occluded>");
      this.UpdateObjectPosition(anno);  
      oVP.DisplayFrame(oVP.getcurrentFrame());    
      
    }
    this.SubmitObject = function (){
        var nn;
        var anno;
        if (use_attributes) {
            // get attributes (is the field exists)
            if(document.getElementById('attributes')) new_attributes = RemoveSpecialChars(document.getElementById('attributes').value);
            else new_attributes = "";
            
            // get occlusion field (is the field exists)
            if (document.getElementById('occluded')) new_occluded = RemoveSpecialChars(document.getElementById('occluded').value);
            else new_occluded = "";
        }
        if((object_choices!='...') && (object_choices.length==1)) {
            nn = RemoveSpecialChars(object_choices[0]);
            active_canvas = REST_CANVAS;
            // Move draw canvas to the back:
            document.getElementById('draw_canvas').style.zIndex = -2;
            document.getElementById('draw_canvas_div').style.zIndex = -2;
            var anno = null;
            if(draw_anno) {
              anno = draw_anno;
              draw_anno = null;
            }
            
        }
        else {
            nn = RemoveSpecialChars(document.getElementById('objEnter').value);
            anno = main_handler.QueryToRest();
        }
        var re = /[a-zA-Z0-9]/;
        if(!re.test(nn)) {
            alert('Please enter an object name');
            return;
        }
        
    
        // Update old and new object names for logfile:
        submission_edited = 0;
        global_count++;
      
        // Insert data into XML:
        var html_str = '<object>';
        html_str += '<name>' + nn + '</name>';
        if(use_attributes) {
            html_str += '<occluded>' + new_occluded + '</occluded>';
            html_str += '<attributes>' + new_attributes + '</attributes>';
        }
        html_str += '<parts><hasparts></hasparts><ispartof></ispartof></parts>';
        var ts = 0;//GetTimeStamp();
        if(ts.length==20) html_str += '<date>' + ts + '</date>';
        html_str += '<id>' + anno.anno_id + '</id>';
        html_str += '<polygon>';
        html_str += '<username>' + username + '</username>';
        var t_str = '<t>';
        var x_str = '<x>';
        var y_str = '<y>';
        for (var fr = oVP.getcurrentFrame(); fr < oVP.getnumFrames(); fr++){
            if (fr > oVP.getcurrentFrame()){ 
                t_str += ', ';
                x_str += '; ';
                y_str += '; ';
            }
            t_str += fr;
            for(var jj=0; jj < anno.GetPtsX().length; jj++) {
                if (jj > 0){
                    x_str += ', ';
                    y_str += ', ';
                }
                x_str += anno.GetPtsX()[jj];
                y_str += anno.GetPtsY()[jj];
            }
        }
        t_str += '</t>';
        x_str += '</x>';
        y_str += '</y>';
        html_str += t_str;
        html_str += x_str;
        html_str += y_str;
        html_str += '<userlabeled>'+oVP.getcurrentFrame()+'</userlabeled>';
        html_str += '</polygon>';
        html_str += '<parts>'
        html_str += '<hasparts/>'
        html_str += '<ispartof/>'
        html_str += '</parts>'
        html_str += '</object>';
        $(LM_xml).children("annotation").append($(html_str));
        //ChangeLinkColorFG(anno.GetAnnoID());
        $('#select_canvas').css('z-index','0');
        $('#select_canvas_div').css('z-index','0');
        $('#'+this.polygon_id).remove();
          select_anno = anno;
          // var anno = main_canvas.DetachAnnotation(anno.anno_id);
        adjust_event = new AdjustEvent('select_canvas',anno.pts_x,anno.pts_y,LMgetObjectField(LM_xml,anno.anno_id,'name'),function(x,y,_editedControlPoints) {
          // Submit username:
          if(username_flag) submit_username();

          // Redraw polygon:
          anno = select_anno;
          anno.DrawPolygon(main_media.GetImRatio());

          // Set polygon (x,y) points:
          anno.pts_x = x;
          anno.pts_y = y;

          // Set global variable whether the control points have been edited:
          editedControlPoints = _editedControlPoints;
          // Submit annotation:
          StopEditEvent();
          
        },main_media.GetImRatio());
      // Start adjust event:
      adjust_event.StartEvent();
    };


    
}

