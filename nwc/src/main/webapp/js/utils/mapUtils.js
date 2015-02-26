var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.mapUtils = (function () {

	var that = {};

	that.WGS84_GOOGLE_MERCATOR = new OpenLayers.Projection("EPSG:3857");
	that.WGS84_GEOGRAPHIC = new OpenLayers.Projection("EPSG:4326");

	var EPSG3857Options = {
		sphericalMercator: true,
		layers: "0",
		isBaseLayer: true,
		projection: that.WGS84_GOOGLE_MERCATOR,
		units: "m",
		buffer: 3,
		transitionEffect: 'resize',
		wrapDateLine: true
	};
	var zyx = '/MapServer/tile/${z}/${y}/${x}';

	that.createWorldStreetMapLayer = function() {
		return new OpenLayers.Layer.XYZ(
			"World Street Map",
			"http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
			{
				isBaseLayer: true,
				units: "m",
				wrapDateLine: true
			}
		);
	};

	that.createWorldGrayBaseLayer = function() {
		return new OpenLayers.Layer.XYZ(
			"World Light Gray Base",
			"http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base" + zyx,
			Object.merge(EPSG3857Options, {numZoomLevels: 14})
		);
	};

	that.createWorldTopoLayer = function() {
		return new OpenLayers.Layer.XYZ(
			"World Topo Map",
			"http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map" + zyx,
			{
				isBaseLayer: true,
				units: "m",
				wrapDateLine: true
			}
		);
	};

	that.createWorldImageryLayer = function() {
		return new OpenLayers.Layer.XYZ(
			"World Imagery",
			"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery" + zyx,
			{
				isBaseLayer: true,
				units: "m",
				wrapDateLine: true
			}
		);
	};

	that.createWorldShadedReliefLayer = function() {
		return new OpenLayers.Layer.XYZ(
			"World Terrain Base",
			"http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
			Object.merge(EPSG3857Options, {numZoomLevels: 14})
		);
	};

	that.createAllBaseLayers = function() {
		return [
			that.createWorldStreetMapLayer(),
			that.createWorldGrayBaseLayer(),
			that.createWorldTopoLayer(),
			that.createWorldImageryLayer(),
			that.createWorldShadedReliefLayer()
		];
	};

	that.createMap = function(layers, controls) {
		var maxExtent = new OpenLayers.Bounds(-179.0, 10.0, -42.0, 75.0).transform(that.WGS84_GEOGRAPHIC, that.WGS84_GOOGLE_MERCATOR);
        var initialExtent = new OpenLayers.Bounds(-165.0, 10.0, -65.0, 65.0).transform(that.WGS84_GEOGRAPHIC, that.WGS84_GOOGLE_MERCATOR);

		var defaultConfig = {
            extent: initialExtent,
            restrictedExtent: maxExtent,
            projection: that.WGS84_GOOGLE_MERCATOR,
            numZoomLevels: 13
        };
		defaultConfig.layers = layers;
		defaultConfig.controls = controls;

		return new OpenLayers.Map(defaultConfig);
	};

	that.defaultWorkflowLayerProperties = {
		opacity: 0.6,
		displayInLayerSwitcher: false,
		visibility: true,
		isBaseLayer: false,
		tiled: true
	};

	that.createHucLayer = function(config) {
		return new OpenLayers.Layer.WMS('National WBD Snapshot',
			CONFIG.endpoint.geoserver + 'ows?',
			{
				layers: 'NHDPlusHUCs:NationalWBDSnapshot',
				transparent: true,
				styles: ['polygon'],
				tiled: true
			},
			$.extend({}, that.defaultWorkflowLayerProperties, config)
		);
	};

	that.createFlowLinesData = function() {
		return new OpenLayers.Layer.FlowlinesData(
			"Flowline WMS (Data)",
			CONFIG.endpoint.geoserver + 'gwc/service/wms'
		);
	};

	that.createFlowLinesRaster = function(flowlinesData) {
		return new OpenLayers.Layer.FlowlinesRaster({
			name: "NHD Flowlines",
			dataLayer: flowlinesData,
			streamOrderClipValue: 0,
			displayInLayerSwitcher: false
		});
	};

	return that;
}());


