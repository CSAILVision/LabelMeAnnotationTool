// Here is all the code that builds the list of objects on the right hand side of the Labelme tool
//
// The styles for this tools are defined inside /css/object_list.css
///////////////////////////////////////////////////////////////////////////////////////////////////


// This function creates and pupulates the list 
function LoadAnnotationList() {
    var html_str = '<div class="object_list" id="anno_list">';
    
    Npolygons = main_canvas.GetAnnotations().length;
    NundeletedPolygons = 0;
    // count undeleted object
    for(ii=0; ii < Npolygons; ii++) {
        if (!main_canvas.GetAnnotations()[ii].GetDeleted()) {NundeletedPolygons += 1;}
    }    

    html_str += '<b>Polygons in this image ('+ NundeletedPolygons +')</b>';
    html_str += '<ol>';
    
    
    // Show list (of non-deleted objects)
    for(ii=0; ii < Npolygons; ii++) {
        
        var isDeleted = main_canvas.GetAnnotations()[ii].GetDeleted();
        
        if(((ii<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || ((ii>=num_orig_anno)&&(!isDeleted||(isDeleted&&view_Deleted)))) {
            html_str += '<div id="LinkAnchor' + ii + '">';
            
            html_str += '<li><a id="Link' + ii + '" href="javascript:main_handler.AnnotationLinkClick('+ii+');" '+
                        'onmouseover="javascript:main_handler.AnnotationLinkMouseOver('+ii+');" ' +
                        'onmouseout="javascript:main_handler.AnnotationLinkMouseOut();"';
            
            if(isDeleted)
                html_str += ' style="color:#888888"><b>';
            else
                html_str += '>';
            
            if(main_canvas.GetAnnotations()[ii].GetObjName().length==0 && !main_draw_canvas.GetAnnotation()) {
                html_str += '<i>[ Please enter name ]</i>';
            }
            else {
                html_str += main_canvas.GetAnnotations()[ii].GetObjName();
            }
            
            if(isDeleted) html_str += '</b>';
            html_str += '</a>';
            
            if(main_canvas.GetAnnotations()[ii].GetAttributes().length>0) {
                html_str += ' (' + main_canvas.GetAnnotations()[ii].GetAttributes() +')';
            }

            html_str += '</li></div>';
        }
    }
    
    html_str += '</ol></div>';
    
    InsertAfterDiv(html_str,'anno_anchor');
    
}




function RemoveAnnotationList() {
    var p = document.getElementById('anno_list');
    if(p) {
        p.parentNode.removeChild(p);
    }
}


