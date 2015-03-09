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
		var html = this.template(this.context);
		this.$el.html(html);

		return this;
	},

	/**
	 * @constructs
	 * @param Object} options
	 *		@prop router {Backbone.Router instance} - defaults to null
	 *		@prop template {Handlers template function} - defaults to loading the template from NWC.templates - this is useful for testing
	 *		@prop context {Object} to be used when rendering templateName - defaults to {}
	 * @returns NWC.view.BaseView
	 */
	initialize : function(options) {
		options = options || {};

		if (!this.context) {
			this.context = {};
		}
		if (options.context) {
			$.extend(this.context, options.context);
		}

		this.router = options.router || null;

		if (Object.has(options, 'template')) {
			this.template = options.template;
		}
		else {
			this.template = NWC.templates.getTemplate(this.templateName);
		}

		Backbone.View.prototype.initialize.apply(this, arguments);
		this.render();
	},

	/** COMMON navigation functions that might be used for many views */
	goHome: function() {
		this.router.navigate('home', {trigger: true});
	},
	goToWaterbudget: function() {
		this.router.navigate('waterbudget', {trigger: true});
	},

});


