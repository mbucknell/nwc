var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.templateLoader = function() {

	var self = this;

	var templates = {};

	self.getTemplate = function(name) {
		if (Object.has(templates, name)) {
			return templates[name];
		}
		else {
			return null;
		}
	};

	self.loadTemplates = function(names) {
		var i;
		var loadingDeferreds = [];
		for (i = 0; i < names.length; i++) {
			templates[names[i]] = '';
			loadingDeferreds.push($.ajax({
				url : 'templates/' + names[i] + '.html',
				success : function(data) {
					templates[this] = Handlebars.compile(data);
				},
				error : function() {
					templates[this] = Handlebars.compile('Unable to load template');
				},
				context : names[i]
			}));
		}

		return $.when.apply(null, loadingDeferreds);
	};

	return self;
};

