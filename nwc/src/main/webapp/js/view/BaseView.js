var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View which should be extended to implement a view which renders using a template.
 * When extending, the templateName should be the name of a template that was preloaded.
 * @constructor
 */
NWC.view.BaseView = Backbone.View.extend({

	templateName : '',


	/**
	 * Renders the object's template using it's context into the view's element.
	 * @returns {BaseViewAnonym$0}
	 */
	render : function() {
		var html = NWC.templates.getTemplate(this.templateName)(this.context);
		this.$el.html(html);

		return this;
	},

	/**
	 * @constructs
	 * @param Object} options
	 *		@prop router {Backbone.Router instance} - defaults to null
	 *		@prop context {Object} to be used when rendering templateName - defaults to {}
	 * @returns NWC.view.BaseView
	 */
	initialize : function(options) {
		options = options || {};

		this.router = options.router || null;
		if (Object.has(options, 'context')) {
			this.context = options.context;
		}
		else {
			this.context = {};
		}
		Backbone.View.prototype.initialize.apply(this, arguments);
		this.render();
	}

});


