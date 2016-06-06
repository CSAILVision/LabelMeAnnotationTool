// annotation class
// Keeps track of all information related to an individual annotation.

function annotation(anno_id) {
    
    // *******************************************
    // Private variables:
    // *******************************************
    this.anno_id = anno_id;
    this.div_attach = 'myCanvas_bg';
    this.hidden = false;
    this.scribble;

    /*************************************************************/
    /*************************************************************/
    // Scribble: Private variables that have been added.

    // 0 means that it is a polygon. 1 means it is a mask.
    // mask URL indicates, in case we have a mask, the URL of its image
    this.anno_type = 0;
    this.bounding_box = false;
    // Info about the image in case of being a segm annotation
    
    
    /*************************************************************/
    /*************************************************************/

    // Element id of drawn polygon:
    this.polygon_id = null;

    // Element ids of drawn line segments:
    this.line_ids = null;

    // Element id for drawn first point:
    this.point_id = null;

    // Element id for drawn mask
    this.mask_id = null; 
    
    // *******************************************
    // Public methods:
    // *******************************************

    /*************************************************************/
    /*************************************************************/
    // Scribble: Public methods that have been added.

    // Type of the annotation (0 - polygon, 1 - segmentation)
    this.GetType = function (){
        return this.anno_type;
    };

    this.SetType = function (type){
        this.anno_type = type;
    };
    /*************************************************************/
    /*************************************************************/

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
        if (video_mode) return LMgetObjectField(LM_xml, this.anno_id, 'x', oVP.getcurrentFrame());
        else {
            if (this.anno_type == 0) return LMgetObjectField(LM_xml, this.anno_id, 'x');
            else {
                var arr = LMgetObjectField(LM_xml, this.anno_id,'bboxcorners');
                return [arr[0], arr[2], arr[2], arr[0]];
            }
        }
    };
    
    
    // Get the array of Y control points.
    this.GetPtsY = function () {
        if (video_mode) return LMgetObjectField(LM_xml, this.anno_id, 'y', oVP.getcurrentFrame()); 
        else {
            if (this.anno_type == 0) return LMgetObjectField(LM_xml, this.anno_id, 'y');
            else {
                var arr = LMgetObjectField(LM_xml, this.anno_id,'bboxcorners');
                return [arr[1], arr[1], arr[3], arr[3]];
            }
        }
    };
    
    
    // Set attribute of drawn polygon.
    this.SetAttribute = function(field,value) {
        $('#'+this.polygon_id).attr(field,value);
    };
    
    // Set CSS attribute of drawn polygon.
    this.SetCSS = function(field,value) {
        $('#'+this.polygon_id).css(field,value);
    };

    // Render the annotation (shape + action) given the action_type (e.g. rest).
    this.RenderAnnotation = function (action_type) {
        // Render the shape:
        this.DrawPolygon(main_media.GetImRatio(), this.GetPtsX(), this.GetPtsY());
        // Set shape actions:
        switch(action_type) {
            case 'rest':
                this.SetAttribute('onmousedown','StartEditEvent(' + this.anno_id + ',evt); return false;');
                this.SetAttribute('onmousemove','main_handler.CanvasMouseMove(evt,'+ this.anno_id +'); return false;');
                this.SetAttribute('oncontextmenu','return false');
                this.SetCSS('cursor','pointer');
                break;
            default:
            alert('Unknown action_type');
        }
    };

    // TO DO: Eventually rename this as "RenderShape()"
    // Draw a polygon given this annotation's control points.
    this.DrawPolygon = function (im_ratio, xp, yp) {
        var obj_name = LMgetObjectField(LM_xml,this.anno_id,'name');

        // Determine if an angle has been labeled:
        var strtok = obj_name.split(/ /);
        var isAngle = 0;
        for(var i = 0; i < strtok.length; i++) if(strtok[i]=='angle') isAngle = 1;
      
        if(xp.length==1) {
            this.polygon_id = DrawFlag(this.div_attach,xp[0],yp[0],obj_name,im_ratio);
        }
        else if((xp.length==3) && isAngle) {
            var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
            this.polygon_id = DrawPolyLine(this.div_attach,xp,yp,obj_name,attr,im_ratio);
        }
        else if(this.GetAutomatic()==1) {
            // Draw a dashed polygon:
            var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4" stroke-dasharray="9,5"';
            this.polygon_id = DrawPolygon(this.div_attach,xp,yp,obj_name,attr,im_ratio);
        }
        else {
            // Draw a polygon:
            var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
            this.polygon_id = DrawPolygon(this.div_attach,xp,yp,obj_name,attr,im_ratio);
        }
        return this.polygon_id;
    };
    
    // Draw a poly-line given this annotation's control points (i.e.
    // don't connect the last point to the first point).  This function
    // is used when we zoom, close the "what is this object?" popup bubble, 
    // or start a new polygon.
    this.DrawPolyLine = function (xp, yp) {
        // Draw line segments:
        var im_ratio = main_media.GetImRatio();
        this.line_ids = Array();
        for(var i = 0; i < xp.length-1; i++) {
            // Draw line segment:
            this.line_ids.push(DrawLineSegment(this.div_attach, xp[i],yp[i],xp[i+1],yp[i+1],'stroke="#0000ff" stroke-width="4"',im_ratio));

            // Set cursor to be crosshair on line segment:
            $('#'+this.line_ids[i]).css('cursor','crosshair');
        }

          // Draw first point:
          if(this.point_id) $('#'+this.point_id).remove();
          this.point_id = DrawPoint(this.div_attach,xp[0],yp[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',im_ratio);

          // Set cursor to be pointer when user hovers over point:
          $('#'+this.point_id).css('cursor','pointer');

          // Set actions for first point:
          $('#'+this.point_id).attr('onmousedown','DrawCanvasClosePolygon();');
          $('#'+this.point_id).attr('onmouseover',"$('#'+draw_anno.point_id).attr('r',8,'stroke-width',4);");
          $('#'+this.point_id).attr('onmouseout',"if(draw_anno) {$('#'+draw_anno.point_id).attr('r',6,'stroke-width',3);}");
    };
    
    // Deletes the annotation's polygon from the screen.
    this.DeletePolygon = function () {
      // Remove drawn polygon:
        if(this.polygon_id) {
            console.log('deleting polygon: ',this.polygon_id);
            $('#'+this.polygon_id).parent().remove();
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
        //var id = 'object'+($('#'+'myCanvas_bg').children().length)+"_mask";
        ClearMask(this.mask_id);
        /*************************************************************/
        /*************************************************************/
      
        // Remove first drawn point:
        this.RemoveFirstPoint();
    };
    
    // Deletes the last control point that the user entered.
    this.DeleteLastControlPoint = function () {
        if(draw_x.length>1) {
            var l = this.line_ids.length;
            $('#'+this.line_ids[l-1]).remove();
            this.line_ids = this.line_ids.slice(0,l-1);
            // Remove last point from polygon array:
            var l = draw_x.length;
            draw_x = draw_x.slice(0,l-1);
            draw_y = draw_y.slice(0,l-1);

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
            this.mask_id = DrawSegmentation('myCanvas_bg',this.scribble.GetMaskURL(), main_media.width_curr, main_media.height_curr, this.scribble.cache_random_number);
        }
        /*************************************************************/
        /*************************************************************/
    };
    this.ShadePolygon = function(){
        ShadePolygon(this.polygon_id);
    }
    
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
            //var id = 'object'+($('#'+this.div_attach).children().length-1)+"_mask";
            ClearMask(this.mask_id);
        }
        /*************************************************************/
        /*************************************************************/
    };
    
    // Returns the closest point to (x,y) that lies along the boundary of
    // the polygon.
    this.ClosestPoint = function (x,y) {
        var eps = 1e-3;
        var shortestDist = Infinity;
        var pt = new Array(3);
        var xs = this.GetPtsX();
        var ys = this.GetPtsY();
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
