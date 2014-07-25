// Here is all the code that builds the list of objects on the right hand side of the Labelme tool
//
// The styles for this tools are defined inside /css/object_list.css
///////////////////////////////////////////////////////////////////////////////////////////////////


// This function creates and pupulates the list 
function LoadAnnotationList() {
    var html_str = '<div class="object_list" id="anno_list" style="border:0px solid black;z-index:0;" '+
                    'ondrop="drop(event, -1)" '+
                    'ondragenter="return dragEnter(event)" '+
                    'ondragover="return dragOver(event)"'+
                   '>';
    
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    var NundeletedPolygons = 0;
    // count undeleted object
    for(var ii=0; ii < Npolygons; ii++) {
        if (!AllAnnotations[ii].GetDeleted()) {NundeletedPolygons += 1;}
    }
    
    // Get parts tree
    var tree = getPartsTree();

    // Create DIV
    html_str += '<b>Polygons in this image ('+ NundeletedPolygons +')</b>';
    if (use_parts){
       html_str += '<p style="font-size:10px;line-height:100%" '+
                    'ondrop="drop(event, -1)" '+
                    'ondragenter="return dragEnter(event)" '+
                    'ondragover="return dragOver(event)">'+
                    'Drag a tag on top of another one to create a part-of relationship.</p>';
    }
    html_str += '<ol>';
        
    // Show list (of non-deleted objects)
    for(var i=0; i < Npolygons; i++) {
        // get part level and read objects in the order given by the parts tree
        
        if (use_parts){
            var ii = tree[0][i];
            var level = tree[1][i];
        } else {
            var ii = i;
            var level = 0;
        }
        //alert("level="+level + "; node_i=" + ii);

        var isDeleted = AllAnnotations[ii].GetDeleted();
        
        if(((ii<num_orig_anno)&&((view_Existing&&!isDeleted)||(isDeleted&&view_Deleted))) || ((ii>=num_orig_anno)&&(!isDeleted||(isDeleted&&view_Deleted)))) {
            
            // change the left margin as a function of part level
            html_str += '<div class="objectListLink" id="LinkAnchor' + ii + '" style="z-index:1; margin-left:'+ (level*1.5) +'em" '; // oncontextmenu="return false;"
            
            if (use_parts) {
                // define drag events (but only if the tool is allowed to use parts)
                html_str += 'draggable="true" ondragstart="drag(event, '+ii+')" '+
                            'ondragend="dragend(event, '+ii+')" '+
                            'ondrop="drop(event, '+ii+')" '+
                            'ondragenter="return dragEnter(event)" '+
                            'ondragover="return dragOver(event)">'; // ondragleave="drop(event, -1)"
            }
            
            // change the icon for parts
            if (level==0){
                // if it is not a part, show square
                html_str += '<li>';
            } else {
                // if it is a part, use part style
                html_str += '<li class="children_tree">';
            }
            
            // show object name:
            html_str += '<a class="objectListLink"  id="Link' + ii + '" '+
            'href="javascript:main_handler.AnnotationLinkClick('+ii+');" '+
            'onmouseover="main_handler.AnnotationLinkMouseOver('+ii+');" ' +
            'onmouseout="main_handler.AnnotationLinkMouseOut();" ';
            
            if (use_parts) {
                html_str += 'ondrop="drop(event, '+ii+')" '+
                            'ondragend="dragend(event, '+ii+')" '+
                            'ondragenter="return dragEnter(event)" '+
                            'ondragover="return dragOver(event)"';
            }

            if(isDeleted)
                html_str += ' style="color:#888888"><b>';
            else
                html_str += '>';
            
            if(AllAnnotations[ii].GetObjName().length==0 && !draw_anno) {
                html_str += '<i>[ Please enter name ]</i>';
            }
            else {
                html_str += AllAnnotations[ii].GetObjName();
            }
            
            if(isDeleted) html_str += '</b>';
            html_str += '</a>';
            
            if(AllAnnotations[ii].GetAttributes().length>0) {
                html_str += ' (' + AllAnnotations[ii].GetAttributes() +')';
            }

            html_str += '</li></div>';
        }
    }
    
    html_str += '</ol><p><br/></p></div>';
    // Attach annotation list to 'anno_anchor' DIV element:
    $('#anno_anchor').append(html_str);
}




function RemoveAnnotationList() {
    var p = document.getElementById('anno_list');
    if(p) {
        p.parentNode.removeChild(p);
    }
}


// *******************************************
// Private functions:
// *******************************************

// DRAG FUNCTIONS

function drag(event, part_id)
{
    // stores the object id in the data that is being dragged.
    event.dataTransfer.setData("Text", part_id);
}

function dragend(event, object_id)
{
    event.preventDefault();
    //var part_id=event.dataTransfer.getData("Text");
   //alert('object ' + object_id + ' Part_id=' + part_id);
 
    // Modify part structure and draw object list
    //if (object_id!=part_id){
    //    addPart(object_id, part_id);
    //    RemoveAnnotationList();
    //    LoadAnnotationList();
    //}
   // Write XML to server:
    WriteXML(SubmitXmlUrl,LM_xml,function(){return;});
}

function dragEnter(event) 
{
event.preventDefault();
return true;
}

function dragOver(event)
{
event.preventDefault();
}

function drop(event, object_id)
{
    event.preventDefault();
    var part_id=event.dataTransfer.getData("Text");
    event.stopPropagation();
    
    //alert('DROP: '+ object_id+', part='+part_id);

    // modify part structure
    if (object_id!=part_id){
        addPart(object_id, part_id);
        
        // redraw object list
        RemoveAnnotationList();
        LoadAnnotationList();
    }
}

