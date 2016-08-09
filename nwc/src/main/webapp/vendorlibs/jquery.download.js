/*
 * --------------------------------------------------------------------
 * jQuery-Plugin - $.download - allows for simple get/post requests for files
 * by Scott Jehl, scott@filamentgroup.com
 * http://www.filamentgroup.com
 * reference article: http://www.filamentgroup.com/lab/jquery_plugin_for_requesting_ajax_like_file_downloads/
 * Copyright (c) 2008 Filament Group, Inc
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 * --------------------------------------------------------------------
 */

jQuery.download = function(url, data, method){
	//url and data options required
	if( url && data ){
		//data object which are key value pairs
		var inputs = '';
		var key;
		if (typeof data == 'string') {
			var paramArray = data.split('&');
			data = {};
			paramArray.forEach(function(param) {
				var paramSplit = param.split('=');
				data[paramSplit[0]] = paramSplit[1];
			});
		}
		for (key in data) {
			inputs+='<input type="hidden" name="'+ key +'" value="'+ data[key] +'" />';
		}

		//send request
		jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		.appendTo('body').submit().remove();
	};
};



