// annotation class
// Keeps track of all information related to an individual annotation.

function annotation(anno_id) {
    
    // *******************************************
    // Private variables:
    // *******************************************
    
    this.pts_x = new Array();
    this.pts_y = new Array();
    
    this.anno_id = anno_id;
    this.div_attach = 'myCanvas_bg';

    /*************************************************************/
    /*************************************************************/
    // Scribble: Private variables that have been added.

    // 0 means that it is a polygon. 1 means it is a mask.
    // mask URL indicates, in case we have a mask, the URL of its image
    this.anno_type = 0;
    
    // Info about the image in case of being a segm annotation
    this.cache_random_number = Math.random(); // This avoids cache loading - there must be a better solution
    this.imname;
    this.scribble_name;
    this.image_pts_x = new Array(); // corners of the image (!) different than corners of the bounding box
    this.image_pts_y = new Array();
    /*************************************************************/
    /*************************************************************/

    // Element id of drawn polygon:
    this.polygon_id = null;

    // Element ids of drawn line segments:
    this.line_ids = null;

    // Element id for drawn first point:
    this.point_id = null;
    
    // *******************************************
    // Public methods:
    // *******************************************

    /*************************************************************/
    /*************************************************************/
    // Scribble: Public methods that have been added.

    // Get the name of the image containing the mask for the segmentation
    this.GetImName = function (){
        return this.imname;
    };

    // Get the name of the image containing the scribbles for the segmentation
    this.GetScribbleName = function (){
        return this.scribble_name;
    };

    // Gets the location of the image containing the mask for the segmentation
    this.GetMaskURL = function (){
        var url_name =  $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("segm").children("mask").text();
        var url_folder =  $(LM_xml).children("annotation").children("folder").text();
        var loc = window.location.href;
        var   dir = loc.substring(0, loc.lastIndexOf('/tool.html'));
        url_name = dir+'/Masks/'+url_folder+'/'+url_name;
       
        return url_name;
    };

    // Type of the annotation (0 - polygon, 1 - segmentation)
    this.GetType = function (){
        return this.anno_type;
    };
 
    // Get the corners of the cropped image that was used to create the segmentation
    this.GetCornerRX = function (){
        return this.image_pts_x[1];
    };

    this.GetCornerLX = function (){
        return this.image_pts_x[0];
    };

    this.GetCornerRY = function (){
        return this.image_pts_y[2];
    };

    this.GetCornerLY = function (){
        return this.image_pts_y[0];
    };

    this.SetImName = function (name){
        this.imname = name;
    };
    this.SetScribbleName = function(name){
        this.scribble_name = name;
    };

    this.SetType = function (type){
        this.anno_type = type;
    };
        
    // Set the corners of the polygon surrounding the segmentation
    this.SetCorners = function(x,y,x1,y1){
        this.pts_x = [x,x1,x1,x];
        this.pts_y = [y, y, y1, y1];
    };

    this.SetImageCorners  = function(x,y,x1,y1){
        this.image_pts_x = [x,x1,x1,x];
        this.image_pts_y = [y, y, y1, y1];
    };

    this.SetRandomCache = function (num){
        this.cache_random_number = num;
    };
    /*************************************************************/
    /*************************************************************/

    this.GetObjName = function () {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("name").text();
    };
    
    this.GetUsername = function () {
      /*************************************************************/
      /*************************************************************/
      // Scribble: When this.anno_type==1:
        if (this.anno_type == 1) return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("segm").children("username").text();
        else return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("polygon").children("username").text();
      /*************************************************************/
      /*************************************************************/
    };
    
    this.GetAutomatic = function() {
        if($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("automatic").length > 0) {
            return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("automatic").text());
        }
        return 0;
    };
    
    this.GetDeleted = function () {
        return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("deleted").text());
    };
    
    this.GetVerified = function () {
        return parseInt($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("verified").text());
    };
    
    this.GetOccluded = function() {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("occluded").text();
    };
    
    this.GetAttributes = function() {
        return $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("attributes").text();
    };
    
    this.GetParts = function() {
        parts = [];
        if ($(LM_xml).children("annotation").children("object").eq(this.anno_id).children("parts").length>0) {
            tmp = $(LM_xml).children("annotation").children("object").eq(this.anno_id).children("parts").children("hasparts").text();
            if (tmp.length>0) {
                // if it is not empty, split and trasnform to numbers
                parts = tmp.split(",");
                for (var j=0; j<parts.length; j++) {parts[j] = parseInt(parts[j], 10);}
            }
        }
        return parts;
    };

    this.SetDivAttach = function(da) {
        this.div_attach = da;
    };
    
    this.GetAnnoID = function () {
        return this.anno_id;
    };
    
    // Get the array of X control points.
    this.GetPtsX = function () {
        return this.pts_x;
    };
    
    this.CreatePtsX = function (numpts) {
        this.pts_x = Array(numpts);
    };
    
    // Get the array of Y control points.
    this.GetPtsY = function () {
        return this.pts_y;
    };
    
    this.CreatePtsY = function (numpts) {
        this.pts_y = Array(numpts);
    };
    
    // Set attribute of drawn polygon.
    this.SetAttribute = function(field,value) {
      $('#'+this.polygon_id).attr(field,value);
    };
    
    // Set CSS attribute of drawn polygon.
    this.SetCSS = function(field,value) {
      $('#'+this.polygon_id).css(field,value);
    };
    
    // Draw a polygon given this annotation's control points.
    this.DrawPolygon = function (im_ratio) {
      // Determine if an angle has been labeled:
      var strtok = this.GetObjName().split(/ /);
      var isAngle = 0;
      for(var i = 0; i < strtok.length; i++) if(strtok[i]=='angle') isAngle = 1;
      
      if(this.GetPtsX().length==1) {
	this.polygon_id = DrawFlag(this.div_attach,this.GetPtsX()[0],this.GetPtsY()[0],this.GetObjName(),im_ratio);
      }
      else if((this.GetPtsX().length==3) && isAngle) {
	var attr = 'fill="none" stroke="' + HashObjectColor(this.GetObjName()) + '" stroke-width="4"';
	this.polygon_id = DrawPolyLine(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      else if(this.GetAutomatic()==1) {
	// Draw a dashed polygon:
	var attr = 'fill="none" stroke="' + HashObjectColor(this.GetObjName()) + '" stroke-width="4" stroke-dasharray="9,5"';
	this.polygon_id = DrawPolygon(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      else {
	// Draw a polygon:
	var attr = 'fill="none" stroke="' + HashObjectColor(this.GetObjName()) + '" stroke-width="4"';
	this.polygon_id = DrawPolygon(this.div_attach,this.GetPtsX(),this.GetPtsY(),this.GetObjName(),attr,im_ratio);
      }
      return this.polygon_id;
    };
    
    // Draw a poly-line given this annotation's control points (i.e.
    // don't connect the last point to the first point).  This function
    // is used when we zoom, close the "what is this object?" popup bubble, 
    // or start a new polygon.
    this.DrawPolyLine = function (im_ratio) {
      // Draw line segments:
      var im_ratio = main_image.GetImRatio();
      this.line_ids = Array();
      for(var i = 0; i < this.pts_x.length-1; i++) {
	// Draw line segment:
	this.line_ids.push(DrawLineSegment(this.div_attach,this.pts_x[i],this.pts_y[i],this.pts_x[i+1],this.pts_y[i+1],'stroke="#0000ff" stroke-width="4"',im_ratio));

	// Set cursor to be crosshair on line segment:
	$('#'+this.line_ids[i]).css('cursor','crosshair');
      }

      // Draw first point:
      if(this.point_id) $('#'+this.point_id).remove();
      this.point_id = DrawPoint(this.div_attach,this.pts_x[0],this.pts_y[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',im_ratio);


      // Set actions for first point:
      $('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
      $('#'+this.point_id).attr('onmouseover','main_handler.MousedOverFirstControlPoint();');
    };
    
    // Deletes the annotation's polygon from the screen.
    this.DeletePolygon = function () {
      // Remove drawn polygon:
      console.log(this.polygon_id);
      if(this.polygon_id) {
	$('#'+this.polygon_id).remove();
	this.polygon_id = null;
      }

      // Remove all line segments for partially-drawn polygon:
      if(this.line_ids) {
	for(var i = 0; i < this.line_ids.length; i++) $('#'+this.line_ids[i]).remove();
	this.line_ids = null;
      }

      /*************************************************************/
      /*************************************************************/
      // Scribble: Finally we remove the segmentation mask if there was any
      var id = 'object'+($('#'+'myCanvas_bg').children().length-1)+"_mask";
      ClearMask(id);
      /*************************************************************/
      /*************************************************************/
      
      // Remove first drawn point:
      this.RemoveFirstPoint();
    };
    
    // Deletes the last control point that the user entered.
    this.DeleteLastControlPoint = function () {
      if(this.pts_x.length>1) {
	var l = this.line_ids.length;
	$('#'+this.line_ids[l-1]).remove();
	this.line_ids = this.line_ids.slice(0,l-1);

	// Remove last point from polygon array:
        var l = this.pts_x.length;
        this.pts_x = this.pts_x.slice(0,l-1);
        this.pts_y = this.pts_y.slice(0,l-1);

	return 1;
      }
      return 0;
    };
    
    // Fill the interior of the polygon.
    this.FillPolygon = function () {
      /*************************************************************/
      /*************************************************************/
      // Scribble: if this.anno_type != 0 then scribble mode:
      if (this.anno_type == 0) {  // In case it is a polygon
	FillPolygon(this.polygon_id);
      }
      else { // It is a segmentation
	DrawSegmentation('myCanvas_bg',this.GetMaskURL(), main_image.width_curr, main_image.height_curr, this.cache_random_number);
      }
      /*************************************************************/
      /*************************************************************/
    };
    
    // Unfill the interior of the polygon.
    this.UnfillPolygon = function () {
      /*************************************************************/
      /*************************************************************/
      // Scribble: if this.anno_type != 0 then scribble mode:
      if (this.anno_type == 0) {
        if(this.polygon_id) $('#'+this.polygon_id).attr("fill","none");
      }
      else {
        // If we have a segmentation we clear it from the canvas
        var id = 'object'+($('#'+this.div_attach).children().length-1)+"_mask";
        ClearMask(id);
      }
      /*************************************************************/
      /*************************************************************/
    };
    
    // When you move the mouse over the first control point, then make it
    // bigger to indicate it should be clicked on.  Do this if two or more
    // lines have been drawn.
    this.MouseOverFirstPoint = function () {
      if(this.pts_x.length > 0) {
	var im_ratio = main_image.GetImRatio();
	this.RemoveFirstPoint();
	this.point_id = DrawPoint(this.div_attach,this.pts_x[0],this.pts_y[0],'r="8" fill="#00ff00" stroke="#ffffff" stroke-width="4"',im_ratio);

	// Set actions for first point:
	$('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
	$('#'+this.point_id).attr('onmouseout','main_handler.MousedOutFirstControlPoint();');
	$('#'+this.point_id).css('cursor','pointer');
      }
    };
    
    // When you move the mouse over the first control point, then make it
    // bigger to indicate it should be clicked on.  Do this if two or more
    // lines have been drawn.
    this.MouseOutFirstPoint = function () {
      var im_ratio = main_image.GetImRatio();
      this.RemoveFirstPoint();
      this.point_id = DrawPoint(this.div_attach,this.pts_x[0],this.pts_y[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',im_ratio);

      // Set actions for first point:
      $('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
      $('#'+this.point_id).attr('onmouseover','main_handler.MousedOverFirstControlPoint();');
      $('#'+this.point_id).css('cursor','pointer');
    };
    
    // Returns the closest point to (x,y) that lies along the boundary of
    // the polygon.
    this.ClosestPoint = function (x,y) {
        var eps = 1e-3;
        var shortestDist = Infinity;
        var pt = new Array(3);
        var xs = this.pts_x;
        var ys = this.pts_y;
        var thisdist;
        
        for(var i=0, j=xs.length-1;i<xs.length;j=i,i++) {
            thisdist = this.dist(x,y,xs[j],ys[j]); //snap to nearby edges
            if(thisdist<shortestDist) {
                shortestDist = thisdist;
                pt[0] = xs[j];
                pt[1] = ys[j];
                pt[2] = thisdist;
            }
            
            var xi = xs[i], yi = ys[i];
            var xj = xs[j], yj = ys[j];
            
            var l = (xj-xi)*(xj-xi) + (yj-yi)*(yj-yi);
            var k = ((x-xi)*(xj-xi) + (y-yi)*(yj-yi))/l;
            var xt = k*(xj-xi)+xi;
            var yt = k*(yj-yi)+yi;
            
            if(Math.min(xi,xj)-eps <= xt && xt <= Math.max(xi,xj)+eps &&
               Math.min(yi,yj)-eps <= yt && yt <= Math.max(yi,yj)+eps) {
                thisdist = this.dist(x,y,xt,yt);
                if(thisdist<shortestDist) {
                    shortestDist = thisdist;
                    pt[0] = xt;
                    pt[1] = yt;
                    pt[2] = thisdist;
                }
            }
        }
        return pt;
    };
    
    // *******************************************
    // Private methods:
    // *******************************************
    
    // Remove first drawn point:
    this.RemoveFirstPoint = function () {
      if(this.point_id) {
	$('#'+this.point_id).remove();
	this.point_id = null;
      }
    };
    
    // Compute the L2 distance between two Cartesian points.
    this.dist = function (x0,y0,x1,y1) {
        return Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
    };
}
