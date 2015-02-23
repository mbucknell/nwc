var NWC = NWC || {};

NWC.controller = NWC.controller || {};



NWC.controller.NWCRouter = Backbone.Router.extend({

	routes: {
		'' : 'home'
	},
	constructor : function(options) {
		Backbone.Router.prototype.constructor.call(this, options);
		var key;
		for (key in NWC.workflows) {
			this.route(NWC.workflows[key].uri, key, NWC.workflows[key].render);
		}
	},

	home : function() {
		this.showView(NWC.view.HomeView, {});
	},

	showView : function(view, opts) {
		this.removeCurrentView();
		this.currentView = new view($.extend({
			el: document.getElementById('site_content'),
			router: this
		}, opts));
	},
	removeCurrentView : function() {
		if (this.currentView) {
			this.currentView.remove();
		}
	}
});

