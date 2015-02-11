// retrieves a file via XMLHTTPRequest, calls fncCallback when done or fncError on error.


 var oVP;

function JSVideo() {



// var fname_folder_root = "/var/www/LabelMeVideo/VLMFrames/"
// var fname_folder = location.search.split('source=')[1] ? location.search.split('source=')[1] : "unusual_clips/backing/";

  var fname_folder_root = "/var/www/developers/xavierpuigf/LabelMeAnnotationTool/"
  var fname_folder = main_media.GetFileInfo().GetImagePath()+"/";
  fname_folder =  fname_folder;

  // *******************************************
  // Private variables:
  // *******************************************

  // Struct with video data:
  var oVideoData = null;

  // HTML elements with video data:
  var aFrameImages = [];
  
  // Display width/height for video:
  var imageWidth;
  var imageHeight;
  
  // Current displayed video frame:
  var iFrameCtr = 0;

  // Last "time" for frame rate calculation:
  var iLastTime = -1;

  // Indicates whether the video has started playing:
  var bPlaying = false;

  // Indicates if the video is paused:
  var bPaused = false;

  // Indicates whether it was the user who paused the video
  var uPaused = false;

  // Indicates if the scroll button is clicked:
  var scroll_button_clicked = false;

  // *******************************************
  // Public methods:
  // *******************************************

  // Starting point of video player.  Load a video file from URL.
  this.getnumFrames = function (){
    if (oVideoData == null) return 0;
    else return oVideoData.frames;
  }
  this.getcurrentFrame = function (){
    return iFrameCtr;
  }
this.loadFile = function(frame, first_time, isbackground, response) {


    if (first_time || frame == iFrameCtr) $('#oLoading').css('display',"block");
    
    var fncLoad = function() {
      try {
        console.timeEnd('Load video');
        oVideoData = eval("(" + response + ")");
        if (first_time){ 
          oVP.imageWidth = oVideoData.width;
          oVP.imageHeight = oVideoData.height;
          oVP.CreateVideoCanvas();
        }
        if (first_time || frame >= iFrameCtr) $('#oLoading').css('display',"none");
        oVP.GenerateFrames();
        if (first_time) ovP.GoToFrame(frame);
        ovP.seekChunkToDownload(frame);
        if (first_time || frame == iFrameCtr ) oVP.Play();
      }
      catch(e) {
         console.log("Error parsing video data ", e);
      }
    }
    var fncError = function() {
      console.log("Error loading video file");
    }
    if (response) fncLoad();
    else fncError();
  }


  // Create video canvas elements.
  this.CreateVideoCanvas = function() {
    // Create canvas:
    var oCanvas = '<svg id="canvas" width="' + this.imageWidth + '" height="' + this.imageHeight + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;left:8px;top:8px;z-index:-5;"></svg><div id="oCanvas" style="background-color:black;width:' + this.imageWidth + 'px;height:' + this.imageHeight + 'px;position:relative;z-index:-5;" />';
    $('#videoplayer').append(oCanvas);
  
    // Create "loading" message:
    var oLoading = '<div id="oLoading" style="width:100%;height:30px;position:absolute;bottom:0px;padding-top:10px;color:white;text-align:center;display:none;font-family:verdana;font-size:12px;z-index:4" >Loading video file...</div>';
    $('#oCanvas').append(oLoading);
    
    // Create scroll bar:
    var oScroll = '<div id="oScroll" style="width:'+this.imageWidth+'px;"></div>'
    var oLoad = '<div id="oLoadBar" style="width:'+this.imageWidth+'px; z-index:0"></div>'

          
    $('#videoplayer').append(oScroll);
    $('#oScroll').slider({
            range : "min",
            min   : 1,
            max   : this.imageWidth,
            value : 1,
            slide : function (event, ui) {
                pos = ui.value/ovP.imageWidth;
                iFrameCtr = Math.max(Math.floor(pos*(oVideoData.frames-1)),1);
                ovP.DisplayFrame(iFrameCtr);
            }
            
        });

    // Create loaded bar
    
    $('#oScroll').append(oLoad);
    $('#oLoadBar').slider({
            range : "min",
            min   : 1,
            max   : this.imageWidth,
            value : 1,
            
            
        });
    $("#oScroll .ui-slider-range").css("background", "red");
    $("#oLoadBar .ui-slider-range").css("background", "gray");
    $("#oLoadBar .ui-slider-handle").css("display", "none");
    $('#oLoadBar.ui-slider, #oLoadBar ui-slider-handler').off();
    //$('#oScroll.ui-slider, #oScroll ui-slider-handler').off();
    // Create controls:
    var oControls = '<div id="oControls" style="width:' + this.imageWidth + 'px;height:30px;bottom:0px;text-align:center;padding-top:10px;z-index:10;" />';
    $('#videoplayer').append(oControls);
    
    // Step beginning button:
    var oBtnStepBeginning = '<img id="stepbeginningbutton" src="./annotationTools/video/icons/video_beginning.png" style="border-width:px;padding:10px;" onclick="oVP.StepBeginning();" title="Go to beginning" />';
    $('#oControls').append(oBtnStepBeginning);
    
    // Step backward button:
    var oBtnStepBackward = '<img id="stepbackwardbutton" src="./annotationTools/video/icons/video_stepback.png" style="border-width:px;padding:10px;" onclick="oVP.StepBackward();" title="Step backward" />';
    $('#oControls').append(oBtnStepBackward);
    
    // Pause button:
    var oBtnPause = '<img id="playpausebutton" src="./annotationTools/video/icons/video_pause.png" style="border-width:px;padding:10px;" onclick="oVP.Pause(true);" title="Pause" />';
    $('#oControls').append(oBtnPause);
    
    // Step forward button:
    var oBtnStepForward = '<img id="stepforwardbutton" src="./annotationTools/video/icons/video_stepforward.png" style="border-width:px;padding:10px;" onclick="oVP.StepForward();" title="Step forward" />';
    $('#oControls').append(oBtnStepForward);

    // Step end button:
    var oBtnStepEnd = '<img id="stependbutton" src="./annotationTools/video/icons/video_end.png" style="border-width:px;padding:10px;" onclick="oVP.StepEnd();" title="Go to end" />';
    $('#oControls').append(oBtnStepEnd);
    
    var frameNumber = '<div>Frame number: <p style="display: inline-block" id="framenum">0</p></div>';
    $('#oControls').append(frameNumber);

    var goToFrameForm = '<form action="">Go to frame:<input type="text" id="frameinput" placeholder="Frame Number"></input><input type="button" onclick="oVP.GoToFrameButtonClicked()" value="Submit"></input></form>';
     $('#oControls').append(goToFrameForm);         

  };

  this.poly_id = Array();
  this.X = Array();
  this.Y = Array();
  this.display_polygon = Array();

  this.GoToFrameButtonClicked = function(){
    var framevalue = Math.max(Math.min(this.getnumFrames()-1,$('#frameinput').val()),0);
    this.GoToFrame(parseInt(framevalue));
  }
  this.GenerateFrames = function() {
    var shift = oVideoData.firstframe;
    for(var i = 0; i < oVideoData.data.video.length; i++) {
      var oImage = '<img src="' + oVideoData.data.video[i] + '" id="im" style="display:block;position:absolute;padding:0;border-width:0;width:' + this.imageWidth + 'px;height:' + this.imageHeight + 'px;z-index:-3;" />';
      aFrameImages[i+shift] = oImage;
    }

  }
  
  this.DisplayFrame = function(i) {
    // Show frame:
    $('#framenum').html(i);

    if (aFrameImages[i] == null){
      this.Pause();
      ovP.loadChunk(i, 2, false, false);
      //return;
    }
    if($('#im').length) {
      $('#im').replaceWith(aFrameImages[i]);
    }
    else {
      $('#oCanvas').append(aFrameImages[i]);
    }
    $('#myCanvas_bg').empty();

    var attr = 'fill="none" stroke="' + HashObjectColor(name) + '" stroke-width="4"';
    var scale = 1;
    
    // Plot polygons:
    var xml = LM_xml
    var N = $(xml).children("annotation").children("object").length;
    for(var it = 0; it < N; it++) {
      var obj = $(xml).children("annotation").children("object").eq(it);
        // Get object name:

        // Get points:
        var anno_id = obj.children("id").text();
          var X = Array();
          var Y = Array();
          var framestamps = (obj.children("polygon").children("t").text()).split(',')
          for(var ti=0; ti<framestamps.length; ti++) { framestamps[ti] = parseInt(framestamps[ti], 10); } 
          var objectind = framestamps.indexOf(i);
          
          if (objectind >= 0){
           var pointsx = (obj.children("polygon").children("x").text()).split(';')[objectind]
           X = pointsx.split(',')
           for(var ti=0; ti<X.length; ti++) { X[ti] = parseInt(X[ti], 10); } 
           var pointsy = (obj.children("polygon").children("y").text()).split(';')[objectind]
           Y = pointsy.split(',')
           for(var ti=0; ti<Y.length; ti++) { Y[ti] = parseInt(Y[ti], 10); } 
            var obj_name = "foo";
           if (obj.children("name")) obj_name = obj.children("name").text();
           if (select_anno == null || (select_anno && select_anno.anno_id != anno_id)){
              polid = DrawPolygon('myCanvas_bg',X,Y,obj_name,attr,scale);
              $('#'+polid).attr('onmousedown','StartEditVideoEvent("'+polid+'",' + it + ',evt); return false;');
              //$('#'+polid).attr('onmousemove','main_handler.CanvasMouseMove(evt,'+ it +'); return false;');
              $('#'+polid).attr('oncontextmenu','return false');
              $('#'+polid).css('cursor','pointer');
            }
            else {

              $('#'+select_anno.polygon_id).parent().remove();
              $('#'+select_anno.polygon_id).remove();
              adjust_event.x  = X;
              adjust_event.y = Y;
              adjust_event.polygon_id = adjust_event.DrawPolygon(adjust_event.dom_attach,X,Y,obj_name,scale);
              select_anno.polygon_id = adjust_event.polygon_id;
              
              adjust_event.RemoveControlPoints();
              adjust_event.RemoveCenterOfMass();

              adjust_event.ShowControlPoints();
              adjust_event.ShowCenterOfMass();
            }
          }
        }
  }
  this.GoToFrame = function(frame){
    iFrameCtr = frame;
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }
  this.ShowFirstFrame = function() {
    // $('#oCanvas').append(aFrameImages[0]);
    this.DisplayFrame(0);
    this.UpdateScrollbar(0);
  }
  
  // Update location of scrollbar:
  this.UpdateScrollbar = function(pos) {
    $('#oScroll').slider('value',  pos*this.imageWidth);
    //$('#scrollbutton').css('left',pos*this.imageWidth);
    //$('#oProgress').css('width',pos*this.imageWidth);
  }
  this.UpdateLoadbar = function(pos){
    //$('#oLoadBar').css('width',pos*this.imageWidth);
    $('#oLoadBar').slider('value',  pos*this.imageWidth);
  }

  // Start playback.
  this.Play = function(buttonClicked) {
    //if (active_canvas != REST_CANVAS) return;
    if (buttonClicked) uPaused = false;
    else if (uPaused == true) return;
    if (aFrameImages[iFrameCtr] == null) return;
    if (bPlaying) {
      if (bPaused) bPaused = false;
      
      // Replace with pause button:
      $('#playpausebutton').attr('src','annotationTools/video/icons/video_pause.png');
      $('#playpausebutton').attr('title','Pause');
      $('#playpausebutton').attr('onclick','oVP.Pause(true);');

      if(iFrameCtr == (oVideoData.frames-1)) iFrameCtr = 0;
      
      return;
    }
    bPlaying = true;
    this.NextFrame();
  }
  
  // render next frame
  this.NextFrame = function() {
    if (!bPlaying) return;
    
    var iFrameRate = Math.round(1000 / oVideoData.rate);
    var iNow = new Date().getTime();
    var iLag = 0;
    if (!bPaused) {
      iFrameCtr++;
      if (iLastTime > -1) {
	var iDeltaTime = iNow - iLastTime;
	iLag = iDeltaTime - iFrameRate;
	while (iLag > iFrameRate) {
	  iFrameCtr++;
	  iLag -= iFrameRate;
	}
      }
      if (iLag < 0) iLag = 0;
      if (iFrameCtr >= oVideoData.frames) {
	iFrameCtr = oVideoData.frames-1;
	this.Pause();
      }
      
      this.DisplayFrame(iFrameCtr);
      this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
    }
    iLastTime = iNow;
    setTimeout(function() {
	oVP.NextFrame();
      }, iFrameRate - iLag);
  }
  
  // Pause playback:
  this.Pause = function(buttonClicked) {
    if (buttonClicked) uPaused = true;
    bPaused = true;
    
    // Replace with play button:
    $('#playpausebutton').attr('src','./annotationTools/video/icons/video_play.png');
    $('#playpausebutton').attr('title','Play');
    $('#playpausebutton').attr('onclick','oVP.Play(true);');
  }
  
  // Step forward one frame:
  this.StepForward = function() {
    if(!bPaused) this.Pause();
    else {
      iFrameCtr++;
      if (iFrameCtr >= oVideoData.frames) {
	iFrameCtr = oVideoData.frames-1;
      }
      
      // Render next frame:
      this.DisplayFrame(iFrameCtr);
      this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
    }
  }
  
  // Step backward one frame:
  this.StepBackward = function() {
    if(!bPaused) this.Pause();
    else {
      iFrameCtr--;
      if (iFrameCtr <= 0) {
	iFrameCtr = 1;
      }
      
      // Render next frame:s
      this.DisplayFrame(iFrameCtr);
      this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
    }
  }

  // Go to beginning of video:
  this.StepBeginning = function() {
    this.Pause();
    iFrameCtr = 1;
    
    // Render next frame:
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }

  // Go to end of video:
  this.StepEnd = function() {
    this.Pause();
    iFrameCtr = oVideoData.frames-1;
    
    // Render next frame:
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }
  this.seekChunkToDownload = function (frame){
    while (aFrameImages[frame] != null) frame++;
    if (frame < oVideoData.frames) this.loadChunk(frame, 1, false, true);
  }
  this.loadChunk = function(frame, duration, first_time, isbackground){
    ovP = this;
    $.ajax({
           async: true,
           type: "POST", 
           url: "./annotationTools/php/encode.php",
           data: {width: "640", height: "480", rate:"15", input: fname_folder,frame: frame.toString(), duration: duration},
           success: function(response){
            last_frame = Math.min(frame + duration*15, ovP.getnumFrames());
            ovP.loadFile(frame, first_time, isbackground, response)
            if (ovP.getnumFrames() != 0 && ovP.getcurrentFrame() <= last_frame) ovP.UpdateLoadbar(last_frame/ovP.getnumFrames());

          }
    });
  }
}

