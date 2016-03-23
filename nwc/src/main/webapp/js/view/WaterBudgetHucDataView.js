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
		'click #accumulated-button' : 'goToAccumulatedPage',
		'click #compare-hucs-button' : 'goToAddHucMapPage',
		'click #units-btn-group button' : 'changeUnits',
		'click #time-scale-btn-group button' : 'changeTimeScale'
	},

	context : {
	},

	/*
	 * @constructs
	 * @param {Object} options
	 *     @prop {Jquery.Element} el - Container where this view will be rendered
	 *     @prop {Backbone.Router} router
	 *     @prop {Boolean} accumulated - false indicates if this is local watershed, true indicates accumulated.
	 *     @prop {String} hucId - Id of the huc for which information should be shown.
	 *     @prop {String} compareHucId (optional) - Huc Id used for second plot to compare to first.
	 *     @prop {String} fips (optional) - If specified, water use data for the county with fips will be shown.
	 */
	initialize : function(options) {
		var self = this;
		var $plotContainer;

		var accumulated = options.accumulated ? options.accumulated : false;
		var compareHucId = options.compareHucId ? options.compareHucId :'';
		var fips = options.fips ? options.fips : '';

		var watershedGages = NWC.config.get('watershedGages');
		var gageId = accumulated ? watershedGages.getGageId(options.hucId) : '';
		var compareGageId = compareHucId ? watershedGages.getGageId(compareHucId) : '';
		var $hucInsetMapContainer;

		// These will be promises that will be resolved when it's ok to initialize the plot view
		var readyToLoadPlotView, readyToLoadComparePlotView;

		this.hucId = options.hucId;

		this.context = {
			showAdditionalDataButtons : !(compareHucId || fips),
			featureToggles : NWC.config.get('featureToggles'),
			showWaterUseButton : !accumulated,
			showAccumulatedButton : (!accumulated) && (this.hucId.length === 12)
		};

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.setUpHucPlotModel();

		/*	Create additional sub views as needed
		*	There are four variations of how this view is used
		*	and the sub views are adjusted accordingly
		*/
		$plotContainer = this.$('#huc-plot-container');
		$hucInsetMapContainer = (compareHucId) ? this.$('.huc-inset-map-div') : this.$('.huc-inset-map-container');
		
		// Render the huc inset map view and plotView
		this.hucInsetMapView = new NWC.view.HucInsetMapView({
			el : $hucInsetMapContainer,
			accumulated : accumulated,
			compare : false,
			hucId : this.hucId,
			gageId : gageId,
			model : this.hucPlotModel
		});

		readyToLoadPlotView = accumulated ? this.hucInsetMapView.featureLoadedPromise : $.Deferred().resolve();
		readyToLoadPlotView.done(function() {
			self.plotView = new NWC.view.WaterbudgetPlotView({
				accumulated : accumulated,
				compare : false,
				hucId : self.hucId,
				gageId : gageId,
				el : self.$('#huc-plotview-div'),
				model : self.hucPlotModel
			});
		});

		this.hucInsetMapView.featureLoadedPromise.done(function() {
			self.$('#accumulated-button').prop('disabled', accumulated);
			self.$('#counties-button').prop('disabled', accumulated);
			self.$('#compare-hucs-button').prop('disabled', false);
		});

		if (compareHucId) {
			this.compareHucInsetMapView = new NWC.view.HucInsetMapView({
				el : this.$('.comparehuc-inset-map-div'),
				accumulated : accumulated,
				compare : true,
				hucId : compareHucId,
				gageId : compareGageId,
				model : self.hucPlotModel
			});
			readyToLoadComparePlotView = accumulated ? this.compareHucInsetMapView.featureLoadedPromise : $.Deferred().resolve();
			readyToLoadComparePlotView.done(function() {
				self.comparePlotView = new NWC.view.WaterbudgetPlotView({
					accumulated : accumulated,
					compare : true,
					hucId : compareHucId,
					gageId : compareGageId,
					el : self.$('#compare-plotview-div'),
					model : self.hucPlotModel
				});
			});
		}

		if (fips) {
			this.countyWaterUseView = new NWC.view.CountyWaterUseView({
				hucId : this.hucId,
				fips : fips,
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
			huc : this.hucId,
			hucFeature : new OpenLayers.Feature.Vector(
					this.hucInsetMapView.hucLayer.features[0].geometry.clone(),
					this.hucInsetMapView.hucLayer.features[0].attributes),
			router : this.router,
			el : this.$('#county-selection-div')
		});
	},

	goToAccumulatedPage : function() {
		this.router.navigate('#!waterbudget/achuc/' + this.hucId, {trigger: true});
	},

	goToAddHucMapPage : function() {
		if (this.accumulated) {
			this.router.navigate('#!waterbudget/acmap/huc/' + this.hucId, {trigger: true});
		}
		else {
			this.router.navigate('#!waterbudget/map/huc/' + this.hucId, {trigger: true});
		}
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