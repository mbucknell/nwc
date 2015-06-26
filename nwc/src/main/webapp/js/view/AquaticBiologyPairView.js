/* global this */

var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologyPairView = NWC.view.BaseView.extend({
	
	templateName : 'aquaticBiologyPair',  
	
	events: {
		"click .dismiss-btn": "removePair",
		"change input": "updateComment"
    },
	/**
	 *
	 * @constructor
	 * @param {Object} options
	 *
	 *	@prop {Object} model.attributes - the model attributes to be inserted into the list template
	 */
	initialize : function(options) {
		this.listTemplate = NWC.templates.getTemplate(this.templateName);
		this.context = options.model.attributes;			
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);		
		this.listenTo(this.model, 'add', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
	},
	// contruct an autonomous html element with pair information and return that element
	render : function (){
		this.$el.html(this.listTemplate(this.context));
		return this;
	},
	
	removePair: function(){
		this.model.destroy();
    },
	
	updateComment: function(evt) {
		var target = evt.currentTarget;
		this.model.set("comment",target.value);
	}

	
});


