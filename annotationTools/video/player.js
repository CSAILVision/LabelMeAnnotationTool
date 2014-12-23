// retrieves a file via XMLHTTPRequest, calls fncCallback when done or fncError on error.

var LM_xml;
var oVP;
var fname_folder_root = "/var/www/LabelMeVideo/VLMFrames/"
var fname_folder = location.search.split('source=')[1] ? location.search.split('source=')[1] : "unusual_clips/backing/";
fname_folder = fname_folder_root + fname_folder;
console.log(location.search.split('source=')[1]);



function JSVideo() {

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
        console.log(uPaused);
        if ((first_time || frame == iFrameCtr ) && uPaused == false) oVP.Play();
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
    var oCanvas = '<svg id="canvas" width="' + this.imageWidth + '" height="' + this.imageHeight + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;left:8px;top:8px;z-index:1000;"></svg><div id="oCanvas" style="background-color:black;width:' + this.imageWidth + 'px;height:' + this.imageHeight + 'px;position:relative;" />';
    $('#videoplayer').append(oCanvas);
  
    // Create "loading" message:
    var oLoading = '<div id="oLoading" style="width:100%;height:30px;position:absolute;bottom:0px;padding-top:10px;color:white;text-align:center;display:none;font-family:verdana;font-size:12px;z-index:50" >Loading video file...</div>';
    $('#oCanvas').append(oLoading);
    
    // Create scroll bar:
    var oScroll = '<div id="oScroll" style="width:'+this.imageWidth+'px;"></div>'
    var oLoad = '<div id="oLoadBar" style="width:'+this.imageWidth+'px; z-index:0"></div>'
    $('#videoplayer').append(oScroll);
    $('#oScroll').slider({
            range : "min",
            min   : 0,
            max   : this.imageWidth,
            value : 0,
            slide : function (event, ui) {
                console.log("QUEU");
                //ovP.Pause(false);
                pos = ui.value/ovP.imageWidth;
                iFrameCtr = Math.floor(pos*(oVideoData.frames-1));
                ovP.DisplayFrame(iFrameCtr);
            }
            
        });

    // Create loaded bar
    
    $('#oScroll').append(oLoad);
    $('#oLoadBar').slider({
            range : "min",
            min   : 0,
            max   : this.imageWidth,
            value : 0,
            
            
        });
    $("#oScroll .ui-slider-range").css("background", "red");
    $("#oLoadBar .ui-slider-range").css("background", "gray");
    $("#oLoadBar .ui-slider-handle").css("display", "none");
    $('#oLoadBar.ui-slider, #oLoadBar ui-slider-handler').off();
    //$('#oScroll.ui-slider, #oScroll ui-slider-handler').off();
    // Create controls:
    var oControls = '<div id="oControls" style="width:' + this.imageWidth + 'px;height:30px;bottom:0px;text-align:center;padding-top:10px;z-index:100;" />';
    $('#videoplayer').append(oControls);
    
    // Step beginning button:
    var oBtnStepBeginning = '<img id="stepbeginningbutton" src="icons/video_beginning.png" style="border-width:px;padding:10px;" onclick="oVP.StepBeginning();" title="Go to beginning" />';
    $('#oControls').append(oBtnStepBeginning);
    
    // Step backward button:
    var oBtnStepBackward = '<img id="stepbackwardbutton" src="icons/video_stepback.png" style="border-width:px;padding:10px;" onclick="oVP.StepBackward();" title="Step backward" />';
    $('#oControls').append(oBtnStepBackward);
    
    // Pause button:
    var oBtnPause = '<img id="playpausebutton" src="icons/video_pause.png" style="border-width:px;padding:10px;" onclick="oVP.Pause(true);" title="Pause" />';
    $('#oControls').append(oBtnPause);
    
    // Step forward button:
    var oBtnStepForward = '<img id="stepforwardbutton" src="icons/video_stepforward.png" style="border-width:px;padding:10px;" onclick="oVP.StepForward();" title="Step forward" />';
    $('#oControls').append(oBtnStepForward);

    // Step end button:
    var oBtnStepEnd = '<img id="stependbutton" src="icons/video_end.png" style="border-width:px;padding:10px;" onclick="oVP.StepEnd();" title="Go to end" />';
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
    console.log(framevalue);
    this.GoToFrame(parseInt(framevalue));
  }
  this.GenerateFrames = function() {
    var shift = oVideoData.firstframe;
    for(var i = 0; i < oVideoData.data.video.length; i++) {
      var oImage = '<img src="' + oVideoData.data.video[i] + '" id="myframe" style="display:block;position:absolute;padding:0;border-width:0;width:' + this.imageWidth + 'px;height:' + this.imageHeight + 'px;" />';
      aFrameImages[i+shift] = oImage;
    }

  }
  
  this.DisplayFrame = function(i) {
    // Show frame:
    $('#framenum').html(i);

    if (aFrameImages[i] == null){
      this.Pause();
      ovP.loadChunk(i, 2, false, false);
      return;
    }
    if($('#myframe').length) {
      $('#myframe').replaceWith(aFrameImages[i]);
    }
    else {
      $('#oCanvas').append(aFrameImages[i]);
      console.log(aFrameImages[i]);
      console.log(i);
    }

    // Plot polygons:
    var name = "foo";
    for(var objndx = 0; objndx < this.X.length; objndx++) {
      if(this.display_polygon[objndx]) {

	var X = Array();
	var Y = Array();
	var allPoints = LM_xml.getElementsByTagName('object')[objndx].getElementsByTagName('polygon')[i].getElementsByTagName('pt');
	for(var j = 0; j < allPoints.length; j++) {
	  X[j] = parseInt(allPoints[j].getElementsByTagName('x')[0].innerHTML);
	  Y[j] = parseInt(allPoints[j].getElementsByTagName('y')[0].innerHTML);
	}



    	var attr = 'fill="none" stroke="' + HashObjectColor(name) + '" stroke-width="4"';
    	var scale = 1;
    	if((objndx<this.poly_id.length) && this.poly_id[objndx]) $('#'+this.poly_id[objndx]).remove();
    	this.poly_id[objndx] = DrawPolygon('canvas',X,Y,name,attr,scale);
    	// this.poly_id[objndx] = DrawPolygon('canvas',this.X[objndx][i],this.Y[objndx][i],name,attr,scale);
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
    if (buttonClicked) uPaused = false;
    if (aFrameImages[iFrameCtr] == null) return;
    if (bPlaying) {
      if (bPaused) bPaused = false;
      
      // Replace with pause button:
      $('#playpausebutton').attr('src','icons/video_pause.png');
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
      
      // $('#myframe').replaceWith(aFrameImages[iFrameCtr]);
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
    $('#playpausebutton').attr('src','icons/video_play.png');
    $('#playpausebutton').attr('title','Play');
    $('#playpausebutton').attr('onclick','oVP.Play();');
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
      // $('#myframe').replaceWith(aFrameImages[iFrameCtr]);
      this.DisplayFrame(iFrameCtr);
      this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
    }
  }
  
  // Step backward one frame:
  this.StepBackward = function() {
    if(!bPaused) this.Pause();
    else {
      iFrameCtr--;
      if (iFrameCtr < 0) {
	iFrameCtr = 0;
      }
      
      // Render next frame:
      // $('#myframe').replaceWith(aFrameImages[iFrameCtr]);
      this.DisplayFrame(iFrameCtr);
      this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
    }
  }

  // Go to beginning of video:
  this.StepBeginning = function() {
    this.Pause();
    iFrameCtr = 0;
    
    // Render next frame:
    // $('#myframe').replaceWith(aFrameImages[iFrameCtr]);
    this.DisplayFrame(iFrameCtr);
    this.UpdateScrollbar(iFrameCtr/oVideoData.frames);
  }

  // Go to end of video:
  this.StepEnd = function() {
    this.Pause();
    iFrameCtr = oVideoData.frames-1;
    
    // Render next frame:
    // $('#myframe').replaceWith(aFrameImages[iFrameCtr]);
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
           url: "./encode.php",
           data: {width: "640", height: "480", rate:"15", input: fname_folder,frame: frame.toString(), duration: duration},
           success: function(response){
            last_frame = Math.min(frame + duration*15, ovP.getnumFrames());
            ovP.loadFile(frame, first_time, isbackground, response)
            if (ovP.getnumFrames() != 0 && ovP.getcurrentFrame() <= last_frame) ovP.UpdateLoadbar(last_frame/ovP.getnumFrames());

          }
    });
  }
}


$(document).ready(function() {
  console.time('Load LabelMe XML file');
	oVP = new JSVideo();
	console.time('Load video');
  oVP.loadChunk(1, 1, true, false);
});
