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

	initialize : function(options) {
		var $plotContainer;

		this.context.hucId = options.hucId;
		this.context.compareHucId = options.compareHucId ? options.compareHucId :'';

		this.hucId = options.hucId;
		this.compareHucId = options.compareHucId ? options.compareHucId :'';
		this.insetHucMapDiv = options.insetHucMapDiv;

		// call superclass initialize to do default initialize
		// (includes render)
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		this.setUpHucPlotModel();

		$plotContainer = this.$el.find('#huc-plot-container');
		if (this.compareHucId) {
			$plotContainer.append('<div id="huc-plotview-div"></div><div id="compare-plotview-div"></div>');
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

		this.buildHucMap(this.hucId, this.compareHucId);
		this.hucMap.render(this.insetHucMapDiv);
	},

	setUpHucPlotModel : function() {
		// Add listeners to model
		this.hucPlotModel = new NWC.model.WaterBudgetHucPlotModel();
		this.listenTo(this.hucPlotModel, 'change:units', this.updateUnits);
		this.listenTo(this.hucPlotModel, 'change:timeScale', this.updateTimeScale);

		var newTimeScale = this.hucPlotModel.get('timeScale');
		this.setButtonActive($('#daily-button'), newTimeScale === 'daily');
		this.setButtonActive($('#monthly-button'), newTimeScale === 'monthly');

		var newUnits = this.hucPlotModel.get('units');
		this.setButtonActive($('#customary-button'), newUnits === 'usCustomary');
		this.setButtonActive($('#metric-button'), newUnits === 'metric');
	},

	buildHucMap : function(huc, compareHuc) {
		var d = $.Deferred();

		var baseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
		var hucsToAdd = [huc];

		this.hucMap = NWC.util.mapUtils.createMap([baseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		if (compareHuc) {
			hucsToAdd.push(compareHuc);
		}
		this.hucLayer = NWC.util.mapUtils.createHucFeatureLayer(hucsToAdd);

		this.hucLayer.events.on({
			featureadded: function(event){
				if (event.feature.attributes.huc_12 === huc) {
					this.hucName = event.feature.attributes.hu_12_name;
					$('#huc-name').html(event.feature.attributes.hu_12_name);
				}
			},
			loadend: function(event) {
				this.hucMap.zoomToExtent(this.hucLayer.getDataExtent());
				$('#huc-loading-indicator').hide();
				$('#counties-button').prop('disabled', false);
				$('#compare-hucs-button').prop('disabled', false);
				d.resolve();
			},
			scope : this
		});

		this.hucMap.addLayer(this.hucLayer);
		this.hucMap.zoomToExtent(this.hucMap.getMaxExtent());

		return d.promise();
	},

	displayCountyMap : function() {
		this.hucCountMapView = new NWC.view.HucCountyMapView({
			mapDiv : 'county-selection-map',
			hucFeature : new OpenLayers.Feature.Vector(
					this.hucLayer.features[0].geometry.clone(),
					this.hucLayer.features[0].attributes),
			router : this.router,
			el : $('#county-selection-div')
		});
	},

	goToAddHucMapPage : function() {
		this.router.navigate('waterbudget/map/huc/' + this.hucId, {trigger: true});
	},

	changeUnits : function(ev) {
		ev.preventDefault();
		var newUnits = ev.target.value;
		this.hucPlotModel.set('units', newUnits);
	},

	updateUnits : function(ev) {
		var newUnits = this.hucPlotModel.get('units');
		this.setButtonActive($('#customary-button'), newUnits === 'usCustomary');
		this.setButtonActive($('#metric-button'), newUnits === 'metric');
	},

	changeTimeScale : function(ev) {
		ev.preventDefault();
		var newTimeScale = ev.target.value;
		this.hucPlotModel.set('timeScale', newTimeScale);
	},

	updateTimeScale : function(ev) {
		var newTimeScale = this.hucPlotModel.get('timeScale');
		this.setButtonActive($('#daily-button'), newTimeScale === 'daily');
		this.setButtonActive($('#monthly-button'), newTimeScale === 'monthly');
	},

	remove : function() {
		if (Object.has(this, 'hucCountyMapView')) {
			this.hucCountyMapView.remove();
		}
		this.plotView.remove();
		if (Object.has(this, 'comparePlotView')) {
			this.comparePlotView.remove();
		}
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	}
});