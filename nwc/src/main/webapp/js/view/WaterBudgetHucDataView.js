/*jslint browser: true*/
/*global OpenLayers*/

var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc data page
 * @constructor extends NWC.BaseView
 */

NWC.view.WaterBudgetHucDataView = NWC.view.BaseView.extend({

	templateName : 'waterbudgetHucData',

	events: {
		'click #counties-button' : 'displayCountyMap',
		'click #compare-hucs-button' : 'goToAddHucMapPage',
		'click #units-btn-group button' : 'changeUnits',
		'click #time-scale-btn-group button' : 'changeTimeScale',
	},

	context : {
	},

	/*
	 * @constructs
	 * @param {Object} options
	 *     @prop {Jquery.Element} el - Container where this view will be rendered
	 *     @prop {Backbone.Router} router
	 *     @prop {String} hucId - Id of the huc for which information should be shown.
	 *     @prop {String} compareHucId (optional) - Huc Id used for second plot to compare to first.
	 *     @prop {String} fips (optional) - If specified, water use data for the county with fips will be shown.
	 */
	initialize : function(options) {
		var self = this;
		var $plotContainer;

		this.hucId = options.hucId;
		this.compareHucId = options.compareHucId ? options.compareHucId :'';
		this.fips = options.fips ? options.fips : '';

		this.context.showAdditionalDataButtons = !(this.compareHucId || this.fips);

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.setUpHucPlotModel();


		// Create additional sub views as needed
		$plotContainer = this.$('#huc-plot-container');
		if (this.compareHucId) {
			this.hucInsetMapView = new NWC.view.HucInsetMapView({
				el : this.$('.huc-inset-map-div'),
				hucId : this.hucId
			});

			this.compareHucInsetMapView = new NWC.view.HucInsetMapView({
				el : this.$('.comparehuc-inset-map-div'),
				hucId : this.compareHucId
			});

			this.plotView = new NWC.view.WaterbudgetPlotView({
				hucId : this.hucId,
				el : this.$('#huc-plotview-div'),
				model : this.hucPlotModel
			});
			this.comparePlotView = new NWC.view.WaterbudgetPlotView({
				hucId : this.compareHucId,
				el : this.$('#compare-plotview-div'),
				model : this.hucPlotModel
			});
		}
		else {
			this.hucInsetMapView = new NWC.view.HucInsetMapView({
				el : this.$('.huc-inset-map-container'),
				hucId : this.hucId
			});
			this.hucInsetMapView.hucFeatureLoadedPromise.done(function() {
				self.$('#counties-button').prop('disabled', false);
				self.$('#compare-hucs-button').prop('disabled', false);
			});

			this.plotView = new NWC.view.WaterbudgetPlotView({
				hucId : this.hucId,
				el : this.$('#huc-plot-container'),
				model : this.hucPlotModel
			});
		}

		if (this.fips) {
			this.countyWaterUseView = new NWC.view.CountyWaterUseView({
				hucId : this.hucId,
				fips : this.fips,
				el : this.$('#wateruse')
			});
		}
	},

	/*
	 * Creates a new hucPlotModel, sets up listeners and initializes the dom to reflect the default model
	 */
	setUpHucPlotModel : function() {
		this.hucPlotModel = new NWC.model.WaterBudgetHucPlotModel();
		this.listenTo(this.hucPlotModel, 'change:units', this.updateUnits);
		this.listenTo(this.hucPlotModel, 'change:timeScale', this.updateTimeScale);

		this.updateTimeScale();
		this.updateUnits();
	},

	/*
	 * Create the county map view.
	 */
	displayCountyMap : function() {
		this.hucCountyMapView = new NWC.view.HucCountyMapView({
			hucFeature : new OpenLayers.Feature.Vector(
					this.hucInsetMapView.hucLayer.features[0].geometry.clone(),
					this.hucInsetMapView.hucLayer.features[0].attributes),
			router : this.router,
			el : this.$('#county-selection-div')
		});
	},

	goToAddHucMapPage : function() {
		this.router.navigate('#!waterbudget/map/huc/' + this.hucId, {trigger: true});
	},

	changeUnits : function(ev) {
		ev.preventDefault();
		var newUnits = ev.target.value;
		this.hucPlotModel.set('units', newUnits);
	},

	updateUnits : function() {
		var newUnits = this.hucPlotModel.get('units');
		this.setButtonActive(this.$('#customary-button'), newUnits === 'usCustomary');
		this.setButtonActive(this.$('#metric-button'), newUnits === 'metric');
	},

	changeTimeScale : function(ev) {
		ev.preventDefault();
		var newTimeScale = ev.target.value;
		this.hucPlotModel.set('timeScale', newTimeScale);
	},

	updateTimeScale : function() {
		var newTimeScale = this.hucPlotModel.get('timeScale');
		this.setButtonActive(this.$('#daily-button'), newTimeScale === 'daily');
		this.setButtonActive(this.$('#monthly-button'), newTimeScale === 'monthly');
		this.setButtonActive(this.$('#annual-button'), newTimeScale === 'yearly');
	},

	remove : function() {
		this.hucInsetMapView.remove();
		if (Object.has(this, 'compareHucInsetMapView')) {
			this.compareHucInsetMapView.remove();
		}
		if (Object.has(this, 'hucCountyMapView')) {
			this.hucCountyMapView.remove();
		}
		this.plotView.remove();
		if (Object.has(this, 'comparePlotView')) {
			this.comparePlotView.remove();
		}

		if (Object.has(this, 'countyWaterUseView')) {
			this.countyWaterUseView.remove();
		}
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	}
});