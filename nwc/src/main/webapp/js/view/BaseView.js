var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * view which should be extended to implement the page view
 * @constructor
 * @param {Object} options
 *		@prop templateName {String} should always be provided
 *		@prop context {Object} to be used when rendering templateName
 *		@prop el {HtmlElement} defaults to #site_content
 */
NWC.view.BaseView = Backbone.View.extend({

	el : document.getElementById('site_content'),

	templateName : '',


	render : function() {
		var html = NWC.templates.getTemplate(this.templateName)(this.context || {});
		this.$el.html(html);
	},

	initialize : function(options) {
		Backbone.View.prototype.initialize.apply(this, arguments);
		this.render();
	}

});


