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
		var $plotContainer;

		this.hucId = options.hucId;
		this.compareHucId = options.compareHucId ? options.compareHucId :'';
		this.fips = options.fips ? options.fips : '';
		this.insetHucMapDiv = options.insetHucMapDiv;

		this.context.hucId = this.hucId;
		this.context.showAdditionalDataButtons = !(this.compareHucId || this.fips);

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.setUpHucPlotModel();

		// Create additional sub views as needed
		$plotContainer = this.$el.find('#huc-plot-container');
		if (this.compareHucId) {
			$plotContainer.html(NWC.templates.getTemplate('hucComparePlotViewContainer')());
			this.plotView = new NWC.view.WaterbudgetPlotView({
				hucId : this.hucId,
				el : $('#huc-plotview-div'),
				model : this.hucPlotModel
			});
			this.comparePlotView = new NWC.view.WaterbudgetPlotView({
				hucId : this.compareHucId,
				el : $('#compare-plotview-div'),
				model : this.hucPlotModel
			});
		}
		else {
			this.plotView = new NWC.view.WaterbudgetPlotView({
				hucId : this.hucId,
				el : $plotContainer,
				model : this.hucPlotModel
			});
		}

		if (this.fips) {
			this.countyWaterUseView = new NWC.view.CountyWaterUseView({
				hucId : this.hucId,
				fips : this.fips,
				el : this.$el.find('#wateruse')
			});
		}

		// Set up inset map and render
		this.buildHucMap(this.hucId, this.compareHucId);
		this.hucMap.render(this.insetHucMapDiv);
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
	 * Create the inset map with a feature layer containing huc and compareHuc(if specified).
	 * @param {String} huc - HUC 12 id
	 * @param {String} compareHuc - HUC 12 of a 2nd huc. This may be empty.
	 * @returns Jquery.Promise that is resolved when the huc feature layer has been loaded.
	 */
	buildHucMap : function(huc, compareHuc) {
		var d = $.Deferred();

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
		var hucsToAdd = [huc];

		var style = {
			strokeWidth: 2,
			strokeColor: "black",
			fillOpacity: 0,
			graphicOpacity: 1,
			fill: false
		};

		this.hucMap = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		if (compareHuc) {
			hucsToAdd.push(compareHuc);
			$.extend(style, {
				label: '${huc_12}',
				fontSize: '1em',
				fontWeight: 'normal',
				labelOutlineColor: "white",
				labelOutlineWidth: 1,
				labelAlign: 'lm'
			});
		}
		this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(hucsToAdd, new OpenLayers.StyleMap(style));

		this.hucLayer.events.on({
			featureadded: function(event){
				if (event.feature.attributes.huc_12 === huc) {
					this.hucName = event.feature.attributes.hu_12_name;
					this.$el.find('#huc-name').html(event.feature.attributes.hu_12_name);
				}
			},
			loadend: function(event) {
				this.hucMap.zoomToExtent(this.hucLayer.getDataExtent());
				this.$el.find('#huc-loading-indicator').hide();
				this.$el.find('#counties-button').prop('disabled', false);
				this.$el.find('#compare-hucs-button').prop('disabled', false);
				d.resolve();
			},
			scope : this
		});

		this.hucMap.addLayer(this.hucLayer);
		this.hucMap.zoomToExtent(this.hucMap.getMaxExtent());

		return d.promise();
	},

	/*
	 * Create the county map view.
	 */
	displayCountyMap : function() {
		this.hucCountMapView = new NWC.view.HucCountyMapView({
			hucFeature : new OpenLayers.Feature.Vector(
					this.hucLayer.features[0].geometry.clone(),
					this.hucLayer.features[0].attributes),
			router : this.router,
			el : this.$el.find('#county-selection-div')
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
		this.setButtonActive(this.$el.find('#customary-button'), newUnits === 'usCustomary');
		this.setButtonActive(this.$el.find('#metric-button'), newUnits === 'metric');
	},

	changeTimeScale : function(ev) {
		ev.preventDefault();
		var newTimeScale = ev.target.value;
		this.hucPlotModel.set('timeScale', newTimeScale);
	},

	updateTimeScale : function() {
		var newTimeScale = this.hucPlotModel.get('timeScale');
		this.setButtonActive(this.$el.find('#daily-button'), newTimeScale === 'daily');
		this.setButtonActive(this.$el.find('#monthly-button'), newTimeScale === 'monthly');
	},

	remove : function() {
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