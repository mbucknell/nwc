var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.StreamflowStatsMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'streamflowStats',

	events : {
		'change #map-streamflow-type-group input' : 'changeStreamflowType'
	},

	Model : NWC.model.StreamflowStatsSelectMapModel,

	initialize : function(options) {
		this.model = new this.Model();

		this.gagesLayer = new OpenLayers.Layer.WMS(
			"Gage Location",
			CONFIG.endpoint.geoserver + 'NWC/wms',
			{
				LAYERS: "NWC:gagesII",
				STYLES: 'blue_circle',
				format: 'image/png',
				transparent: true,
				tiled: true
			},
			{
				isBaseLayer: false,
				displayInLayerSwitcher: false,
				visibility: false
			}
		);
		// WATERSMART-398 - Due to page shifting on load, the streamgage locations shift and the
		// click event doesn't seem to line up with where the gages actually are. Updating the map's size
		// after the layer loads fixes the issue
		this.gagesLayer.events.register('loadend', {}, function(event) {
			event.object.map.updateSize();
		});

		this.hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
			CONFIG.endpoint.geoserver + 'gwc/service/wms',
			{
				layers: 'NWC:huc12_SE_Basins_v2',
				transparent: true,
				styles: ['polygon']
			},
			{
				opacity: 0.6,
				displayInLayerSwitcher: false,
				visibility: false,
				isBaseLayer: false,
				tiled: true
			}
		);

		this.selectControl = new OpenLayers.Control();

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.addFlowLines();
		this.map.addLayers([this.gagesLayer, this.hucLayer]);

		this.listenTo(this.model, 'change:streamflowType', this.updateSelectionLayer);
		this.updateSelectionLayer();
	},

	updateSelectionLayer : function() {
		var streamflowType = this.model.get('streamflowType');
		var gageVisible = streamflowType === 'observed';
		var hucVisible = streamflowType === 'modeled';

		this.gagesLayer.setVisibility(gageVisible);
		this.hucLayer.setVisibility(hucVisible);
	},

	changeStreamflowType : function(ev) {
		this.model.set('streamflowType', ev.target.value);
	}
});


