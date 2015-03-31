function widget(object_id, dom_types){
	this.id = object_id;
	this.dom_ids = new Array();
	this.dom_types = new Array();

	this.RenderWidget = function(canvas_dom_id, options){
		for (var i = 0; i < this.dom_types.length; i++){
			var res;
			switch (this.dom_types[i]){
				case 'point':
					var xp = LMgetObjectField(LM_xml, this.anno_id, 'x');
					var yp = LMgetObjectField(LM_xml, this.anno_id, 'y');
					res = DrawPoint(canvas_dom_id,xp[0],yp[0],'r="6" fill="#00ff00" stroke="#ffffff" stroke-width="3"',main_media.GetImRatio());
					break;
				case 'flag':
					var obj_name = LMgetObjectField(LM_xml, this.anno_id, 'name');
					var xp = LMgetObjectField(LM_xml, this.anno_id, 'x');
					var yp = LMgetObjectField(LM_xml, this.anno_id, 'y');
					res = DrawFlag(canvas_dom_id,xp[0],yp[0],obj_name,main_media.GetImRatio());
					break;
				// I guess this function does not make sense here case 'poly-line':
				// 	break;
				case 'polygon':
					var attr = 'fill="none" stroke="' + HashObjectColor(obj_name) + '" stroke-width="4"';
					var obj_name = LMgetObjectField(LM_xml, this.anno_id, 'name');
					var xp = LMgetObjectField(LM_xml, this.anno_id, 'x');
					var yp = LMgetObjectField(LM_xml, this.anno_id, 'y');
					res = DrawPolygon(canvas_dom_id,xp,yp,obj_name,attr,main_media.GetImRatio());
					if (options == 'fill') FillPolygon(res);
					break;
				default: break;
				
			}
			this.dom_ids.push(res);
		}
	};

	this.ClearWidget = function (){
		for (var i = 0; i < this.dom_ids.length; i++){
			$('#'+this.dom_ids[i]).remove();
		}
	};


};