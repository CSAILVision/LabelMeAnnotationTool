var OBJECT_DRAWING = 1;
var BG_DRAWING = 2;
var RUBBER_DRAWING = 3;
var resp;

// Indicates whether we are in segmentation or polygon mode
drawing_mode = 0;


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
    paint = false;
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
      context.closePath();
      context.stroke();
    }
  };

  // similar to redraw() but to set the scribbles to the same size than 
  // the original image (not according to the zoom) this function is only 
  // called when creating the segmentation to create save an image with 
  // the scribbles 
  this.redraw2 = function(ratio){
    this.scribblecanvas.setAttribute('width', main_media.width_orig);
    this.scribblecanvas.setAttribute('height',main_media.height_orig);
    var context = this.scribblecanvas.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
    context.lineJoin = "miter"; 
    context.lineCap = "round";      
    if (this.annotationid > -1){
      scribble_canvas.scribblecanvas.getContext("2d").globalCompositeOperation = "source-over";
      scribble_canvas.scribblecanvas.getContext("2d").drawImage(scribble_canvas.scribble_image,0,0,main_media.width_orig, main_media.height_orig);      
    }
    var width = 9;//(main_media.width_orig * main_media.height_orig)/327680.; // proportional to the size of the imag
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
        context.lineWidth = width;
        context.globalCompositeOperation =  "source-over";
        context.strokeStyle = "#ff0000";
      } 
      else if (this.clickColor[i] == BG_DRAWING){
        context.lineWidth = width;
        context.globalCompositeOperation =  "source-over";
        context.strokeStyle = "#0000ff";
      } 
      else if (this.clickColor[i] == RUBBER_DRAWING){ 
        context.lineWidth = width*3;
        context.globalCompositeOperation =  "destination-out";
        context.strokeStyle = "rgba(0,0,0,1)";
      }
      context.closePath();
      context.stroke();
    }
  };
 
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
      scribble_canvas.resizeandsaveImage(collectionName+"/"+imagname+'_scribble_'+Nobj+'.png', 'scribble.png', collectionName+"/", segment_ratio,fw,fh,-1, 0, annotation_ended);
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
    var pt = main_media.SlideWindow((scribble_canvas.object_corners[0]*im_ratio + scribble_canvas.object_corners[2]*im_ratio)/2,(scribble_canvas.object_corners[1]*im_ratio + scribble_canvas.object_corners[2]*im_ratio)/2);
    
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
    var X_array = [scribble_canvas.object_corners[0],scribble_canvas.object_corners[2],scribble_canvas.object_corners[2], scribble_canvas.object_corners[0]];
    var Y_array = [scribble_canvas.object_corners[1],scribble_canvas.object_corners[1],scribble_canvas.object_corners[3], scribble_canvas.object_corners[3]];
    query_anno.DrawPolygon(main_media.GetImRatio(), X_array, Y_array);
    
    // Set polygon actions:
    query_anno.SetAttribute('onmousedown','StartEditEvent(' + anno_id + ',evt); return false;');
    query_anno.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ anno_id +'); return false;');
    query_anno.SetAttribute('oncontextmenu','return false');
    query_anno.SetCSS('cursor','pointer');
  };
  
  this.GetPopupFormDraw = function() {
    html_str = "<b>Enter object name</b><br />";
    html_str += this.HTMLobjectBox("");
    
    if(use_attributes) {
      html_str += HTMLoccludedBox("");
      html_str += "<b>Enter attributes</b><br />";
      html_str += HTMLattributesBox("");
    }
    
    if(use_parts) {
      html_str += HTMLpartsBox("");
    }
    
    html_str += "<br />";
  
    // Done button:
    html_str += '<input type="button" value="Done" title="Press this button after you have provided all the information you want about the object." onclick="main_handler.SubmitQuery();" tabindex="0" />';
  
    // Undo close button:
    html_str += '<input type="button" value="Edit Scribble" title="Press this button if to keep adding scribbles." onclick="KeepEditingScribbles();" tabindex="0" />';
  
    // Delete button:
    html_str += '<input type="button" value="Delete" title="Press this button if you wish to delete the polygon." onclick="scribble_canvas.WhatIsThisObjectDeleteButton();" tabindex="0" />';
    
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
  
    html_str += '<input name="objEnter" id="objEnter" type="text" style="width:220px;" tabindex="0" value="'+obj_name+'" title="Enter the object\'s name here. Avoid application specific names, codes, long descriptions. Use a name you think other people would agree in using. "';
  
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
      this.image_name = resp;
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
      console.log(main_canvas.GetAnnoIndex(this.annotationid));
      var idx = scribble_canvas.annotationid;
      
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
    console.log(anno.scribble);
    anno.scribble.SetRandomCache(scribble_canvas.cache_random_number);

    main_canvas.AttachAnnotation(anno);
    
    scribble_canvas.UpdateMaskXML(idx);
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

  this.resizeandsaveImage = function(urlSource, namedest, urlDest, scale, fwidth, fheight, dir, callback, annotation_ended  ){
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
      }
    }).done(function(data_response) {
      var imagetoSegmentURL = main_media.GetFileInfo().GetFullName();
      imagetoSegmentURL = imagetoSegmentURL.replace("///","/");
      var Nobj = $(LM_xml).children("annotation").children("object").length;
      if (scribble_canvas.annotationid > -1) Nobj = scribble_canvas.annotationid;
      if (callback == 0){
    var collectionName = main_media.GetFileInfo().GetDirName().replace("///","/");
    scribble_canvas.resizeandsaveImage(imagetoSegmentURL, 'image.jpg', collectionName+"/", scale,fwidth,fheight,0,1, annotation_ended);
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
      scribble_canvas.object_corners = new Array();
      scribble_canvas.object_corners.push(poslx + (cadena[1]/scale)); 
      scribble_canvas.object_corners.push(posly + (cadena[2]/scale)); 
      scribble_canvas.object_corners.push(poslx + (cadena[3]/scale)); 
      scribble_canvas.object_corners.push(posly + (cadena[4]/scale));

          
      // Save the segmentation result in the Masks folder:
      
      scribble_canvas.resizeandsaveImage(collectionName+"/",resp,collectionName+"/",1./scale,main_media.width_orig,main_media.height_orig,1,2, annotation_ended);
    }
      }
      else if (callback == 2){
        scribble_canvas.drawMask(1);
        scribble_canvas.hidespinner();
        scribble_canvas.segmentation_in_progress = 0;
        scribble_canvas.flag_changed = 0;
        if (annotation_ended){
          console.log("VAA"+scribble_canvas.object_corners);
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
      
      this.redraw2(1, annotation_ended);
      
      this.segmentAfterScribblesDone(annotation_ended);
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
    this.scribblecanvas.setAttribute('width', main_media.width_curr);
    this.scribblecanvas.setAttribute('height', main_media.height_curr);
    this.scribblecanvas.setAttribute('id', 'scribble_canvas');
    this.scribblecanvas.setAttribute('style','cursor:url(Icons/red_pointer.cur), default');
    this.canvasDiv.appendChild(this.scribblecanvas);
    if(typeof G_vmlCanvasManager != 'undefined') {
      this.scribblecanvas = G_vmlCanvasManager.initElement(this.scribblecanvas);
    }

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
        scribble_canvas.redraw();
      }
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
  };

  // changes to foreground/backgorund/rubber
  this.setCurrentDraw = function(val){
    if (drawing_mode == 0){ 
      SetDrawingMode(1);
      if(draw_anno) return;
    }
    var buttons = document.getElementsByClassName("labelBtnDraw");
    console.log(buttons);
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
  console.log(this.drawn_obj);
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

