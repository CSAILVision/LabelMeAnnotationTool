



// thickness of the line drawn/computed when doing masks.
var LINE_WIDTH_DEFAULT = 1;

// Opacity (alpha channel) of the drawn scribbles, to see the image or the mask under.
var SCRIBBLE_OPACITY_DEFAULT = 0.2;

// Opacity (alpha channel) of the drawn masks, to see the image under
var MASK_OPACITY_DEFAULT = 0.1;

// "true" to apply the gaussian blur to have a better mask approximation, set to "false" otherwise.
var GAUSSIAN_BLUR_DEFAULT_SEL = "true";

var OBJECT_DRAWING = 1;
var BG_DRAWING = 2;
var RUBBER_DRAWING = 3;
var resp;

// Indicates whether we are in segmentation or polygon mode
drawing_mode = 0;


// Switch between polygon and scribble mode. If a polygon is open or the user 
// is in the middle of the segmentation an alert appears to indicate so.
function SetDrawingMode(mode){
    if (drawing_mode == mode || active_canvas == QUERY_CANVAS) return;
    if (mode == 0){
        if (scribble_canvas.annotationid != -1){
            alert("You can't change drawing mode while editting scribbles.");
            return;
        }

        document.getElementById("segmDiv").setAttribute('style', 'border-color: #000');
        document.getElementById("polygonDiv").setAttribute('style', 'border-color: #f00');
        document.getElementById("segmDiv").setAttribute('style', 'background: none;');
        document.getElementById("polygonDiv").setAttribute('style', 'background: silver');
        scribble_canvas.scribble_image = "";
        scribble_canvas.cleanscribbles();
        scribble_canvas.CloseCanvas();
    }
    if (mode == 1) {
        if(draw_anno) {
            alert("Need to close current polygon first.");
            return;
        }

        document.getElementById("segmDiv").setAttribute('style', 'border-color: #f00');
        document.getElementById("polygonDiv").setAttribute('style', 'border-color: #000');
        document.getElementById("segmDiv").setAttribute('style', 'background: silver');
        document.getElementById("polygonDiv").setAttribute('style', 'background: none');
        scribble_canvas.startSegmentationMode();
    }
    drawing_mode = mode;
}


// Initialize the segmentation tool. This function is called when the field 
// scribble of the url is true
function InitializeScribbleMode(tag_button, tag_canvas){
  scribble_canvas = new scribble_canvas(tag_canvas);
  var html_str = '<div id= "polygonDiv" class="annotatemenu">Polygon<br />Tool \
             <button id="polygon" class="labelBtnDraw" type="button" title="Start Polygon" onclick="SetDrawingMode(0)" > \
                 <img id="polygonModeImg" src="Icons/polygon.png"  width="28" height="38" /> \
             </button> \
             <button id="erase" class="labelBtnDraw" type="button" title="Delete last segment" onclick="main_handler.EraseSegment()" > \
              <img src="Icons/erase.png"  width="28" height="38" /> \
              </button> \
          </div>';

  html_str += '<div id= "segmDiv" class="annotatemenu">Mask<br></br>Tool \
             <button id="ScribbleObj" class="labelBtnDraw" type="button" title="Use the red pencil to mark areas inside the object you want to segment" onclick="scribble_canvas.setCurrentDraw(OBJECT_DRAWING)" > \
                <img src="Icons/object.png" width="28" height="38" /></button> \
             <button id="ScribbleBg" class="labelBtnDraw" type="button" title="Use the blue pencil to mark areas outside the object" onclick="scribble_canvas.setCurrentDraw(BG_DRAWING)" > \
                <img src="Icons/background.png" width="28" height="38" /></button> \
             <button id="ScribbleRubber" class="labelBtnDraw" type="button" title="ScribbleRubber" onclick="scribble_canvas.setCurrentDraw(RUBBER_DRAWING)" > \
                <img src="Icons/erase.png" width="28" height="38" /> \
            </button>\
			Pixels:<input type="number" class="segbut" id="pixelbtn" name="pixelbtn" min="1" max="25" value="' + LINE_WIDTH_DEFAULT + '" style="height: 10px;" onchange="pixelChanged()" \
				title="Change the width of scribble lines. Set to only 1 pixel for precision"/>\
			Opacity:<input type="number" class="segbut" id="opacitybtn" name="opacitybtn" min="0" max="100" value="' + (SCRIBBLE_OPACITY_DEFAULT * 100) + '" style="height: 10px;" onchange="opacityChanged()" \
				title="Change the opacity of the scribble, to see the mask correctly after pressing Process for example"/>\
			<input type="button" class="segbut" id="segmentbtn" value="Process" title="Press this button to see the segmentation results." style="height: 18px;" onclick="scribble_canvas.segmentImage(0)"/>\
			<input type="button" class="segbut"  id="donebtn" value="Done" title="Press this button after you are done with the scribbling." style="height: 18px;" onclick="scribble_canvas.segmentImage(1)"/> \
            <p> </p><div id="loadspinner" style="display: none;"><img src="Icons/segment_loader.gif"/> </div></div>';

  $('#'+tag_button).append(html_str);    

  var html_str2 = '<button xmlns="http://www.w3.org/1999/xhtml" id="img_url" class="labelBtn" type="button" title="Download Pack" onclick="javascript:GetPackFile();"> \
        <img src="Icons/download_all.png" height="30" /> \
      </button>';

  var html_str3 = '<form action="annotationTools/php/getpackfile.php" method="post" id="packform"> \
        <input type="hidden" id= "folder" name="folder" value="provesfinal" /> \
        <input type="hidden" id= "name" name="name" value="img2.jpg" /> \
       </form>';

  $('#tool_buttons').append(html_str3);
  $('#help').before(html_str2); 
  document.getElementById("segmDiv").setAttribute('style', 'opacity: 1');
  document.getElementById("polygonDiv").setAttribute('style', 'opacity: 1');
  document.getElementById("segmDiv").setAttribute('style', 'border-color: #000');
  document.getElementById("polygonDiv").setAttribute('style', 'border-color: #f00');
}

// Callback of the scribble opacity spinbox
function opacityChanged(){

	scribble_canvas.alpha = document.getElementById("opacitybtn").value/100;
	scribble_canvas.UpdateSize( true );
	scribble_canvas.redraw();
    
}

// Callback of the stroke pixel size spinbox
function pixelChanged(){

	scribble_canvas.lineWidth = document.getElementById("pixelbtn").value;
	scribble_canvas.UpdateSize( true );
	scribble_canvas.redraw();
    
}

// class managing the canvas where we draw scribbles (and the cursor over it)
function scribble_canvas(tag) {
  this.tagcanvasDiv = tag; 
  this.colorseg = Math.floor(Math.random()*14);
  this.cache_random_number = Math.random();

  this.segmentation_in_progress = 0;
  this.currently_drawing = OBJECT_DRAWING;
  this.flag_changed = 0;
  this.maxclicX = -1;
  this.minclicX = -1;
  this.maxclicY = -1;
  this.minclicY = -1;
  this.clickX = new Array();
  this.clickY = new Array();
  this.clickDrag = new Array();
  this.clickColor = new Array();
    this.clickWidth = new Array();
    this.hoverX = -1;
    this.hoverY = -1;
  this.paint = false;

  this.editborderlx = -1;
  this.editborderrx = -1;
  this.editborderly = -1;
  this.editborderry = -1;
  this.scribble_image = "";
  this.annotationid = -1;

  this.object_corners = new Array();

  this.scribblecanvas;
  
	this.alpha = SCRIBBLE_OPACITY_DEFAULT;
	this.maskAlpha = MASK_OPACITY_DEFAULT;
	this.blur = GAUSSIAN_BLUR_DEFAULT_SEL;
	this.lineWidth = 1;

  // These two functions are called to show and hide the spinner wheel 
  // when the segmentation is in progress
  this.showspinner = function (){
    document.getElementById('segmentbtn').disabled = true;
    document.getElementById('donebtn').disabled = true;
    $('#loadspinner').show();
  }

  this.hidespinner = function (){
    document.getElementById('donebtn').disabled = false;
    document.getElementById('segmentbtn').disabled = false;
    $('#loadspinner').hide();
  }

  // Clean the scribbles from the canvas.
  this.cleanscribbles = function (){
    this.clickX = new Array();
    this.clickY = new Array();
    this.clickDrag = new Array();
    this.clickColor = new Array();
        this.clickWidth = new Array();
    paint = false;
    ClearMask('aux_mask');
    this.redraw();
  };

  // This function is called once we set the scribble mode. It prepares the canvas where the scribbles
  // will be drawn and initializes the necessary data structures.
  this.startSegmentationMode = function(){
      this.clickX = new Array();
      this.clickY = new Array();
      this.clickDrag = new Array();
      this.clickColor = new Array();
        this.clickWidth = new Array();
      paint = false;
      resp = "";
      this.prepareHTMLtoDraw();    
  };

  // Close the canvas where the scribbles will be drawn.
  this.CloseCanvas = function()  {
      var p = document.getElementById('canvasDiv');
      p.parentNode.removeChild(p);
  };

	// Returns the color that should be applied according to the type of drawing used
	// (red/blue/rubber), if it's for the webpage or the scribble output, and if it's a cursor or not.
	this.GetColorFromType = function (color, drawForUI, drawForCursor) {
		
		var alpha = this.alpha;
		if( drawForCursor == true ) {
			alpha = 1.0;
		}
		if (color == OBJECT_DRAWING) {
			if (drawForUI == true) {
				return "rgba(255,0,0," + alpha + ")";
			} else {
				return "rgba(255,0,0,1)";//100% opacity			   
			}
		} else if (color == BG_DRAWING) {
			if (drawForUI == true) {
				return "rgba(0,0,255," + alpha + ")";//40% opacity
			} else {
				return "rgba(0,0,255,1)";//100% opacity			   
			}
		} else if (color == RUBBER_DRAWING) {
			if (drawForCursor == true) {
				return "rgba(255,255,255," + alpha + ")";	 
			} else {  
				return "rgba(0,0,0,1)";
			}
		}
		return "#000000";
	}

    // Used by redraw() and redraw2()
    this.drawScribbles = function (scale, drawForUI) {
		// Initialize canvas and context
    var context = this.scribblecanvas.getContext("2d");
		
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;

		// Clear for the image (we don't need it for the UI, it only slows everything down)
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
        if (drawForUI != true && this.annotationid > -1) {
          scribble_canvas.scribblecanvas.getContext("2d").globalCompositeOperation = "source-over";
            scribble_canvas.scribblecanvas.getContext("2d").drawImage(scribble_canvas.scribble_image, 0, 0, main_media.width_orig, main_media.height_orig);
    }

		if( this.clickX.length > 0 )
		{
			// We want to scrbble over pixels only.
			context.lineJoin = "bevel";
			context.lineCap = "square";		
		
			lastColor = -1;
			lastWidth = -1;
			context.beginPath();
			
			// Actually draw scribbles
    for(var i=0; i < this.clickX.length; i++) {        

				var color = this.clickColor[i];
				var lineWidth = this.clickWidth[i];
				if( (lastColor != color) || (lastWidth != lineWidth) ) {
					//Set a different path for every color (or lineWidth), but not every point!
					//That way it's much faster, but we still need to change path when something changes (color/width)
					this.closePath( context );
					
					context.lineWidth = lineWidth;
					context.strokeStyle = this.GetColorFromType( color, drawForUI, false );

					if (color == RUBBER_DRAWING) {
						context.globalCompositeOperation = "destination-out";	
					} else {				
						context.globalCompositeOperation = "source-over";
					}
					
      context.beginPath();
				}
				if (this.clickDrag[i] && i) {
					this.drawLine(context, this.clickX[i - 1], this.clickY[i - 1],
						this.clickX[i], this.clickY[i], color, lineWidth, drawForUI);

      }
      else{
					this.drawLine(context, this.clickX[i], this.clickY[i],
						this.clickX[i], this.clickY[i], color, lineWidth, drawForUI);
				}
				lastColor = color;
				lastWidth = lineWidth;
			}
			this.closePath( context );
		}

        if (drawForUI == true) {
			this.drawCursor( context, scale );
       }
    };
	
	this.closePath = function( context ) {
		context.moveTo(-1,-1);// This is to "close" the path ... otherwise a single click will only show a tiny line, not a "dot".
		context.closePath();
		context.stroke();
       } 
	
    // Draw the cursor, or where the path will be drawn if the user clicks there.
	this.drawCursor = function( context, scale ) {
		
		context.lineJoin = "bevel";
		context.lineCap = "square";		
		context.beginPath();
		
        context.globalCompositeOperation =  "source-over";
		
		
		// Thank you Jonas for 0.5 : http://stackoverflow.com/questions/9311428/draw-single-pixel-line-in-html5-canvas
		var x = this.hoverX - this.lineWidth/2;
		var y = this.hoverY - this.lineWidth/2
		if( ((this.lineWidth) % 2) ) {//}&& !(x == x2 && y == y2) ) {
			x = x + 0.5;
			y = y + 0.5;		
       } 
		context.fillStyle = "rgba(0,0,0," + this.alpha + ")";//50% alpha black
		if( this.lineWidth < 5 )
		{
			//*1 for integer, not "2" + 20 = 220, for example ...
			context.rect( x-10, y, this.lineWidth*1+20, this.lineWidth );
			context.fill();
			context.closePath();
			context.beginPath();
			context.rect( x, y-10, this.lineWidth, this.lineWidth*1+20 );
			context.fill();
			context.closePath();
			context.beginPath();
      }
		context.fillStyle = this.GetColorFromType( this.currently_drawing, true, true );
		context.rect( x, y, this.lineWidth, this.lineWidth );
		context.fill();
						
      context.closePath();
	}

    // Used by drawScribbles() to draw a simple line
    this.drawLine = function (context, x, y, x2, y2, color, lineWidth, drawForUI) {
		if( !( x == x2 || y == y2) ) {
			// we only want vertical or horizontal lines
			this.drawLine( context, x, y, x, y2, color, lineWidth, drawForUI );
			this.drawLine( context, x, y2, x2, y2, color, lineWidth, drawForUI );
			return;
    }
		// Thank you Jonas for 0.5 : http://stackoverflow.com/questions/9311428/draw-single-pixel-line-in-html5-canvas	
		if( lineWidth % 2 ) {// || (x == x2 && y == y2) ) {
			context.moveTo(x+0.5-0.01, y+0.5);
			context.lineTo(x2+0.5+0.01, y2+0.5);		
		} else{
			context.moveTo(x-0.01, y);
			context.lineTo(x2, y2);						
		}
    };

    // Draws the scribbles in the canvas according to the zoom parameter
    // The function loops over clickX, clickY to know the coordinates of the scribbles.
    this.redraw = function () {
        this.drawScribbles(main_image.GetImRatio(), true);
  };

  // similar to redraw() but to set the scribbles to the same size than 
  // the original image (not according to the zoom) this function is only 
  // called when creating the segmentation to create save an image with 
  // the scribbles 
    this.redraw2 = function() {
        this.drawScribbles(1, false);
    }
	
	this.UpdateSize = function(drawForUI) {
		
		this.scribblecanvas.setAttribute('width', main_image.width_orig);
		this.scribblecanvas.setAttribute('height', main_image.height_orig);
		
		// DON'T change the canvas size! only how it's shown! (css). So instead of changing canvas width/height, change 'style' attribute
		// Also, setting scribblecanvas.style.width doesn't seem to work, we need oto set the whole string.
		this.scribblecanvas.setAttribute('style', 'width:' + main_image.width_curr + 'px;height:' + main_image.height_curr + 'px;');
		
		// We need to set this everytime, since setting the style overrides it.
		this.scribblecanvas.style.cursor = 'none'
       } 
	this.ClearCanvas = function( drawForUI ) {
    }
  // Saves the resized scribbles into the server to create the segmentation
  this.saveImage = function(url, imname, dir, async, segment_ratio, fw, fh, annotation_ended) {
    var canvasData = url;
  
   $.ajax({
    async: async,
    type: "POST",
    url: "annotationTools/php/saveimage.php",
    data: { 
     image: canvasData,
     name: imname,
     uploadDir: dir,
    }
    }).done(function(o) {
        var Nobj = $(LM_xml).children("annotation").children("object").length;
        if (scribble_canvas.annotationid > -1) Nobj = scribble_canvas.annotationid;
        
      // Save the scribble for segmenting (this is done synchronously 
      // because we need to wait for the image to be saved in order 
      // to segment).
      var imagname = main_media.GetFileInfo().GetImName();
        imagname = imagname.substr(0, imagname.length-4);

      var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");
        console.log(collectionName);
        scribble_canvas.createDir("annotationCache/TmpAnnotations/"+collectionName);
			scribble_canvas.resizeandsaveImage(collectionName + "/" + imagname + '_scribble_' + Nobj + '.png', 'scribble.png', collectionName + "/", segment_ratio, fw, fh, -1, 0, annotation_ended, "false");
    });
  };

  // General function to synchronously create a directory from a given url
  this.createDir = function(url){
    $.ajax({
    async: false,
    type: "POST",
    url: "annotationTools/php/createdir.php",
    data: { 
     urlData: url
    }
    }).done(function(o) {
      console.log(url);
    });
  };


 // ********************************************
  // THESE FUNCTIONS ARE COPIES OF ALREADY IMPLEMENTED FUNCTIONS BUT 
  // ADAPTED TO SEGMENTATIONS. I REWROTE THEM HERE TO AVOID MIXING CODE 
  // BUT SHOULD BE REFACTORED WITH THE REST
 // ********************************************
  this.DrawToQuery = function () {
        if((object_choices!='...') && (object_choices.length==1)) {
            main_handler.SubmitQuery();
            StopDrawEvent();
            return;
        }
        active_canvas = QUERY_CANVAS;

  // Move draw canvas to the back:
  document.getElementById('draw_canvas').style.zIndex = -2;
  document.getElementById('draw_canvas_div').style.zIndex = -2;

  // Remove polygon from draw canvas:
  var anno = null;
  if(draw_anno) {
    draw_anno.DeletePolygon();
    anno = draw_anno;
    draw_anno = null;
  }

  // Move query canvas to front:
  document.getElementById('query_canvas').style.zIndex = 0;
  document.getElementById('query_canvas_div').style.zIndex = 0;

  // Set object list choices for points and lines:
  var doReset = SetObjectChoicesPointLine(anno.GetPtsX().length);

  // Get location where popup bubble will appear:
    var im_ratio = main_media.GetImRatio();
    var pt = main_media.SlideWindow((anno.GetPtsX()[0]*im_ratio + anno.GetPtsX()[1]*im_ratio)/2,(anno.GetPtsY()[0]*im_ratio + anno.GetPtsY()[2]*im_ratio)/2);

  // Make query popup appear.
    main_media.ScrollbarsOff();
  WriteLogMsg('*What_is_this_object_query');
  
  wait_for_input = 1;
  var innerHTML = this.GetPopupFormDraw();

  CreatePopupBubble(pt[0],pt[1],innerHTML,'main_section');

  // Focus the cursor inside the box
  document.getElementById('objEnter').focus();
  document.getElementById('objEnter').select();

  // If annotation is point or line, then 
  if(doReset) object_choices = '...';

  // Render annotation:
  query_anno = anno;
  query_anno.SetDivAttach('query_canvas');
  var anno_id = query_anno.GetAnnoID();
    query_anno.DrawPolygon(main_media.GetImRatio());
  
  // Set polygon actions:
  query_anno.SetAttribute('onmousedown','StartEditEvent(' + anno_id + ',evt); return false;');
  query_anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ anno_id +'); return false;');
  query_anno.SetAttribute('oncontextmenu','return false');
  query_anno.SetCSS('cursor','pointer');
    };

this.GetPopupFormDraw = function() {
		
        html_str = GetPopupFormDrawButtons();//"<br />";
        html_str += "<b>Enter object name</b><br />";
        html_str += this.HTMLobjectBox("mask");
  
  if(use_attributes) {
    html_str += "<b>Enter attributes</b><br />";
    html_str += HTMLattributesBox("");
            html_str += HTMLoccludedBox("");
  }
  
  if(use_parts) {
    html_str += HTMLpartsBox("");
  }
  
        html_str += GetPopupFormDrawButtons();//"<br />";

        return html_str;
    }

	function GetPopupFormDrawButtons() {
	  
		html_str = "<div style='text-align: center;'>";
  
  // Done button:
  html_str += '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';
  
  // Undo close button:
  html_str += '<input type="button" value="Edit Scribble" title="Press this button if to keep adding scribbles." onclick="KeepEditingScribbles();" tabindex="0" />';
  
  // Delete button:
  html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="scribble_canvas.WhatIsThisObjectDeleteButton();" tabindex="0" />';
  
		html_str += "</div>";
  return html_str;
}

this.WhatIsThisObjectDeleteButton = function (){
  submission_edited = 0;
  main_handler.QueryToRest();
  this.cleanscribbles();
  ClearMask('aux_mask');
}

this.HTMLobjectBox = function(obj_name) {
  var html_str="";
  
        html_str += '<input name="objEnter" id="objEnter" type="text" style="width:345px;" tabindex="0" value="' + obj_name + '" title="Enter the object\'s name here. Avoid application specific names, codes, long descriptions. Use a name you think other people would agree in using. "';
  
  html_str += ' onkeyup="var c;if(event.keyCode)c=event.keyCode;if(event.which)c=event.which;if(c==13)';
        
  // if obj_name is empty it means that the box is being created
  if (obj_name=='') {
    // If press enter, then submit; if press ESC, then delete:
    html_str += 'main_handler.SubmitQuery();if(c==27)scribble_canvas.WhatIsThisObjectDeleteButton();" ';
  }
  else {
    // If press enter, then submit:
    html_str += 'this.SubmitEditLabel();" ';
  }
  
  // if there is a list of objects, we need to habilitate the list
  if(object_choices=='...') {
    html_str += '/>'; // close <input
  }
  else {
    html_str += 'list="datalist1" />'; // insert list and close <input
    html_str += '<datalist id="datalist1"><select style="display:none">';
    for(var i = 0; i < object_choices.length; i++) {
      html_str += '<option value="' + object_choices[i] + '">' + object_choices[i] + '</option>';
    }
    html_str += '</select></datalist>';
  }
  
  html_str += '<br />';
  
  return html_str;
}

  // Called after the segmentation is done. It prepares an annotation 
  // object describing the new segmentation and shows up a bubble to 
  // introduce the name of the object.  If the user was editing a 
  // segmentation we update the xml with the new coordinates of the 
  // bounding box.
  this.preparetoSubmit = function(){
    if (this.annotationid == -1){ // The segmentation was new
      var anno = new annotation(AllAnnotations.length);
      var Nobj = $(LM_xml).children("annotation").children("object").length;
      var imagname = main_media.GetFileInfo().GetImName();
      imagname = imagname.substr(0, imagname.length-4);
      anno.SetRandomCache(this.cache_random_number);
      anno.SetType(1);
      anno.SetImageCorners(Math.max(0, this.minclicX-(this.maxclicX - this.minclicX)*0.25), 
                          Math.max(0, this.minclicY - (this.maxclicY - this.minclicY)*0.25),
			   Math.min(main_media.width_orig, this.maxclicX+(this.maxclicX - this.minclicX)*0.25), 
			   Math.min(main_media.height_orig, this.maxclicY+(this.maxclicY - this.minclicY)*0.25));
      anno.SetCorners(object_corners[0], object_corners[1], object_corners[2], object_corners[3]);
      anno.SetImName(resp);
      anno.SetScribbleName(imagname+'_scribble_'+Nobj+'.png');

      // Draw polygon on draw canvas:
      draw_anno = anno;
      draw_anno.SetDivAttach('draw_canvas');
      draw_anno.DrawPolygon(main_media.GetImRatio());
      
      // Set polygon actions:
      draw_anno.SetAttribute('onmousedown','StartEditEvent(' + draw_anno.GetAnnoID() + ',evt); return false;');
      draw_anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ draw_anno.GetAnnoID() +'); return false;');
      draw_anno.SetAttribute('oncontextmenu','return false');
      draw_anno.SetCSS('cursor','pointer');

      this.DrawToQuery();
    }
    else { // We were editting a segmentation
       var anno = AllAnnotations[this.annotationid];
       var idx = scribble_canvas.annotationid;

       if (scribble_canvas.clickX.length > 0){
       var lx = Math.max(0, scribble_canvas.minclicX-(scribble_canvas.maxclicX - scribble_canvas.minclicX)*0.25);
       var ly = Math.max(0, scribble_canvas.minclicY -  (scribble_canvas.maxclicY - scribble_canvas.minclicY)*0.25);
	var rx = Math.min(main_media.width_orig, scribble_canvas.maxclicX+(scribble_canvas.maxclicX - scribble_canvas.minclicX)*0.25);
	var ry = Math.min(main_media.height_orig, scribble_canvas.maxclicY+(scribble_canvas.maxclicY - scribble_canvas.minclicY)*0.25);
       anno.SetImageCorners(Math.min(lx, scribble_canvas.editborderlx), 
                          Math.min(ly, scribble_canvas.editborderly),
                          Math.max(rx, scribble_canvas.editborderrx), 
                          Math.max(ry, scribble_canvas.editborderry));
       anno.SetCorners(object_corners[0], object_corners[1], object_corners[2], object_corners[3]);
       anno.SetRandomCache(scribble_canvas.cache_random_number);
       AllAnnotations[scribble_canvas.annotationid] = anno;

       scribble_canvas.UpdateMaskXML(idx, anno);
       }
       main_canvas.AttachAnnotation(anno);
       
       scribble_canvas.annotationid = -1;
       scribble_canvas.cleanscribbles();
       active_canvas = REST_CANVAS;
       
       main_handler.AnnotationLinkClick(idx);
    }
    resp = "";
  }

  // Updates the XML with the object 'idx' according to the edited 
  // segmentation.  It updates the boundaries of the polygon enclosing 
  // the segmentation and the boundaries of the image containing the 
  // segmentation.  
  this.UpdateMaskXML = function (idx, annot){
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("xmin").text(annot.GetCornerLX());
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("ymin").text(annot.GetCornerLY());
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("xmax").text(annot.GetCornerRX());
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("ymax").text(annot.GetCornerRY());
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("xmin").text(annot.GetPtsX()[0]);
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("ymin").text(annot.GetPtsY()[0]);
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("xmax").text(annot.GetPtsX()[1]);
     $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("ymax").text(annot.GetPtsY()[2]);

      WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
  }

  // Creates the segmentation in different steps according to the 
  // callback value. The function is done this way to allow asynchronous 
  // behavior.
  // 1. the function saves the scribbles that the user has introduced to 
  // segment an image.
  // 2. it saves a portion of the original image, according to the region 
  // where the scribbles where drawn
  // 3. Creates the Masks directory and through an http requests calls a 
  // cgi that will perform the segmentation through GraphCuts. It saves 
  // the resulting mask in the new folder
  // 4. The final mask is drawn over the canvas, and the spinner that 
  // indicated the segmentation process is turned off.

    this.resizeandsaveImage = function (urlSource, namedest, urlDest, scale, fwidth, fheight, dir, callback, annotation_ended, blur) {

    var poslx = Math.max(0, this.minclicX-(this.maxclicX - this.minclicX)*0.25);
    var posly = Math.max(0, this.minclicY - (this.maxclicY - this.minclicY)*0.25);
    if (this.annotationid > -1){
      poslx = Math.min(poslx, this.editborderlx);
      posly = Math.min(posly, this.editborderly); 
    }

    $.ajax({
    async: true,
    cache: false,
    type: "POST",
    url: "annotationTools/php/resizeandsaveimage.php",
    data: { 
     urlSource: urlSource,
     namedest: namedest,
     urlDest: urlDest,
     scale: scale,
     posx: poslx,
     posy: posly,
     fwidth: fwidth,
     fheight: fheight,
     dir: dir,
                bwidth: main_media.width_orig,
                bheight: main_media.height_orig,
				blur: blur,

    }
    }).done(function(data_response) {
      var imagetoSegmentURL = main_media.GetFileInfo().GetFullName();
        imagetoSegmentURL = imagetoSegmentURL.replace("///","/");
        var Nobj = $(LM_xml).children("annotation").children("object").length;
        if (scribble_canvas.annotationid > -1) Nobj = scribble_canvas.annotationid;
        if (callback == 0){
	var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");
				scribble_canvas.resizeandsaveImage(imagetoSegmentURL, 'image.jpg', collectionName + "/", scale, fwidth, fheight, 0, 1, annotation_ended, scribble_canvas.blur);
        }
        else if (callback == 1){
          console.log(data_response);
	var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");
          scribble_canvas.createDir("Masks/"+collectionName+"/");

          // Execute the cgi to perform the segmentation
          var url = 'annotationTools/scribble/segment.cgi';

          var req_submit;
          if (window.XMLHttpRequest) {
            path = data_response;
	  tmpPath = path+main_media.GetFileInfo().GetDirName().replace("///","/");

            req_submit = new XMLHttpRequest();
            req_submit.open("POST", url, false);
            
            req_submit.send(imagetoSegmentURL+"&"+Nobj+"&"+scribble_canvas.colorseg+"&"+tmpPath);
            var cadena = req_submit.responseText.split('&');
            resp = cadena[0];

                    // Here we add +1 to object_corners's right, because of how the lines are stored (if there's a one pixel line,
                    // the min and max are the same, but max should be one more than min.).
            object_corners = new Array();
            object_corners.push(poslx + (cadena[1]/scale)); 
            object_corners.push(posly + (cadena[2]/scale)); 
                    object_corners.push(poslx + (cadena[3] / scale) + 1);
                    object_corners.push(posly + (cadena[4] / scale) + 1);
          
	  // Save the segmentation result in the Masks folder:
            console.log(collectionName);
					scribble_canvas.resizeandsaveImage(collectionName + "/", resp, collectionName + "/", 1. / scale, main_media.width_orig, main_media.height_orig, 1, 2, annotation_ended, "false");


          }
        }
        else if (callback == 2){
          scribble_canvas.drawMask(1);
          scribble_canvas.hidespinner();
          scribble_canvas.segmentation_in_progress = 0;
          scribble_canvas.flag_changed = 0;
          if (annotation_ended){
            scribble_canvas.preparetoSubmit();
          }
        }
    });
  }

  // Draw the segmentation mask into the canvas, clearing previous masks from the canvas if there were any
  this.drawMask = function(modified){
    var loc = window.location.href;
    var   dir = loc.substring(0, loc.lastIndexOf('/tool.html'));
    ClearMask('aux_mask')
    if (resp){
      this.cache_random_number = Math.random();
      var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");

      DrawSegmentation('myCanvas_bg','Masks/'+collectionName+"/"+resp, main_media.width_curr, main_media.height_curr, this.cache_random_number, 'aux_mask');
    } 
  };

  // This function is called when the user clicks the segment or done 
  // button. It creates the segmentation and prepares a query if the 
  // user has hit done.  If the scribbles have not changed since the 
  // last time the user segmented the image it will avoid calculating 
  // the new mask.
  this.segmentImage = function(annotation_ended){
      if (drawing_mode == 0){
        SetDrawingMode(1);
        if(draw_anno) return;
      }
      if (this.clickX.length == 0 && this.annotationid == -1){
        alert("Can not segment: you need to scribble on the image first");
        return;
      }
      if (this.flag_changed == 1){
        this.showspinner();
        this.segmentation_in_progress = 1;
        
			// Set "zoom" to original size to redraw the scribbles in the image (UpdateSize(false))
			// and set back to current zoom for UI after (UpdateSize(true))
			this.UpdateSize(false);
            this.redraw2();
            this.segmentAfterScribblesDone(annotation_ended);
			this.UpdateSize(true);
        
            this.redraw();

      }
      else if (annotation_ended){ // if the last segmentation has not ended
        this.preparetoSubmit();
      }
  };

  // Crops an image surrounding the scribbles drawn by the user and 
  // saves a resized version of the original image and the scribbles to 
  // compute the segmentation mask. The resizing is done accordingly to 
  // the size of the scribbles to avoid having to segment big images 
  // when the user annotates big objects.
  this.segmentAfterScribblesDone = function (annotation_ended){
    var clx = Math.max(0, this.minclicX-(this.maxclicX - this.minclicX)*0.25);
    var crx = Math.min(main_media.width_orig, this.maxclicX+(this.maxclicX - this.minclicX)*0.25);
    var cly = Math.max(0, this.minclicY - (this.maxclicY - this.minclicY)*0.25);
    var cry = Math.min(main_media.height_orig, this.maxclicY+(this.maxclicY - this.minclicY)*0.25);
    if (this.annotationid > -1){
      // ESTA MAL
      clx = Math.min(clx, this.editborderlx);
      crx = Math.max(crx, this.editborderrx);
      cly = Math.min(cly, this.editborderly);
      cry = Math.max(cry, this.editborderry);
    }
    var fw =  crx - clx;
    var fh =  cry - cly;
    
    var scribblesize = Math.sqrt(fw*fh);
    var segment_ratio = Math.min(500/scribblesize,1);

    var scribbledataURL = this.scribblecanvas.toDataURL("image/png"); 
    this.redraw();
    
    var Nobj = $(LM_xml).children("annotation").children("object").length;
    if (this.annotationid > -1) Nobj = this.annotationid;

    // Save the scribble in the Scribbles folder
    var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");
    this.createDir("Scribbles/"+collectionName+"/");

    var imagname = main_media.GetFileInfo().GetImName();
    imagname = imagname.substr(0, imagname.length-4);
    
    this.saveImage(scribbledataURL, imagname+'_scribble_'+Nobj+'.png', collectionName+"/", true, segment_ratio, fw, fh, annotation_ended);

  }

  // Creates the div elements to insert the scribble_canvas in the html
  this.prepareHTMLtoDraw = function(){  
      html_str = '<div id="canvasDiv" ';
      html_str+='style="position:absolute;left:0px;top:0px;z-index:1;width:100%;height:100%;background-color:rgba(128,64,0,0);">';
      html_str+='</div>';
      $('#'+this.tagcanvasDiv).append(html_str);
      $(document).ready(function() {scribble_canvas.prepareDrawingCanvas();});
  };
  
  // Creates the canvas where the scribbles will be drawn.  
  this.prepareDrawingCanvas = function(){
      this.canvasDiv = document.getElementById('canvasDiv'); 
      this.scribblecanvas = document.createElement('canvas');
		
      this.scribblecanvas.setAttribute('id', 'scribble_canvas');
      this.canvasDiv.appendChild(this.scribblecanvas);
      if(typeof G_vmlCanvasManager != 'undefined') {
          this.scribblecanvas = G_vmlCanvasManager.initElement(this.scribblecanvas);
      }
		
		this.UpdateSize( true );
		
      $('#scribble_canvas').mousedown(function(e){
        if (e.button > 1) return;
	// If we are hiding all polygons, then clear the main canvas:
	if(IsHidingAllPolygons) {
	  for(var i = 0; i < main_canvas.annotations.length; i++) {
	    main_canvas.annotations[i].hidden = true;
	    main_canvas.annotations[i].DeletePolygon();
	  }
	}

        var mouseX = GetEventPosX(e.originalEvent);
        var mouseY = GetEventPosY(e.originalEvent);      
        this.paint = true;
        scribble_canvas.addClick(mouseX, mouseY);
        scribble_canvas.redraw();
      });

      $('#scribble_canvas').mouseout(function(e){
        this.paint = false;
      });

      $('#scribble_canvas').mousemove(function(e){
        if(this.paint){
          scribble_canvas.addClick(GetEventPosX(e.originalEvent) , GetEventPosY(e.originalEvent) , true);
            }
            scribble_canvas.setHover(GetEventPosX(e.originalEvent), GetEventPosY(e.originalEvent));
          scribble_canvas.redraw();

      });
    
      $('#scribble_canvas').mouseup(function(e){
        this.paint = false;
      });
  };

  // Called each periodically while dragging the mouse over the screen. 
  // Saves the coordinates of the clicks introduced by the user.
  this.addClick = function(x, y, dragging){
    this.flag_changed = 1;
    var ratio = main_media.GetImRatio();  
    x-=1; 
    x = Math.round(x/ratio);
    y = Math.round(y/ratio);
    if (this.clickX.length == 0){
      this.maxclicX = this.minclicX = x;
      this.maxclicY = this.minclicY = y;
    }
    else {      
      this.maxclicY = Math.max(this.maxclicY, y); this.maxclicX = Math.max(this.maxclicX, x); 
      this.minclicY = Math.min(this.minclicY, y); this.minclicX = Math.min(this.minclicX, x);
    }
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
    this.clickColor.push(this.currently_drawing);
        this.clickWidth.push(this.lineWidth);
  };

    this.setHover = function (x, y) {
        this.flag_changed = 1;
        var ratio = main_image.GetImRatio();
        x -= 1;
        x = Math.round(x / ratio);
        y = Math.round(y / ratio);
        this.hoverX = x;
        this.hoverY = y;
    };

  // changes to foreground/backgorund/rubber
  this.setCurrentDraw = function(val){
      if (drawing_mode == 0){ 
        SetDrawingMode(1);
        if(draw_anno) return;
      }
      if (val != OBJECT_DRAWING && val != BG_DRAWING && val != RUBBER_DRAWING) return;
		this.scribblecanvas.style.cursor = 'none'
      this.currently_drawing = val;
  };
  }
  
  function KeepEditingScribbles(){
        document.getElementById('query_canvas').style.zIndex = -2;
        document.getElementById('query_canvas_div').style.zIndex = -2;
        active_canvas = REST_CANVAS;

  // Remove polygon from the query canvas:
  query_anno.DeletePolygon();
  query_anno = null;

        CloseQueryPopup();
  main_media.ScrollbarsOn();
  }

// Prepares the canvas to edit a segmentation. It loads the corresponding 
// scribbles to the canvas for the user to start editing them.
  function EditBubbleEditScribble(){
      active_canvas  = DRAW_CANVAS;
      main_handler.objEnter = document.getElementById('objEnter').value;
    // 'attributes' doesn't exist anymore ... maybe we should do something about it someday.
    //main_handler.attributes = document.getElementById('attributes').value;
    //main_handler.occluded = document.getElementById('occluded').value;

      document.getElementById('select_canvas').style.zIndex = -2;
      document.getElementById('select_canvas_div').style.zIndex = -2;
      
      // Remove polygon from the query canvas:
      select_anno.DeletePolygon();
      var anno = select_anno;
      select_anno = null;
  
      CloseEditPopup();
      this.SetDrawingMode(1);
  main_media.ScrollbarsOn();
      scribble_canvas.annotationid = anno.GetAnnoID();
      scribble_canvas.scribble_image = new Image();
  scribble_canvas.scribble_image.src = "Scribbles/"+main_media.GetFileInfo().GetDirName()+"/"+anno.GetScribbleName()+"?t="+Math.random();
      scribble_canvas.setCurrentDraw(OBJECT_DRAWING);
      scribble_canvas.editborderrx = anno.GetCornerRX(); 
      scribble_canvas.editborderlx = anno.GetCornerLX();
      scribble_canvas.editborderry = anno.GetCornerRY();
      scribble_canvas.editborderly = anno.GetCornerLY();
      scribble_canvas.scribble_image.onload = function(){
        scribble_canvas.redraw();
      }
    }

  // *************************** 
  // PLOTTING FUNCTIONS
  // ***************************

  // Same as the original LMplot but including the possibility to add
  // segmentation objects.
  function LMplot(xml,imagename) {
  // Display image:
    $('body').append('<svg id="canvas" width="2560" height="1920" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image id="img" xlink:href="' + imagename + '" x="0" y="0" height="1920" width="2560" /></svg>');

    // Display polygons:
    var N = $(xml).children("annotation").children("object").length;
    for(var i = 0; i < N; i++) {
      var obj = $(xml).children("annotation").children("object").eq(i);
      if(!parseInt(obj.children("deleted").text())) {
        // Get object name:
        var name = obj.children("name").text();

        // Get points:
        var X = Array();
        var Y = Array();
        if (obj.children("polygon") != null){
          for(var j = 0; j < obj.children("polygon").children("pt").length; j++) {
            X.push(parseInt(obj.children("polygon").children("pt").eq(j).children("x").text()));
            Y.push(parseInt(obj.children("polygon").children("pt").eq(j).children("y").text()));
          }
        }
        else {
          X.push(parseInt(obj.children("segm").children("box").children("xmin").text()));
          X.push(parseInt(obj.children("segm").children("box").children("xmax").text()));
          X.push(parseInt(obj.children("segm").children("box").children("xmax").text()));
          X.push(parseInt(obj.children("segm").children("box").children("xmin").text()));
          Y.push(parseInt(obj.children("segm").children("box").children("ymin").text()));
          Y.push(parseInt(obj.children("segm").children("box").children("ymin").text()));
          Y.push(parseInt(obj.children("segm").children("box").children("ymax").text()));
          Y.push(parseInt(obj.children("segm").children("box").children("ymax").text()));
        }
        // Draw polygon:
        var attr = 'fill="none" stroke="' + HashObjectColor(name) + '" stroke-width="4"';
        var scale = 1;
        DrawPolygon('myCanvas_bg',X,Y,name,attr,scale);
      }
    }
    
    return 'canvas';
  }

  // Plots the segmentation mask over the canvas, indicated by div_attach
  // the field 'modified' is used to reload the mask from cache when neeeded. 
  function DrawSegmentation ( div_attach, link, width, height, modified, aux){
    this.svgNS = "http://www.w3.org/2000/svg";
    this.xlinkNS = "http://www.w3.org/1999/xlink";
    var id = 'object'+$('#'+div_attach).children().length+"_mask";
    if (aux != null) id = aux;
    this.drawn_obj = document.createElementNS(this.svgNS,"image");
    this.drawn_obj.setAttributeNS(null,"id",id);
    this.drawn_obj.setAttributeNS(null,"x",0);
    this.drawn_obj.setAttributeNS(null,"y",0);
    this.drawn_obj.setAttributeNS(null,"height",height);
    this.drawn_obj.setAttributeNS(null,"width", width);
    this.drawn_obj.setAttributeNS(this.xlinkNS,'href',link+"?" + modified);
	this.drawn_obj.setAttribute('style', 'opacity:' + scribble_canvas.maskAlpha);
	
    document.getElementById(div_attach).insertBefore(this.drawn_obj,document.getElementById(div_attach).firstChild);
    return id;
  }

  // Clears the segmentation mask with id = 'id' from the canvas
  function ClearMask (id){
    var q = document.getElementById(id);
    if(q) q.parentNode.removeChild(q);
  }

  function GetPackFile(){
  document.getElementById("folder").value = main_media.GetFileInfo().GetDirName().replace("///","/");
  document.getElementById("name").value = main_media.GetFileInfo().GetImName();

    document.getElementById("packform").submit();
}
