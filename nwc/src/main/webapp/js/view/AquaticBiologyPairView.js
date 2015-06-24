/* global this */

var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologyPairView = NWC.view.BaseView.extend({
	
	templateName : 'aquaticBiologyPair',  
	
	Model : NWC.model.PairModel,
	
	events: {
		"click .dismiss-btn": "removePair",
		"change input": "updateComment"
    },

	initialize : function(options) {
		this.listTemplate = NWC.templates.getTemplate(this.templateName);
		this.context = options.model.attributes;			
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);		
		this.listenTo(this.model, 'add', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
	},
	
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


