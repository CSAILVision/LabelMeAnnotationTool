/** @file This file contains functions for reading attributes of an xml. 
*/

/** Gets a field for an object from an xml. If frame value is provided, it gives the field at the given.
  * @param {string} xml - The xml containing the annotations
  * @param {int} ind_object - Index to the object to be displayed
  * @param {string} name - name of the field to return.
  * @param {int} frame - frame of interest
*/
function LMgetObjectField(xml,ind_object, name, frame) {
	var obj = $(xml).children("annotation").children("object").eq(ind_object);
	if (obj.length == 0) return "";
	if (name == 'name' ||  name == 'attributes' || name == 'occluded'){
		if (!obj.children(name).length > 0) return "";
		else return obj.children(name).text();
	}
	if (name == 'type'){
		if (obj.children("segm").length > 0) return 'segmentation';
		else if (obj.children(name).length > 0) return 'bounding_box';
		else return 'polygon';
	}
	if (name == 'deleted' || name == 'verified' || name == 'automatic'){
		if (!obj.children(name).length > 0) return "";
		else return parseInt(obj.children(name).text());
	}
    if (name == 'username'){
        if (obj.children("segm").length > 0 && obj.children("segm").children("username").length > 0) obj.children("segm").children("username").text();
        else if (obj.children("polygon").children("username").length > 0) return obj.children("polygon").children("username").text();
        return "";
    }
    if (name == 'parts'){
        parts = [];
        if (obj.children("parts").length>0) {
            tmp = obj.children("parts").children("hasparts").text();
            if (tmp.length>0) {
                // if it is not empty, split and trasnform to numbers
                parts = tmp.split(",");
                for (var j=0; j<parts.length; j++) {parts[j] = parseInt(parts[j], 10);}
            }
        }
        return parts;
    }
	if (name == 'x' || name == 'y'){
		if (frame){
			var framestamps = (obj.children("polygon").children("t").text()).split(',');
          	for(var ti=0; ti<framestamps.length; ti++) { framestamps[ti] = parseInt(framestamps[ti], 10); } 
          	var objectind = framestamps.indexOf(frame);
            if (objectind == -1) return [];
			var coords = ((obj.children("polygon").children(name).text()).split(';')[objectind]).split(',');
			for(var ti=0; ti<coords.length; ti++) { coords[ti] = parseInt(coords[ti], 10); }
			return coords;	

		}
		else {
			if (obj.children("polygon").length == 0) return null;
			var pt_elts = obj.children("polygon")[0].getElementsByTagName("pt");
			if (pt_elts){
				var coord = Array(pt_elts.length);
				for (var ii=0; ii < coord.length; ii++){

					coord[ii] = parseInt(pt_elts[ii].getElementsByTagName(name)[0].firstChild.nodeValue);
				} 
				return coord;
			}
		}
	}
	if (name == 't'){
		var framestamps = (obj.children("polygon").children("t").text()).split(',');
        for(var ti=0; ti<framestamps.length; ti++) { framestamps[ti] = parseInt(framestamps[ti], 10); } 
        return framestamps;
	}
	if (name == 'userlabeled'){
		if(obj.children("polygon").children("userlabeled").length == 0) return [];
		var framestamps = (obj.children("polygon").children("userlabeled").text()).split(',');
        for(var ti=0; ti<framestamps.length; ti++) { framestamps[ti] = parseInt(framestamps[ti], 10); } 
        return framestamps;
	}
	if (name == 'mask_name'){
		return obj[0].getElementsByTagName("segm")[0].getElementsByTagName("mask")[0].firstChild.nodeValue
	}
	if (name == 'scribble_name'){
		return obj[0].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("scribble_name")[0].firstChild.nodeValue;
	}
	if (name == 'imagecorners'){
		var corners = new Array(4);
		corners[0] = parseInt(obj[0].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("xmin")[0].firstChild.nodeValue);
		corners[1] = parseInt(obj[0].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("ymin")[0].firstChild.nodeValue);
		corners[2] = parseInt(obj[0].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("xmax")[0].firstChild.nodeValue);
		corners[3] = parseInt(obj[0].getElementsByTagName("segm")[0].getElementsByTagName("scribbles")[0].getElementsByTagName("ymax")[0].firstChild.nodeValue);
		return corners;
	
	}
	if (name == 'bboxcorners'){
		var corners = new Array(4);
		corners[0] = parseInt (obj[0].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("xmin")[0].firstChild.nodeValue);
      	corners[1] = parseInt (obj[0].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("ymin")[0].firstChild.nodeValue);
      	corners[2] = parseInt (obj[0].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("xmax")[0].firstChild.nodeValue);
      	corners[3] = parseInt (obj[0].getElementsByTagName("segm")[0].getElementsByTagName("box")[0].getElementsByTagName("ymax")[0].firstChild.nodeValue);
      	return corners;	
  
	}
	return null;


}

/** Returns number of LabelMe objects. */
function LMnumberOfObjects(xml) {
    return xml.getElementsByTagName('object').length;
}

/** Sets a field for an object from an xml. 
  * @param {string} xml - The xml containing the annotations
  * @param {int} ind_object - Index to the object to be set
  * @param {string} name - name of the field to set.
  * @param {string} value - value to which the object will be set
*/
function LMsetObjectField(xml, ind_object, name, value){
	var obj = $(xml).children("annotation").children("object").eq(ind_object);
	if (name == 'name' || name == 'automatic' || name == 'attributes' || name == 'occluded' || name == 'deleted' || name == 'id'){
		if (obj.children(name).length > 0) obj.children(name).text(value);
		else if (name != 'automatic') obj.append("<"+name+">"+value+"</"+name+">");
	}
	if (name == 'username'){
		if (obj.children("polygon").length == 0 && obj.children("segm").children("username").length == 0) obj.children("segm").append($("<username>anonymous</username>"));
		else if (obj.children("polygon").length > 0 && obj.children("polygon").children("username").length == 0) obj.children("polygon").append($("<username>anonymous</username>"));
	}
	if (name == 'x' || name == 'y' || name == 't' || name == 'userlabeled'){
		if (obj.children("polygon").children("t").length > 0){
			obj.children("polygon").children(name).text(value);
		}
		else {
			for (var ii = 0; ii < value.length; ii++){
				obj.children("polygon").children("pt").eq(ii).children(name).text(value[ii]);
			}			   	
		}
	}

}


