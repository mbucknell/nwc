var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.HucCountyMapView = NWC.view.BaseView.extend({

	templateName : 'countyHucMap',

	/**
	 *
	 * @constructor
	 * @param {Object} options
	 *  @prop {String} hucId - Id of the huc for which information should be shown.
	 *	@prop {OpenLayers.Feature.Vector} hucFeature - the feature object for the huc to be drawn on the map
	 *	@prop {Backbone.Router} router
	 *	@prop {Jquery el} el
	 */
	initialize : function(options) {
		var countyDataConfig = NWC.config.get('county').attributes
		var countyMapBaseLayer = NWC.util.mapUtils.createWorldStreetMapLayer();
		this.map = NWC.util.mapUtils.createMap([countyMapBaseLayer], [new OpenLayers.Control.Zoom(), new OpenLayers.Control.Navigation()]);

		// Create vector layer representing the huc.
		this.countyHucFeatureLayer = new OpenLayers.Layer.Vector('County Huc Layer', {
			displayInLayerSwitcher : false,
			isBaseLayer : false,
			visibility : true,
			opacity: 0.6,
			style : {
				fillColor: '#00FF00',
				fillOpacity: 0.6
			}
		});
		this.countyHucFeatureLayer.addFeatures([options.hucFeature]);
		this.map.addLayer(this.countyHucFeatureLayer);

		// Create a layer representing the counties which interes
		this.countiesLayer = NWC.util.mapUtils.createIntersectingCountiesLayer(
			countyDataConfig.namespace,
			countyDataConfig.layerName,
			options.hucFeature.geometry
		);
		this.map.addLayer(this.countiesLayer);

		this.countiesLayer.events.on({
			'featuresadded' : function() {
				// Create table showing percent area coverages
				var countyFeatures = this.countiesLayer.features;
				var countiesHucInfo = NWC.util.hucCountiesIntersector.getCountiesIntersectionInfo(options.hucFeature, countyFeatures);
				countiesHucInfo.map(function(d) {
					d.hucInCounty = NWC.util.numberFormat.roundToInteger(d.hucInCounty);
					d.countyInHuc = NWC.util.numberFormat.roundToInteger(d.countyInHuc);
					return d;
				});
				$('#county-table-div').html(NWC.templates.getTemplate('countyHucTable')({countiesHucInfo : countiesHucInfo}));

				// Zoom the map to the extent of the county
				var countiesExtent = this.countiesLayer.getDataExtent();
				this.map.zoomToExtent(countiesExtent);
			},
			scope : this
		});

		// Set up control
		var selectControl = new OpenLayers.Control.SelectFeature(this.countiesLayer, {
			onSelect : (function(feature) {
				this.router.navigate('#!waterbudget/huc/' + options.huc + '/county/' + feature.attributes.fips, {
					trigger : true
				});
			}).bind(this)
		});
		this.map.addControl(selectControl);
		selectControl.activate();

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render('county-selection-map');
		return this;
	}
});

