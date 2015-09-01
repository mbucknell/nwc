var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the streamflow stats selection page
 *
 * @constructor extends NWC.BaseSelectMapView
 */
NWC.view.StreamflowStatsMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'streamflowStats',

	context : {
		warningModalTitle : 'Selection Warning'
	},

	events : {
		'click #stream-gage-filters-div a' : 'changeGageFilter'
	},

	/*
	 * @constructs
	 * @param {Object options}
	 *	@prop {String} mapDiv
	 *	@prop {NWC.model.StreamflowStatsSelectMapModel} model;
	 */
	initialize : function(options) {
		var streamflowConfig = NWC.config.get('streamflow');
		var huc12Config = streamflowConfig.huc12.attributes;
		var gageConfig = streamflowConfig.gage.attributes;

		this.gagesLayer = new OpenLayers.Layer.WMS(
			"Gage Location",
			CONFIG.endpoint.geoserver + 'NWC/wms',
			{
				LAYERS: gageConfig.namespace + ':' + gageConfig.layerName,
				STYLES: 'blue_circle',
				format: 'image/png',
				transparent: true,
				tiled: true
			},
			{
				isBaseLayer: false,
				displayInLayerSwitcher: false,
				visibility: true
			}
		);

		this.hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
			CONFIG.endpoint.geoserver + 'gwc/service/wms',
			{
				layers: huc12Config.namespace + ':' + huc12Config.layerName,
				transparent: true,
				styles: ['seOutline']
			},
			{
				opacity: 0.6,
				displayInLayerSwitcher: false,
				visibility: true,
				isBaseLayer: false,
				tiled: true
			}
		);

		this.hucLayer.addOptions({attribution: '<img src="' + this.legendUrl(this.hucLayer.params.LAYERS, this.hucLayer.params.STYLES[0]) + '"/>'});

		this.legendControl = new OpenLayers.Control.Attribution();

		var featureInfoHandler = function(responseObject) {
			if (responseObject.features.length > 2) {
				this.showWarningDialog('Multiple features were selected. Please zoom in and select a single feature.')
			}
			else if (responseObject.features.length === 2) {
				if (responseObject.features[0].fid.has('gages') && responseObject.features[1].fid.has('huc')) {
					this.router.navigate('#!streamflow-stats/gage/' + responseObject.features[0].attributes.STAID, {trigger : true});
				}
				else {
					this.showWarningDialog('Multiple features were selected. Please zoom in and select a single feature.')
				}
			}
			else if (responseObject.features.length === 1) {
				if (responseObject.features[0].fid.has('gages')) {
					this.router.navigate('#!streamflow-stats/gage/' + responseObject.features[0].attributes.STAID, {trigger : true});
				}
				else {
					// Determine if the model for this feature is valid
					var km2 = NWC.util.Convert.acresToSquareKilometers(NWC.util.Convert.squareMilesToAcres(responseObject.features[0].data.mi2));
					if (km2 > 2000) {
						this.showWarningDialog("Hydrologic model results are not valid for watersheds this large (" + km2.round(0) + " km<sup>2</sup>). Try looking for a nearby observed flow gage.");
					}
					else {
						this.router.navigate('#!streamflow-stats/huc/' + responseObject.features[0].attributes.huc12, {trigger : true});
					}
				}
			}
		};

		this.selectControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title : 'selection-control',
			drillDown : true,
			hover : false,
			autoActivate : true,
			layers : [this.gagesLayer, this.hucLayer],
			queryVisible : true,
			infoFormat: 'application/vnd.ogc.gml',
			vendorParams: {
				radius: 5
			}
		});
		this.selectControl.events.register("getfeatureinfo", this, featureInfoHandler);

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.map.addLayers([this.gagesLayer, this.hucLayer]);
		this.addFlowLines();

		this.map.addControl(this.legendControl);

		this.listenTo(this.model, 'change:gageFilter', this.updateGageFilter);

		this.updateGageFilter();
	},

	legendUrl : function(layer, style) {
		return CONFIG.endpoint.geoserver + 'NWC/wms?request=GetLegendGraphic&format=image/png&width=20&height=20' +
			"&layer=" + layer + "&style=" + style +
			"&legend_options=forceLabels:on;fontName:Times New Roman;fontAntiAliasing:true;fontColor:0x000033;fontSize:8px;bgColor:0xFFFFEE;dpi:100";
	},

	changeGageFilter : function(ev) {
		ev.preventDefault();
		this.model.set('gageFilter', $(ev.target).data('value'));
	},

	updateGageFilter : function() {
		var filterVal = this.model.get('gageFilter');
		var filterDescr = $('#stream-gage-filters-div a[data-value="' + filterVal + '"]').html();

		$('#filter-label').html(filterDescr);
		this.gagesLayer.addOptions({attribution: '<img src="' + this.legendUrl(this.gagesLayer.params.LAYERS, this.model.getFilterStyle()) + '"/>'});
		this.gagesLayer.mergeNewParams({STYLES : this.model.getFilterStyle()});
	}
});


