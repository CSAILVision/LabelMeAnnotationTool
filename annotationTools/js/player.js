
/** @file This file the information about the video player. */

/** Global reference to the video player 
 * @global 
 
 */
var oVP;

/** 
 * Creates a video player pointing to files specified by the url
 * @constructor
*/
function JSVideo() {
  var frame_rate = 10;
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

/** This function checks that the loaded frames are correct, stores them in the video structure
   * It prepares the polygon for scaling.
   * @param {int} frame - the position corresponding to the first frame in the set
   * @param {bool} first_time - boolean indicating whether it was the first frame load of the video
   * @param {json} response - json with the set of jpg frames being loaded
*/
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
        if (first_time) oVP.GoToFrame(frame);
        oVP.seekChunkToDownload(frame);
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
  this.ShowTemporalBar = function (){
    if (!select_anno) return;
    var selected_object_frames = LMgetObjectField(LM_xml, select_anno.anno_id, 't');
    var oTemporal = '<div id="oTempBar" style="width:'+this.imageWidth+'px; height:10px; z-index:0; top:-30px"></div>';
    $('#oScroll').append(oTemporal);
    $('#oTempBar').slider({
      range : true,
      min   : 1,
      max   : oVideoData.frames,
      values : [selected_object_frames[0], selected_object_frames[selected_object_frames.length-1]],
      slide : function (event, ui) {
        var userlab = LMgetObjectField(LM_xml, select_anno.anno_id, 'userlabeled');
        selected_object_frames = LMgetObjectField(LM_xml, select_anno.anno_id, 't');
        var init = ui.values[ 0 ];
        var end = ui.values[1];
        if (init > userlab[0] || end < userlab[userlab.length-1]) return false;
        var i1 = selected_object_frames.indexOf(init);
        var i2 = selected_object_frames.indexOf(end);
        console.log(init, end);
        var obj = $(LM_xml).children("annotation").children("object").eq(select_anno.anno_id);
        var pts_x = (obj.children("polygon").children('x').text()).split(';');
        var pts_y = (obj.children("polygon").children('y').text()).split(';');
        if (i1 == -1){
          while (selected_object_frames[0] > init){
            selected_object_frames.unshift(selected_object_frames[0]-1);
            pts_x.unshift(pts_x[0]);
            pts_y.unshift(pts_y[0]);
          }
          i1 = 0;
        }
        if (i2 == -1){
          while (selected_object_frames[selected_object_frames.length-1] < end){
            selected_object_frames.push(selected_object_frames[selected_object_frames.length-1]+1);
            pts_x.push(pts_x[pts_x.length-1]);
            pts_y.push(pts_y[pts_y.length-1]);
          }
          i2 = pts_x.length-1;
        }
        pts_x = pts_x.slice(i1,i2+1);
        pts_y = pts_y.slice(i1,i2+1);
        selected_object_frames = selected_object_frames.slice(i1, i2+1);
        console.log(selected_object_frames[0]);
        console.log(selected_object_frames[selected_object_frames.length-1]);
        LMsetObjectField(LM_xml, select_anno.anno_id, 'x', pts_x.join(';'));
        LMsetObjectField(LM_xml, select_anno.anno_id, 'y', pts_y.join(';'));
        LMsetObjectField(LM_xml, select_anno.anno_id, 't', selected_object_frames.join(','));
        if (ui.handle.nextSibling){ // left slider
          oVP.DisplayFrame(-init);
        }
        else {
          oVP.DisplayFrame(-end);
        }      
      },
      stop: function(event, ui){
        oVP.DisplayFrame(oVP.getcurrentFrame());
      } 
    });
    
    $("#oTempBar .ui-slider-handle").css("top", "-0.1em");
    $("#oTempBar .ui-slider-handle").css("height", "0.75em");
    $("#oTempBar .ui-slider-handle").css("width", "0.5em");

  }

  this.HideTemporalBar = function (){
    $('#oTempBar').remove();  
  }
  this.HighLightFrames = function(framestotal, userlabeledframes){
    $('.oObjectshow').remove();
    var offset = 0;
    for (var typeframe = 0; typeframe < 2; typeframe++){
      
      var frames;
      var color;
      var zind;
      if (typeframe == 0){
        color = 'yellow';
        frames = framestotal;
        zind = 0;
      } 
      else {
        color = 'red';
        frames = userlabeledframes;
        zind = 1;

      }
      if (frames.length == 0) return;
      var frame1 = frames[0];
      var frame2 = frames[0];
      var i = 1;

      while (i < frames.length){
        if (frames[i] == frames[i-1]+1){
          frame2 = frames[i];
          
        }
        else {
          var width = this.imageWidth*(frame2 - frame1)/(oVideoData.frames-1);
          if (width == 0) width = this.imageWidth/(oVideoData.frames-1);
          var posx = this.imageWidth*(frame1 - 1)/(oVideoData.frames-1);
          var oObjectShow = '<div class="oObjectshow" style="display:inline-block;width:' + width + 'px;height:3px;position:relative;left:'+(posx-offset)+'px;top:-30px;z-index:'+zind+';background-color:'+color+';" />';
          offset += (width);
          $('#oControls').before(oObjectShow);
          frame1 = frame2 = frames[i];

        }
        i++;
      }
      var width = this.imageWidth*(frame2 - frame1)/(oVideoData.frames-1);
      if (width == 0) width = this.imageWidth/(oVideoData.frames-1);
      var posx = this.imageWidth*(frame1 - 1)/(oVideoData.frames-1); 
      var oObjectShow = '<div class="oObjectshow" style="display:inline-block;width:' + width + 'px;height:3px;position:relative;left:'+(posx-offset)+'px;top:-30px;z-index:'+zind+';background-color:'+color+';" />';
      offset += (width);
      $('#oControls').before(oObjectShow);
    }
    
  }
  this.ShowLoadedFramesForDebug = function (){
    $('.oObjectshow').remove();
    var offset = 0;
    var frames;
    var color;
    var zind;
    color = 'yellow';
    var framesLoaded = aFrameImages;
    zind = 0;
    if (framesLoaded.length == 0) return;
    var frame1 = 0;
    var frame2 = 0;
    var i = 1;
    console.log(framesLoaded.length);
    while (i < framesLoaded.length){
      if (framesLoaded[i] != null){
        frame2 = i;
        
      }
      else {
        var width = this.imageWidth*(frame2 - frame1)/(oVideoData.frames-1);
        if (frame2 > frame1){
          var posx = this.imageWidth*(frame1 - 1)/(oVideoData.frames-1);
          console.log(frame2, frame1);
          var oObjectShow = '<div class="oObjectshow" style="display:inline-block;width:' + width + 'px;height:3px;position:relative;left:'+(posx-offset)+'px;top:-30px;z-index:'+zind+';background-color:'+color+';" />';
          offset += (width);
          console.log(oObjectShow);
          $('#oControls').before(oObjectShow);
        }
        
        frame1 = frame2 = i;

      }
      i++;
    }
    console.log(frame1, frame2)
    var width = this.imageWidth*(frame2 - frame1)/(oVideoData.frames-1);
    if (width > 0){
      var posx = this.imageWidth*(frame1 - 1)/(oVideoData.frames-1); 
      var oObjectShow = '<div class="oObjectshow" style="display:inline-block;width:' + width + 'px;height:3px;position:relative;left:'+(posx-offset)+'px;top:-30px;z-index:'+zind+';background-color:'+color+';" />';
      console.log(oObjectShow);
      $('#oControls').before(oObjectShow);
    }
    
  }


  this.UnHighLightFrames = function (){
    $('.oObjectshow').remove();
    var oObjectShow = '<div class="oObjectshow" style="display:inline-block;width:' + this.imageWidth + 'px;height:3px;position:relative;left:'+0+'px;top:-30px;z-index:0;" />';
    $('#oControls').before(oObjectShow);

  }
  /** This function creates the html elements (display, scroll bar and buttons) for the video player */
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
                if (wait_for_input || edit_popup_open) return false;
                pos = ui.value/oVP.imageWidth;
                iFrameCtr = Math.max(Math.floor(pos*(oVideoData.frames-1)),1);
                oVP.DisplayFrame(iFrameCtr);
            }
            
        });
    // Object show
    var oObjectShow = '<div class="oObjectshow" style="display:inline-block;width:' + this.imageWidth + 'px;height:3px;position:relative;left:'+0+'px;top:-30px;z-index:0;" />';
    $('#oScroll').after(oObjectShow);
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
    
    // var frameNumber = '<div>Frame number: <p style="display: inline-block" id="framenum">0</p></div>';
    // $('#oControls').append(frameNumber);

    // var goToFrameForm = '<form action="">Go to frame:<input type="text" id="frameinput" placeholder="Frame Number"></input><input type="button" onclick="oVP.GoToFrameButtonClicked()" value="Submit"></input></form>';
    //  $('#oControls').append(goToFrameForm);         

  };

  this.poly_id = Array();
  this.X = Array();
  this.Y = Array();
  this.display_polygon = Array();
  /** This function is called when the user clicks the Go to frame button. It displays the frame indicated by the text field */
  this.GoToFrameButtonClicked = function(){
    var framevalue = Math.max(Math.min(this.getnumFrames()-1,$('#frameinput').val()),0);
    this.GoToFrame(parseInt(framevalue));
  }

  /** This function generates the html <img> elements that contain the loaded frames */
  this.GenerateFrames = function() {
    var shift = oVideoData.firstframe;
    for(var i = 0; i < oVideoData.data.video.length; i++) {
      if (aFrameImages[i+shift] == null){
        var oImage = '<img src="' + oVideoData.data.video[i] + '" id="im" style="display:block;position:absolute;padding:0;border-width:0;width:' + this.imageWidth + 'px;height:' + this.imageHeight + 'px;z-index:-3;" />';
        aFrameImages[i+shift] = oImage;
      }
    }

  }
  /** This function displays the frame at position i, as well as the annotations corresponding to such frame. 
   * If such frame is not available, it pauses the player, loads a chunk of frames starting from i and replays.
   * @param {int} i - the index of the frame to be displayed
  */
  this.DisplayFrame = function(i) {
    // Show frame:
    var slidervalues = [];
    var preview_mode = false;
    if (i < 0 && select_anno){
      slidervalues = $('#oTempBar').slider("option", "values");
      i *= -1;
      preview_mode = true;
    }
    $('#framenum').html(i);

    if (aFrameImages[i] == null){
      this.Pause();
      oVP.loadChunk(i, 4, false, false);
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
        var del = parseInt($(LM_xml).children("annotation").children("object").eq(it).children("deleted").text());
        if (del) continue;
        var obj = $(xml).children("annotation").children("object").eq(it);
        
        // Get object name:

        // Get points:
        var anno_id = obj.children("id").text();
          var X = LMgetObjectField(LM_xml,it, 'x',i);
          var Y = LMgetObjectField(LM_xml,it, 'y', i);
           var obj_name = "foo";
           if (obj.children("name")) obj_name = obj.children("name").text();
           if (select_anno == null || (select_anno && select_anno.anno_id != anno_id)){
              if (X.length == 0) continue;
              var anoindex = main_canvas.GetAnnoIndex(it);
              polid = main_canvas.annotations[anoindex].DrawPolygon(scale, X,Y);
              $('#'+polid).attr('onmousedown','StartEditEvent('+ it + ',evt); return false;');
              $('#'+polid).attr('onmousemove','main_handler.CanvasMouseMove(evt,'+ it +'); return false;');
              $('#'+polid).attr('oncontextmenu','return false');
              $('#'+polid).css('cursor','pointer');
            }
            else if (adjust_event){
              $('#'+select_anno.polygon_id).parent().remove();
              $('#'+select_anno.polygon_id).remove();
              adjust_event.RemoveScalingPoints();
              adjust_event.RemoveControlPoints();
              adjust_event.RemoveCenterOfMass();
              if (X.length == 0) continue;
              

              if (!preview_mode && (i < slidervalues[0] || i > slidervalues[1])) continue;
              adjust_event.x  = X;
              adjust_event.y = Y;
              adjust_event.polygon_id = adjust_event.DrawPolygon(adjust_event.dom_attach,X,Y,obj_name,scale);
              select_anno.polygon_id = adjust_event.polygon_id;
              if (adjust_event.bounding_box) adjust_event.ShowScalingPoints();
              else adjust_event.ShowControlPoints();
              adjust_event.ShowCenterOfMass();
            }
        }
  }

  /** This function sets the player to frame 'frame'. 
   * @param {int} frame - the index of the frame of interest
  */  
  this.GoToFrame = function(frame){
    iFrameCtr = frame;
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }


  
  this.ShowFirstFrame = function() {
    // We may need to update the selected object points
    this.DisplayFrame(0);
    this.UpdateScrollbar(0);
  }
  
  /** This function updates the position of the scroll bar. 
    * @param {float} pos - float from 0 to 1 indicating the position of the scroll bar 
  */
  this.UpdateScrollbar = function(pos) {
    $('#oScroll').slider('value',  pos*this.imageWidth);
  }

  /** This function updates the position of the load bar. 
    * @param {float} pos - float from 0 to 1 indicating the position of the load bar 
  */
  this.UpdateLoadbar = function(pos){
    //$('#oLoadBar').css('width',pos*this.imageWidth);
    $('#oLoadBar').slider('value',  pos*this.imageWidth);
  }

  /** This function sets the player to play. It can be called when a chunk of needed frames is loaded or when the user hits the play button. 
    * @param {bool} buttonClicked - boolean indicating whether the user clicked the play button or the video was played because the chunks got loaded
  */
  this.Play = function(buttonClicked) {
    //if (active_canvas != REST_CANVAS) return;
    if (wait_for_input || edit_popup_open) return;
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
  
  /** Displays the next frame in a video file according to the video rate. 
  */
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
  
  /** This function forces to go to the next frame, regardless of frame rate. 
  */
  this.StepForward = function() {
    if (wait_for_input || edit_popup_open) return;
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
  
  /** This function goes to the previous frame. 
  */
  this.StepBackward = function() {
    if (wait_for_input || edit_popup_open) return;
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

  /** This function goes to the start of the video. 
  */
  this.StepBeginning = function() {
    if (wait_for_input || edit_popup_open) return;
    this.Pause();
    iFrameCtr = 1;
    
    
    if (select_anno){
      var userlab = LMgetObjectField(LM_xml,select_anno.anno_id, 'userlabeled');
      var obj_name = LMgetObjectField(LM_xml, select_anno.anno_id, 'name');
      if (userlab.length > 0 && userlab[0] > 1){
        var i = userlab[0];
        var X = LMgetObjectField(LM_xml,select_anno.anno_id, 'x',i);
        var Y = LMgetObjectField(LM_xml,select_anno.anno_id, 'y', i);
        $('#'+select_anno.polygon_id).parent().remove();
        $('#'+select_anno.polygon_id).remove();
        adjust_event.x  = X;
        adjust_event.y = Y;
        adjust_event.polygon_id = adjust_event.DrawPolygon(adjust_event.dom_attach,X,Y,obj_name,1);
        select_anno.polygon_id = adjust_event.polygon_id;
        
        adjust_event.RemoveScalingPoints();
        adjust_event.RemoveControlPoints();
        adjust_event.RemoveCenterOfMass();

        if (adjust_event.bounding_box) adjust_event.ShowScalingPoints();
        else adjust_event.ShowControlPoints();
        adjust_event.ShowCenterOfMass();
      }
    }

    // Render next frame:
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }

  /** This function goes to the end of the video. 
  */
  this.StepEnd = function() {
    if (wait_for_input || edit_popup_open) return;
    this.Pause();
    iFrameCtr = oVideoData.frames-1;

    if (select_anno){
      var userlab = LMgetObjectField(LM_xml,select_anno.anno_id, 'userlabeled');
      var obj_name = LMgetObjectField(LM_xml, select_anno.anno_id, 'name');
      if (userlab.length > 0 && userlab[userlab.length-1] < iFrameCtr){
        var i = userlab[userlab.length-1];
        var X = LMgetObjectField(LM_xml,select_anno.anno_id, 'x',i);
        var Y = LMgetObjectField(LM_xml,select_anno.anno_id, 'y', i);
        $('#'+select_anno.polygon_id).parent().remove();
        $('#'+select_anno.polygon_id).remove();
        adjust_event.x  = X;
        adjust_event.y = Y;
        adjust_event.polygon_id = adjust_event.DrawPolygon(adjust_event.dom_attach,X,Y,obj_name,1);
        select_anno.polygon_id = adjust_event.polygon_id;
        
        adjust_event.RemoveScalingPoints();
        adjust_event.RemoveControlPoints();
        adjust_event.RemoveCenterOfMass();

        if (adjust_event.bounding_box) adjust_event.ShowScalingPoints();
        else adjust_event.ShowControlPoints();
        adjust_event.ShowCenterOfMass();
      }
    }
    
    // Render next frame:
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }
  /** This function looks for future frames that haven't been loaded yet and loads them into the player. 
    * @param {int} frame - the frame index from which to start seeking
  */
  this.seekChunkToDownload = function (frame){
    while (aFrameImages[frame] != null) frame++;
    if (frame < oVideoData.frames && aFrameImages[frame] == null) this.loadChunk(frame, 3, false, true);
    else oVP.UpdateLoadbar(1);
  } 
  /** This function loads a set of frames to the player. 
    * @param {int} frame - the first frame to load
    * @param {int} duration - the duration of the chunk to be loaded
    * @param {bool} first_time - boolean indicating whether the function is called for the first time
  */
  this.loadChunk = function(frame, duration, first_time, isbackground){
    oVP = this;
    $.ajax({
           async: true,
           type: "POST", 
           url: "./annotationTools/php/encode.php",
           data: {width: "640", height: "480", rate:frame_rate.toString(), input: fname_folder,frame: frame.toString(), duration: duration},
           success: function(response){
            last_frame = Math.min(Math.floor(frame + duration*frame_rate), oVP.getnumFrames());
            oVP.loadFile(frame, first_time, isbackground, response);
            while (aFrameImages[last_frame] != null) last_frame++;
            if (oVP.getnumFrames() != 0 && oVP.getcurrentFrame() <= last_frame) oVP.UpdateLoadbar(last_frame/oVP.getnumFrames());

          }
    });
  }
}

