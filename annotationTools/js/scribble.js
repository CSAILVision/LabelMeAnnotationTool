var OBJECT_DRAWING = 1;
var BG_DRAWING = 2;
var RUBBER_DRAWING = 3;
var saveCanvas;
var saveScribbleCanvas;
var localop = false;
//Module.TOTAL_MEMORY = 7108864;
grabCut = Module.cwrap(
    'grabCut', 'string', ['number', 'number', 'number', 'number', 'number']
);

// Indicates whether we are in segmentation or polygon mode
drawing_mode = 0;


function Scribble_canvas(tag) {
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
  this.paint = false;

  this.editborderlx = -1;
  this.editborderrx = -1;
  this.editborderly = -1;
  this.editborderry = -1;
  this.scribble_image = "";
  this.annotationid = -1;

  this.object_corners = new Array();
  this.image_corners = new Array();
  this.image_name;
  this.scribble_name;
  this.scribblecanvas;

  // These two functions are called to show and hide the spinner wheel 
  // when the segmentation is in progress
  this.showspinner = function (){
    scribble_canvas.scribblecanvas.setAttribute('style','cursor: progress');
    //document.getElementById('segmentbtn').disabled = true;
    document.getElementById('donebtn').disabled = true;
    $('#loadspinner').show();
  }

  this.hidespinner = function (){
    var val = scribble_canvas.currently_drawing;
    if (val == OBJECT_DRAWING) scribble_canvas.scribblecanvas.setAttribute('style','cursor:url(Icons/red_pointer.cur), default');
    else if (val == BG_DRAWING) scribble_canvas.scribblecanvas.setAttribute('style','cursor:url(Icons/blue_pointer.cur), default');
    else scribble_canvas.scribblecanvas.setAttribute('style','cursor:url(Icons/rubber_pointer.cur), default');
    document.getElementById('donebtn').disabled = false;
    //document.getElementById('segmentbtn').disabled = false;
    $('#loadspinner').hide();
  }

  // Clean the scribbles from the canvas.
  this.cleanscribbles = function (){
    this.clickX = new Array();
    this.clickY = new Array();
    this.clickDrag = new Array();
    this.clickColor = new Array();
    saveCanvas = null;
    saveScribbleCanvas = null;
    ClearMask('mask_canvas');
    this.redraw();
  };

  // This function is called once we set the scribble mode. It prepares the canvas where the scribbles
  // will be drawn and initializes the necessary data structures.
  this.startSegmentationMode = function(){
    this.clickX = new Array();
    this.clickY = new Array();
    this.clickDrag = new Array();
    this.clickColor = new Array();
    resp = "";
    this.prepareHTMLtoDraw();    
  };

  // Close the canvas where the scribbles will be drawn.
  this.CloseCanvas = function()  {
    var p = document.getElementById('canvasDiv');
    p.parentNode.removeChild(p);
  };

  // Draws the scribbles in the canvas according to the zoom parameter
  // The function loops over clickX, clickY to know the coordinates of the scribbles.
  this.redraw = function(){
    this.scribblecanvas.setAttribute('width', main_media.width_curr);
    this.scribblecanvas.setAttribute('height',main_media.height_curr);
    var context = this.scribblecanvas.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    var ratio = main_media.GetImRatio(); 
    if (this.annotationid > -1){
      scribble_canvas.scribblecanvas.getContext("2d").globalCompositeOperation = "source-over";
      scribble_canvas.scribblecanvas.getContext("2d").drawImage(scribble_canvas.scribble_image,0,0,main_media.width_curr, main_media.height_curr);
    }
    context.lineJoin = "miter";
    context.lineCap = "round";
    context.lineWidth = 5;         
    for(var i=0; i < this.clickX.length; i++) {        
      context.beginPath();

      if(this.clickDrag[i] && i){
        context.moveTo(this.clickX[i-1]*ratio, this.clickY[i-1]*ratio);
      }
      else{
    context.moveTo(this.clickX[i]*ratio-1, this.clickY[i]*ratio);
      }
      context.lineTo(this.clickX[i]*ratio, this.clickY[i]*ratio);
      if (this.clickColor[i] == OBJECT_DRAWING){
        context.lineWidth = 5;
        context.globalCompositeOperation =  "source-over";
        context.strokeStyle = "#ff0000";
      } 
      else if (this.clickColor[i] == BG_DRAWING){
        context.lineWidth = 5;
        context.globalCompositeOperation =  "source-over";
        context.strokeStyle = "#0000ff";
      } 
      else if (this.clickColor[i] == RUBBER_DRAWING){ 
        context.lineWidth = 15;
        context.globalCompositeOperation =  "destination-out";
        context.strokeStyle = "rgba(0,0,0,1)";
      }
      //context.closePath();
      context.stroke();
    }
  };
 
  // Saves the resized scribbles into the server to create the segmentation
  this.save = function (dataURL, imname, dir, callback){
    $.ajax({
      async: true,
      type: "POST",
      url: "annotationTools/php/saveimage.php",
      data: { 
        image: dataURL,
        name: imname,
        uploadDir: dir,
      }
    }).done(function(o) {
      callback;
    });
  };
  

  // General function to synchronously create a directory from a given url
  this.createDir = function(url, callback){
    $.ajax({
      async: true,
      type: "POST",
      url: "annotationTools/php/createdir.php",
      data: { 
    urlData: url
      }
    }).done(function(o) {
      callback;
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
    var pt = main_media.SlideWindow((scribble_canvas.object_corners[0]*im_ratio + scribble_canvas.object_corners[2]*im_ratio)/2,(scribble_canvas.object_corners[1]*im_ratio + scribble_canvas.object_corners[3]*im_ratio)/2);
    
    // Make query popup appear.
    main_media.ScrollbarsOff();
    WriteLogMsg('*What_is_this_object_query');
    
    mkPopup(pt[0],pt[1], true);

    // Focus the cursor inside the box
    document.getElementById('objEnter').focus();
    document.getElementById('objEnter').select();
  
    // If annotation is point or line, then 
    if(doReset) object_choices = '...';
    
    // Render annotation:
    query_anno = anno;
    query_anno.SetDivAttach('query_canvas');
    var anno_id = query_anno.GetAnnoID();
    var X_array = [scribble_canvas.object_corners[0],scribble_canvas.object_corners[2],scribble_canvas.object_corners[2], scribble_canvas.object_corners[0]];
    var Y_array = [scribble_canvas.object_corners[1],scribble_canvas.object_corners[1],scribble_canvas.object_corners[3], scribble_canvas.object_corners[3]];
    query_anno.DrawPolygon(main_media.GetImRatio(), X_array, Y_array);
    
    // Set polygon actions:
    query_anno.SetAttribute('onmousedown','StartEditEvent(' + anno_id + ',evt); return false;');
    query_anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ anno_id +'); return false;');
    query_anno.SetAttribute('oncontextmenu','return false');
    query_anno.SetCSS('cursor','pointer');
  };
  

  // Called after the segmentation is done. It prepares an annotation 
  // object describing the new segmentation and shows up a bubble to 
  // introduce the name of the object.  If the user was editing a 
  // segmentation we update the xml with the new coordinates of the 
  // bounding box.
  this.preparetoSubmit = function(){
    if (this.annotationid == -1){ // The segmentation was new

      var anno = new annotation(LMnumberOfObjects(LM_xml));
      anno.scribble = new scribble(anno.anno_id);
      var Nobj = $(LM_xml).children("annotation").children("object").length;
      var imagname = main_media.GetFileInfo().GetImName();
      imagname = imagname.substr(0, imagname.length-4);
      anno.scribble.SetRandomCache(this.cache_random_number);
      anno.SetType(1);
      scribble_canvas.image_corners = new Array();
      scribble_canvas.image_corners.push(Math.max(0, this.minclicX-(this.maxclicX - this.minclicX)*0.25));
      scribble_canvas.image_corners.push(Math.max(0, this.minclicY - (this.maxclicY - this.minclicY)*0.25));
      scribble_canvas.image_corners.push(Math.min(main_media.width_orig, this.maxclicX+(this.maxclicX - this.minclicX)*0.25));
      scribble_canvas.image_corners.push(Math.min(main_media.height_orig, this.maxclicY+(this.maxclicY - this.minclicY)*0.25));
      this.image_name = imagname+'_mask_'+Nobj+'.png';
      this.scribble_name = imagname+'_scribble_'+Nobj+'.png';
      
      // Draw polygon on draw canvas:
      draw_anno = anno;
      draw_anno.SetDivAttach('draw_canvas');
      var X_array = [scribble_canvas.object_corners[0],scribble_canvas.object_corners[2],scribble_canvas.object_corners[2],scribble_canvas.object_corners[0]];
      var Y_array = [scribble_canvas.object_corners[1], scribble_canvas.object_corners[1], scribble_canvas.object_corners[3], scribble_canvas.object_corners[3]];
      draw_anno.DrawPolygon(main_media.GetImRatio(), X_array,Y_array);
      
      // Set polygon actions:
      draw_anno.SetAttribute('onmousedown','StartEditEvent(' + draw_anno.GetAnnoID() + ',evt); return false;');
      draw_anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ draw_anno.GetAnnoID() +'); return false;');
      draw_anno.SetAttribute('oncontextmenu','return false');
      draw_anno.SetCSS('cursor','pointer');
      
      this.DrawToQuery();
    }
    else { // We were editting a segmentation
      var anno = new annotation(this.annotationid); 
      anno.SetType(1);
      anno.scribble = new scribble(this.annotationid);
      var idx = scribble_canvas.annotationid;
      scribble_canvas.cache_random_number = Math.random();
      anno.scribble.SetRandomCache(scribble_canvas.cache_random_number);
      if (scribble_canvas.clickX.length > 0){
        var lx = Math.max(0, scribble_canvas.minclicX-(scribble_canvas.maxclicX - scribble_canvas.minclicX)*0.25);
        var ly = Math.max(0, scribble_canvas.minclicY -  (scribble_canvas.maxclicY - scribble_canvas.minclicY)*0.25);
        var rx = Math.min(main_media.width_orig, scribble_canvas.maxclicX+(scribble_canvas.maxclicX - scribble_canvas.minclicX)*0.25);
        var ry = Math.min(main_media.height_orig, scribble_canvas.maxclicY+(scribble_canvas.maxclicY - scribble_canvas.minclicY)*0.25);
        scribble_canvas.image_corners = new Array();
        scribble_canvas.image_corners.push(Math.min(lx, scribble_canvas.editborderlx));
        scribble_canvas.image_corners.push(Math.min(ly, scribble_canvas.editborderly));
        scribble_canvas.image_corners.push(Math.max(rx, scribble_canvas.editborderrx));
        scribble_canvas.image_corners.push(Math.max(ry, scribble_canvas.editborderry));
        scribble_canvas.UpdateMaskXML(idx);
      }
      main_canvas.AttachAnnotation(anno);
      
      active_canvas = REST_CANVAS;
      
      main_handler.AnnotationLinkClick(idx);
    }
  }

  // Updates the XML with the object 'idx' according to the edited 
  // segmentation.  It updates the boundaries of the polygon enclosing 
  // the segmentation and the boundaries of the image containing the 
  // segmentation.  
  this.UpdateMaskXML = function (idx){
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("xmin").text(scribble_canvas.image_corners[0]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("ymin").text(scribble_canvas.image_corners[1]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("xmax").text(scribble_canvas.image_corners[2]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("scribbles").children("ymax").text(scribble_canvas.image_corners[3]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("xmin").text(scribble_canvas.object_corners[0]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("ymin").text(scribble_canvas.object_corners[1]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("xmax").text(scribble_canvas.object_corners[2]);
    $(LM_xml).children("annotation").children("object").eq(idx).children("segm").children("box").children("ymax").text(scribble_canvas.object_corners[3]);
    
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
  }


  this.cropandResize = function(cornerx, cornery, scale, finalwidth, finalheight, data){
    var resize_canvas = document.createElement('canvas');  
    resize_canvas.width = finalwidth;
    resize_canvas.height = finalheight;
    var swidth = finalwidth/scale;
    var sheight = finalheight/scale;
    resize_canvas.getContext('2d').drawImage(data, Math.floor(cornerx), Math.floor(cornery), Math.floor(swidth), Math.floor(sheight), 0, 0, Math.floor(finalwidth), Math.floor(finalheight));
    return resize_canvas.getContext('2d').getImageData(0,0,Math.floor(finalwidth),Math.floor(finalheight));
  }

  this.compute = function (imageData, scribbleData) {
    var size = imageData.data.length * imageData.data.BYTES_PER_ELEMENT;
    var imagePtr = Module._malloc(size);
    var scribblePtr = Module._malloc(size);
    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)

    var imageHeap = new Uint8Array(Module.HEAPU8.buffer, imagePtr, size);
    imageHeap.set(new Uint8Array(imageData.data.buffer));

    var scribbleHeap = new Uint8Array(Module.HEAPU8.buffer, scribblePtr, size);
    scribbleHeap.set(new Uint8Array(scribbleData.data.buffer));

    // Call function and get result
    var params = grabCut(imageHeap.byteOffset, scribbleHeap.byteOffset, imageData.height, imageData.width, scribble_canvas.colorseg);

    var resultData = new Uint8ClampedArray(imageHeap.buffer, imageHeap.byteOffset, imageData.data.length);
    
    // Create canvas to store result
    var result = document.createElement('canvas');
    result.width = imageData.width;
    result.height = imageData.height;
    var resultImageData = result.getContext('2d').createImageData(imageData.width, imageData.height);
    resultImageData.data.set(resultData);
    // Free memory
    Module._free(imageHeap.byteOffset);
    Module._free(scribbleHeap.byteOffset);
   
    result.getContext('2d').putImageData(resultImageData, 0, 0);

    return [result, params];

  }
  this.resizeandsaveImage = function(scale, fwidth, fheight, annotation_ended, poslx, posly){
    var Nobj = $(LM_xml).children("annotation").children("object").length;
    if (scribble_canvas.annotationid > -1) Nobj = scribble_canvas.annotationid;
    var imagname = main_media.GetFileInfo().GetImName();
    imagname = imagname.substr(0, imagname.length-4);
    var imratio = main_media.GetImRatio();
    var scribbleData = scribble_canvas.cropandResize(poslx*imratio,posly*imratio,scale/imratio,fwidth*scale,fheight*scale,scribble_canvas.scribblecanvas);
    var origIm = new Image();
    origIm.src = main_media.GetFileInfo().GetImagePath();
    origIm.poslx = poslx;
    origIm.posly = posly;
    origIm.onload = function(){
      var poslx = Math.round(this.poslx);
      var posly = Math.round(this.posly);
      var imageData = scribble_canvas.cropandResize(poslx,posly,scale,fwidth*scale,fheight*scale,origIm);
      var resultarray = scribble_canvas.compute(imageData, scribbleData);
      var result = resultarray[0];
      scribble_canvas.redraw();
      // Contains the segmentation at original scale
      if (!saveCanvas){
        saveCanvas = document.createElement('canvas');
        saveCanvas.width = main_media.width_orig;
        saveCanvas.height = main_media.height_orig;
      }
      var newMask = result.getContext("2d").getImageData(0,0,result.width, result.height);
      var resizedsavedMask = scribble_canvas.cropandResize(poslx,posly,scale,fwidth*scale,fheight*scale, saveCanvas);
      console.log(newMask.width, newMask.height, resizedsavedMask.width, resizedsavedMask.height);
      var opArray = scribble_canvas.maskOp(newMask, resizedsavedMask, poslx, posly,scale);
      result.getContext('2d').putImageData(opArray[0], 0, 0);

      scribble_canvas.object_corners = new Array();
      scribble_canvas.object_corners.push(Math.round(poslx + opArray[1][0]/scale)); 
      scribble_canvas.object_corners.push(Math.round(posly + opArray[1][1]/scale)); 
      scribble_canvas.object_corners.push(Math.round(poslx + opArray[1][2]/scale)); 
      scribble_canvas.object_corners.push(Math.round(posly + opArray[1][3]/scale));

      saveCanvas.getContext("2d").clearRect(0, 0, saveCanvas.width, saveCanvas.height);
      var originalsizedMask = scribble_canvas.cropandResize(0,0,1./scale,fwidth,fheight,result);
      saveCanvas.getContext("2d").putImageData(originalsizedMask, poslx, posly);
      scribble_canvas.segmentation_in_progress = 0;
       // Display result in adjusted canvas
      scribble_canvas.drawMask();
      scribble_canvas.hidespinner();
      scribble_canvas.flag_changed = 0;
      if (annotation_ended){
        scribble_canvas.saveScribbles();
        scribble_canvas.saveMask();
        scribble_canvas.preparetoSubmit();
      }
    }
    
  }
  this.obtainMask = function(image, xarr,yarr, width,height){
    var resp = new Uint8ClampedArray(height*width);
    var mx = [1,0,-1,0]; var my = [0,1,0,-1];
    while (xarr.length > 0){
      x = xarr[xarr.length-1]; y = yarr[yarr.length-1];
      xarr.pop(); yarr.pop();
      for (var it = 0 ; it < 4; it++){
        var id = ((y+my[it])*width + (x+mx[it]));
        if (x+mx[it] >= 0 && x+mx[it] < width && y+my[it] >= 0 && y+my[it] < height && resp[id] == 0 && image[4*id+3] > 0){
          resp[id] = 1;
          xarr.push(x+mx[it]); yarr.push(y+my[it]);
        }
      }

    }
    return resp;
  }
  this.diffMasks = function(mask1, mask2){
    var resp = new Uint8ClampedArray(mask1.data.length);
    for (var id = 0; id < resp.length/4; id++){
      if (mask1.data[4*id+3] > 0 && mask2.data[4*id+3] == 0){
        resp[4*id] = mask1.data[4*id];
        resp[4*id+1] = mask1.data[4*id+1];
        resp[4*id+2] = mask1.data[4*id+2];
        resp[4*id+3] = mask1.data[4*id+3];
      } 
    }
    return resp;
  }
  this.maskOp = function(mask1, mask2, shiftx, shifty, scale){
    // op: 1 is or, 0 is substitute
    // Check span of the last scribble
    for (var i = 0; i < mask2.data.length/4; i++){
      if (mask2.data[4*i+3] > 70) mask2.data[4*i+3] = 153;
      else {
        mask2.data[4*i] = 0;
        mask2.data[4*i+1] = 0;
        mask2.data[4*i+2] = 0;
        mask2.data[4*i+3] = 0;
      }
    } 
    var corners = [mask1.width, mask1.height, 0,0];
    shiftx = Math.round(shiftx*scale);
    shifty = Math.round(shifty*scale);
    var op = 0;
    if (scribble_canvas.clickColor[scribble_canvas.clickColor.length-1] == OBJECT_DRAWING) op = 1;
    var maskchange;
    var Xarr = new Array(); var Yarr = new Array();
    var it = scribble_canvas.clickX.length-1;
    while (it >= 0 && scribble_canvas.clickDrag[it]){
      Xarr.push(Math.round(scale*scribble_canvas.clickX[it])-shiftx);
      Yarr.push(Math.round(scale*scribble_canvas.clickY[it])-shifty);
      it--;
    }
    if (op == 1) maskchange = this.diffMasks(mask1, mask2);
    else maskchange = this.diffMasks(mask2, mask1);
    var combinemask = this.obtainMask(maskchange, Xarr, Yarr, mask1.width, mask1.height);
    var res = mask1;
    for (var i = 0; i < mask1.height; i++){
      for (var j = 0; j < mask1.width; j++){
        var id1 = (i*mask1.width + j);
        if (op == 1){

          res.data[4*id1] = Math.max(mask2.data[4*id1], maskchange[4*id1]*combinemask[id1]);
          res.data[4*id1+1] = Math.max(mask2.data[4*id1+1], maskchange[4*id1+1]*combinemask[id1]);
          res.data[4*id1+2] = Math.max(mask2.data[4*id1+2], maskchange[4*id1+2]*combinemask[id1]);
          res.data[4*id1+3] = Math.max(mask2.data[4*id1+3], maskchange[4*id1+3]*combinemask[id1]);
        }
        else {
          res.data[4*id1] = mask2.data[4*id1] - maskchange[4*id1]*combinemask[id1];
          res.data[4*id1+1] = mask2.data[4*id1+1] - maskchange[4*id1+1]*combinemask[id1];
          res.data[4*id1+2] = mask2.data[4*id1+2] - maskchange[4*id1+2]*combinemask[id1];
          res.data[4*id1+3] = mask2.data[4*id1+3] - maskchange[4*id1+3]*combinemask[id1];
        }
        if (res.data[4*id1+3] > 0){
          corners[0] = Math.min(corners[0],j);
          corners[1] = Math.min(corners[1],i);
          corners[2] = Math.max(corners[2],j);
          corners[3] = Math.max(corners[3],i);
        }
      }
    }
    return [res,corners];

  }
  // Draw the segmentation mask into the canvas, clearing previous masks from the canvas if there were any
  this.drawMask = function(){
    ClearMask('mask_canvas');
    if (saveCanvas == null) return;
    var adjustedMask = scribble_canvas.cropandResize(0,0,main_media.GetImRatio(),saveCanvas.width*main_media.GetImRatio(),saveCanvas.height*main_media.GetImRatio(),saveCanvas);
    var result = document.createElement('canvas');
    result.id = 'mask_canvas';
    result.width = main_media.width_curr;
    result.height = main_media.height_curr;
    result.getContext('2d').putImageData(adjustedMask, 0, 0);
    $('#myCanvas_bg_div').append(result);
    
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
      this.segment(annotation_ended);
    }
    else if (annotation_ended){ // if the last segmentation has ended
      this.saveScribbles();
      if (saveCanvas) this.saveMask();
      this.preparetoSubmit();
    }
  };

  // Crops an image surrounding the scribbles drawn by the user and 
  // saves a resized version of the original image and the scribbles to 
  // compute the segmentation mask. The resizing is done accordingly to 
  // the size of the scribbles to avoid having to segment big images 
  // when the user annotates big objects.

  this.segment = function (annotation_ended){
    var clx = Math.max(0, this.minclicX-(this.maxclicX - this.minclicX)*0.25);
    var crx = Math.min(main_media.width_orig, this.maxclicX+(this.maxclicX - this.minclicX)*0.25);
    var cly = Math.max(0, this.minclicY - (this.maxclicY - this.minclicY)*0.25);
    var cry = Math.min(main_media.height_orig, this.maxclicY+(this.maxclicY - this.minclicY)*0.25);
    if (this.annotationid > -1){
      clx = Math.min(clx, this.editborderlx);
      crx = Math.max(crx, this.editborderrx);
      cly = Math.min(cly, this.editborderly);
      cry = Math.max(cry, this.editborderry);
    }
    var fw =  crx - clx;
    var fh =  cry - cly;
    var scribblesize = Math.sqrt(fw*fh);
    var segment_ratio = Math.min(350/scribblesize,1);
    if (fw == 0 || fh == 0){
      this.segmentation_in_progress = 0;
      this.hidespinner();
    } 
    else scribble_canvas.resizeandsaveImage(segment_ratio,fw,fh, annotation_ended, clx, cly);
  }
  this.saveScribbles = function(){
    var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");
    if (!saveScribbleCanvas) saveScribbleCanvas = document.createElement('canvas');
    var func = function (url){
      var imgdata = new Image();
      imgdata.src = scribble_canvas.scribblecanvas.toDataURL("image/png");
      imgdata.onload = function(){
        saveScribbleCanvas.setAttribute('width', main_media.width_orig);
        saveScribbleCanvas.setAttribute('height',main_media.height_orig);
        saveScribbleCanvas.getContext("2d").drawImage(imgdata,0,0,main_media.width_orig, main_media.height_orig);       
        var scribbledataURL = saveScribbleCanvas.toDataURL("image/png"); 
        var Nobj = $(LM_xml).children("annotation").children("object").length;
        if (scribble_canvas.annotationid > -1) Nobj = scribble_canvas.annotationid;
        var imagname = main_media.GetFileInfo().GetImName();
        imagname = imagname.substr(0, imagname.length-4);
        scribble_canvas.save(scribbledataURL, imagname+'_scribble_'+Nobj+'.png', url, null);
      }
    }
    this.createDir("Scribbles/"+collectionName+"/", func("Scribbles/"+collectionName+"/"));
    
  }
  this.saveMask = function (){
    var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");

    var func1 = function (url){
      var Nobj = $(LM_xml).children("annotation").children("object").length;
      console.log(scribble_canvas.annotationid);
      if (scribble_canvas.annotationid > -1) Nobj = scribble_canvas.annotationid;
      var imagname = main_media.GetFileInfo().GetImName();
      imagname = imagname.substr(0, imagname.length-4);
      var name = imagname+'_mask_'+Nobj+'.png';
      scribble_canvas.save(saveCanvas.toDataURL("image/png"),name, url, null);
    } 
    scribble_canvas.createDir("annotationCache/TmpAnnotations/"+collectionName+"/", func1("annotationCache/TmpAnnotations/"+collectionName+"/", scribble_canvas.annotationid));
    scribble_canvas.createDir("Masks/"+collectionName+"/", func1("Masks/"+collectionName+"/", scribble_canvas.annotationid));
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
    this.scribblecanvas.setAttribute('width', main_media.width_curr);
    this.scribblecanvas.setAttribute('height', main_media.height_curr);
    this.scribblecanvas.setAttribute('id', 'scribble_canvas');
    this.scribblecanvas.setAttribute('style','cursor:url(Icons/red_pointer.cur), default');
    this.canvasDiv.appendChild(this.scribblecanvas);
    if(typeof G_vmlCanvasManager != 'undefined') {
      this.scribblecanvas = G_vmlCanvasManager.initElement(this.scribblecanvas);
    }

    $('#scribble_canvas').mousedown(function(e){
      if (e.button > 1 || scribble_canvas.segmentation_in_progress) return;
      var mouseX = GetEventPosX(e.originalEvent);
      var mouseY = GetEventPosY(e.originalEvent);      
      this.paint = true;
      scribble_canvas.addClick(mouseX, mouseY);
      });

    $('#scribble_canvas').mouseout(function(e){
      this.paint = false;
    });

    $('#scribble_canvas').mousemove(function(e){
      if(this.paint && !scribble_canvas.segmentation_in_progress){
        scribble_canvas.addClick(GetEventPosX(e.originalEvent) , GetEventPosY(e.originalEvent) , true);
        scribble_canvas.redraw();
      }
    });
    
    $('#scribble_canvas').mouseup(function(e){
      this.paint = false;
      if (scribble_canvas.segmentation_in_progress) return;
      scribble_canvas.showspinner();
      scribble_canvas.segmentation_in_progress = 1;
      scribble_canvas.segment(false);

    });
  };

  // Called each periodically while dragging the mouse over the screen. 
  // Saves the coordinates of the clicks introduced by the user.
  this.addClick = function(x, y, dragging){
    this.flag_changed = 1;
    var ratio = main_media.GetImRatio();  
    x-=1; 
    x = Math.floor(x/ratio);
    y = Math.floor(y/ratio);
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
  };

  // changes to foreground/backgorund/rubber
  this.setCurrentDraw = function(val){
    if (drawing_mode == 0){ 
      SetDrawingMode(1);
      if(draw_anno) return;
    }
    var buttons = document.getElementsByClassName("labelBtnDraw");
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('style', 'background-color: #fff');
    if (val != OBJECT_DRAWING && val != BG_DRAWING && val != RUBBER_DRAWING) return;
    if (val == OBJECT_DRAWING){
      this.scribblecanvas.setAttribute('style','cursor:url(Icons/red_pointer.cur), default');
      document.getElementById("ScribbleObj").setAttribute('style', 'background-color: #faa');
    } 
    else if (val == BG_DRAWING){
     this.scribblecanvas.setAttribute('style','cursor:url(Icons/blue_pointer.cur), default');
     document.getElementById("ScribbleBg").setAttribute('style', 'background-color: #faa');
    }
    else {
      this.scribblecanvas.setAttribute('style','cursor:url(Icons/rubber_pointer.cur), default');
      document.getElementById("ScribbleRubber").setAttribute('style', 'background-color: #faa');
    } 
    
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
  main_handler.attributes = document.getElementById('attributes').value;
  main_handler.occluded = document.getElementById('occluded').value;
  
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
  scribble_canvas.scribble_image.src = "Scribbles/"+main_media.GetFileInfo().GetDirName()+"/"+anno.scribble.GetScribbleName()+"?t="+Math.random();
  scribble_canvas.setCurrentDraw(OBJECT_DRAWING);
  scribble_canvas.editborderrx = anno.scribble.GetCornerRX(); 
  scribble_canvas.editborderlx = anno.scribble.GetCornerLX();
  scribble_canvas.editborderry = anno.scribble.GetCornerRY();
  scribble_canvas.editborderly = anno.scribble.GetCornerLY();
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
  $('#myCanvas_bg').empty();
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


function scribble (id){
  this.cache_random_number = Math.random(); // This avoids cache loading - there must be a better solution
  this.annot_id = id;
  // Get the name of the image containing the mask for the segmentation
  this.GetImName = function (){
    return LMgetObjectField(LM_xml, this.annot_id, 'mask_name');
  };

  // Get the name of the image containing the scribbles for the segmentation
  this.GetScribbleName = function (){
    return LMgetObjectField(LM_xml, this.annot_id, 'scribble_name');
  };
  // Gets the location of the image containing the mask for the segmentation
  this.GetMaskURL = function (){
    var url_name =  $(LM_xml).children("annotation").children("object").eq(this.annot_id).children("segm").children("mask").text();
    var url_folder =  $(LM_xml).children("annotation").children("folder").text();
    var loc = window.location.href;
    var   dir = loc.substring(0, loc.lastIndexOf('/tool.html'));
    url_name = dir+'/Masks/'+url_folder+'/'+url_name;
    return url_name;
  };
  // Get the corners of the cropped image that was used to create the segmentation
  this.GetCornerRX = function (){
      var res = LMgetObjectField(LM_xml, this.annot_id,'imagecorners');
    return res[2];
  };

  this.GetCornerLX = function (){
    var res = LMgetObjectField(LM_xml, this.annot_id,'imagecorners');
    return res[0];
  };

  this.GetCornerRY = function (){
    var res = LMgetObjectField(LM_xml, this.annot_id,'imagecorners');
    return res[3];
  };

  this.GetCornerLY = function (){
    var res = LMgetObjectField(LM_xml, this.annot_id,'imagecorners');
    return res[1];
  };
  this.SetRandomCache = function (num){
    this.cache_random_number = num;
  };
}

