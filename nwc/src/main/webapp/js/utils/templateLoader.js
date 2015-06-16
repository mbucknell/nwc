/*jslint browser:true */
/*global Handlebars*/
/*global $*/

var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.templateLoader = function() {
	"use strict";

	var self = {};

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

	self.registerPartials = function(names) {
		var i;
		var loadingDeferreds = [];
		for (i = 0; i < names.length; i++) {
			loadingDeferreds.push($.ajax({
				url : 'templates/partials/' + names[i] + '.html',
				success : function(data) {
					Handlebars.registerPartial(this, data);
				},
				error : function() {
					Handlebars.registerPartial(this, 'Can\'t retrieve partial template');
				},
				context : names[i]
			}));
		}
		return $.when.apply(null, loadingDeferreds);
	};

	self.registerHelpers = function() {
		Handlebars.registerHelper({
			'ifTypeIsWebLink' : function(type, options) {
				if (type === 'webLink') {
					return options.fn(this);
				}
				else {
					return options.inverse(this);
				}
			},

			'ifTypeIsBrowseImage' : function(type, options) {
				if (type === 'browseImage') {
					return options.fn(this);
				}
				else {
					return options.inverse(this);
				}
			},

			'ifTypeIsPublication' : function(type, options) {
				if (type === 'Publication') {
					return options.fn(this);
				}
				else {
					return options.inverse(this);
				}
			},
			'ifFacetIsCitation' : function(facet, options) {
				if (facet === 'gov.sciencebase.catalog.item.facet.CitationFacet') {
					return options.fn(this);
				}
				else {
					return options.inverse(this);
				}
			}
		});
	};

	return self;
};

