// Dealing with object parts
// The functions here are called from object_list.js
//
// Antonio Torralba, 12 July 2013
/////////////////////////////////////////////////////////////////
// The functions are:
//   tree = getPartsTree(); // calls getFormatedTree(-1, -1) to start the tree from the root
//   tree = getFormatedTree(object_id, level); // like the previous one but specifiying starting point
//   addPart(object_id, part_id);
//   removePart(object_id, part_id);
//   childrens = getPartChildrens(object_id); Gets de list of parts recursively.
//   parent = getParent(object_id); (returns -1 if there is no parent)
//   wholeobjects_ids = getNonParts();
//
//   where object_id and part_id and polygon ids.
//
//   Other utilities:
//
//   parts = getParts(object_id); this not recursive. It just gets the parts just bellow the node object_id. Use getPartChildrens to get all the parts recursively.


function getPartsTree() {
    // tree  = getPartsTree()
    //    with tree[0] being an array of object IDs sorted
    //         tree[1] being the level (level = 0 for objects and >0 for parts)
    var tree;
        
    // Add part fields (this calls a funcion inside object_parts.js)
    //addPartFields(); // makes sure all the annotations have all the fields.

    // recursive tree call
    //tree = get_tree([], [], 0);
    tree = getFormatedTree(-1, -1);
    
    //alertParts("final");
    return tree;
}


// *******************************************
// The next function work with LM_xml directly:
// *******************************************

function addPartFields() {
    // makes sure all the annotations have all the fields
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
        
    for(var obj_i=0; obj_i < Npolygons; obj_i++) {
        var curr_obj = $(LM_xml).children("annotation").children("object").eq(obj_i);
        
        if (curr_obj.children("parts").length>0) {
            if (!curr_obj.children("parts").children("ispartof").length>0) {
                $(LM_xml).children("annotation").children("object").eq(obj_i).children("parts").append("<ispartof></ispartof>");
            }
            if (!curr_obj.children("parts").children("hasparts").length>0) {
                $(LM_xml).children("annotation").children("object").eq(obj_i).children("parts").append("<hasparts></hasparts>");
            }
        } else {
            $(LM_xml).children("annotation").children("object").eq(obj_i).append("<parts><hasparts></hasparts><ispartof></ispartof></parts>");
        }
    }
}



function addPart(object_id, part_id) {
    var parts;
    var childrens;
    //alertParts();
    //alert("inicio. object="+object_id+", part="+part_id);

    // If part_id is already a part in some other object, remove it from there.
    // A part can only be a children of a single polygon.
    //alertParts("inicio. object="+object_id+", part="+part_id);
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    //alert(Npolygons);
    for(var obj_i=0; obj_i < Npolygons; obj_i++) {
        removePart(obj_i, part_id);
    }
    //alertParts("quitar partes. Now this object "+part_id+" should not be a part");


    if (object_id!=-1){
        // check that no loop is being formed (the object_id can not be part of the part_id or in its childs)
        childrens = getPartChildrens(part_id);
        //alert("final children list of " +part_id + " is " +childrens);
        for (var i=0; i<childrens.length; i++) {
            removePart(childrens[i], object_id);
        }

        // alertParts("quitar loops. Now this object "+object_id+"should not be children of "+part_id);

        // If all is fine then concatenate to current list of parts.
        // first add it to the has parts list.
        var curr_obj = $(LM_xml).children("annotation").children("object").eq(object_id);
        if (curr_obj.children("parts").length>0) {
            parts = getParts(object_id);
            parts = parts.concat(part_id).sort();
            curr_obj.children("parts").children("hasparts").text(parts.toString());
        } else {
            curr_obj.append("<parts><hasparts>" + part_id + "</hasparts></parts>");
        }

        // Add isPartOf field (one object can only be part of another one):        
        var curr_part = $(LM_xml).children("annotation").children("object").eq(part_id);
        if (curr_part.children("parts").length>0) {
            if (curr_part.children("parts").children("ispartof").length>0) {
                curr_part.children("parts").children("ispartof").text(object_id.toString());
            } else {
                curr_part.children("parts").append("<ispartof>" + object_id + "</ispartof>");
            }
        } else {
            curr_part.append("<parts><ispartof>" + object_id + "</ispartof></parts>");
        }
    }
}


function removePart(object_id, part_id) {
    // Removes the polygon part_id from the part list of polygon object_id.
    // it deletes all the appropriate dependencies. 
    var parts = getParts(object_id);
    var remove=-1;
    //remove = parts.indexOf(part_id);
    for (var i=0; i<parts.length; i++){
        if (parts[i]==part_id){remove = i;}
    }
    //remove = jQuery.inArray(part_id, parts);
    //alert("parts="+parts.toString()+"; part to remove="+part_id+"; position="+remove);
    if (remove!=-1) {
        parts.splice(remove, 1);
        $(LM_xml).children("annotation").children("object").eq(object_id).children("parts").children("hasparts").text(parts.toString());
        $(LM_xml).children("annotation").children("object").eq(part_id).children("parts").children("ispartof").text("");
    }
}


function removeAllParts(object_id) {
    // Removes all the parts from polygon object_id by making them drop to the next parent.
    // This function is useful when deleting an object. It makes sure that all the parts that this object had become parts of the object parent.
    
    // first find parent of object_id
    parent_id = getParent(object_id);
    
    // then get list of parts
    var parts = getParts(object_id); // gets direct children
    
    // loop on parts and remove the parts from object_id
    for (var j=0; j<parts.length; j++) {
        removePart(object_id, parts[j]);
    }
    
    // then, if parent_id!=-1 then add all the parts as parts of parent_id
    if (parent_id!=-1) {
        for (var j=0; j<parts.length; j++) {
            addPart(parent_id, parts[j]);
        }
    }
}


function getPartChildrens(object_id) {
    // childrens = getPartChildrens(object_id);
    //    Gets de list of parts recursively.
    //    childrens [0] contains object_id. This will be the first element in the list.
    //    childrens [1,2,...] contain the parts
    var childrens = new Array();
    childrens[0] = object_id;
    
    var parts = getParts(object_id); // gets direct children
    // loop to get recursive list of parts
    for (var j=0; j<parts.length; j++) {
        var child_subtree = getPartChildrens(parts[j]);
        childrens = childrens.concat(child_subtree);
    }
    return childrens;
}



function getFormatedTree(object_id, level) {
    //     Recursive function to built the parts tree representation.
    //     The input is
    //        nodes = list of nodes (object ids) that exist
    //        parts = the parts array build with buildPartsArray()
    //        level = at which level in the tree we are when calling this function (for recursion)
    //     The output will be:
    //        with tree[0] being an array of object IDs sorted
    //             tree[1] being the level (level = 0 for objects and >0 for parts)
    //    
    //     Example:
    //     the output could be:
    //          var tree = [[3, 0, 1, 2], [0, 1, 1, 1]];
    var tree = new Array(2);
    var parts;
    tree[0] = new Array();
    tree[1] = new Array();
    
    if (object_id==-1) {
        parts = getNonParts();
        level = -1;
    } else {
        tree[0][0] = object_id;
        tree[1][0] = level;
        parts = getParts(object_id);
    }
    
    for (var j=0; j<parts.length; j++) {
        var child_subtree = getFormatedTree(parts[j], level+1);
        tree[0] = tree[0].concat(child_subtree[0]);
        tree[1] = tree[1].concat(child_subtree[1]);
    }
    
    //alert("object_id = "+object_id+"\n tree = ["+tree[0]+"]\n["+tree[1]+"]");
    return tree;
}


function getNonParts() {
    var nonparts = new Array();
    var listofparts = new Array();
    
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    for (var i=0; i<Npolygons; i++) {
        var parts = getParts(i);
        listofparts = listofparts.concat(parts);
    }
    
    for (var i=0; i<Npolygons; i++) {
        if (listofparts.indexOf(i)==-1) {
            nonparts.push(i);
        }
    }

    return nonparts;
}


function getParts(object_id){
    // var parts = [];
    
    // var tmp = LM_xml.getElementsByTagName('object')[object_id].getElementsByTagName('parts')[0].getElementsByTagName('hasparts')[0].innerHTML;
    // if (tmp.length>0) {
    //     // if it is not empty, split and trasnform to numbers
    //     parts = tmp.split(",");
    //     for (var j=0; j<parts.length; j++) {parts[j] = parseInt(parts[j], 10);}
    // }
    return LMgetObjectField(LM_xml, object_id, "parts");
}


function getParent(object_id){
    var parent = -1;
    var curr_obj = $(LM_xml).children("annotation").children("object").eq(object_id);

    if (curr_obj.children("parts").length>0 && curr_obj.children("parts").children("ispartof").length>0) {
        var tmp = curr_obj.children("parts").children("ispartof").text();
        if (tmp.length>0) {
            // if it is not empty, split and trasnform to numbers
            parent = parseInt(tmp, 10);
        }
    }
    return parent;
}


function alertParts(title) {
    var message = "PARTS:\n";
    var Npolygons = $(LM_xml).children("annotation").children("object").length;
    
    message += title +"\n";
    
    for (var i=0; i < Npolygons; i++) {
        parts = getParts(i);
        name = LMgetObjectField(LM_xml, i,"name");
        message += "object = "+name+" ("+i+") has parts = ["+parts.toString()+"]\n";
    }
        
    tree = getFormatedTree(-1, -1);
    
    //alertParts();
    message += "\n\n Final tree = ["+tree[0]+"],["+tree[1]+"]";
    alert(message);
}
