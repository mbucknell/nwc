/*jslint  browser: true */
/*global CONFIG */

var NWC = NWC || {};

NWC.view = NWC.view || {};

(function() {
	"use strict";

	NWC.view.StreamflowStatsCalculateStatsView = Backbone.View.extend({

		templateName : 'streamflowCalcStats',
		
		/*
		 * @constructs
		 * @param {Object} options
		 *     @prop {Jquery element} el - this is where the list will be rendered
		 *     @prop {object} streamStatsOptions - this is the list of stat types
		 *     @prop {object} years (optional) - when using the streamflowHucStats view
		 */
		initialize : function(options){
			if (!Object.has(this, 'context')) {
				this.context = {};
			}
//			this.context.streamStatsOptions = NWC.dictionary.statGroups;
//			this.context.years = options.years;
			this.template = NWC.templates.getTemplate(this.templateName);
			Backbone.View.prototype.initialize.apply(this, arguments);
			this.context = {
					streamStatsOptions : NWC.dictionary.statGroups,
					years : options.years
				};
			this.$el.html(this.template(this.context));
		}
	});
}());


