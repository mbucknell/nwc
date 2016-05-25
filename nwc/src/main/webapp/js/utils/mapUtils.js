/*jslint browser */
/*global OpenLayers*/

var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.mapUtils = (function () {

	"use strict";

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

	that.transformWGS84ToMercator = function(lonLat) {
		return lonLat.transform(that.WGS84_GEOGRAPHIC, that.WGS84_GOOGLE_MERCATOR);
	};

	that.createMap = function(layers, controls) {
		var maxExtent = that.transformWGS84ToMercator(new OpenLayers.Bounds(-179.0, 10.0, -42.0, 75.0));
        var initialExtent = that.transformWGS84ToMercator(new OpenLayers.Bounds(-165.0, 10.0, -65.0, 65.0));

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

	that.createHucLayer = function(namespace, layerName, config) {
		return new OpenLayers.Layer.WMS('National WBD Snapshot',
			CONFIG.endpoint.geoserver + 'ows?',
			{
				layers: namespace + ':' + layerName,
				transparent: true,
				styles: ['polygon'],
				tiled: true
			},
			$.extend({}, that.defaultWorkflowLayerProperties, config)
		);
	};

	/*
	 * @param {Array of String} hucs - to create in the feature layer. assuming all the same type.
	 * @param {Object} style - optional style for the feature layer.
	 * @returns OpenLayers.Layer.Vector with hucs.
	 */
	that.createHucFeatureLayer = function(namespace, layerName, property, hucs, style) {
		var filter;
		var hucFilters = [];
		var hucLayer;
		var protocol = new OpenLayers.Protocol.WFS({
			url : CONFIG.endpoint.geoserver + 'wfs',
			featureType: layerName,
			featureNS: "http://gov.usgs.cida/" + namespace,
			version: "1.1.0",
			geometryName: "the_geom",
			srsName : "EPSG:3857"
		});
		var layerStyle = style ? style : {
				strokeWidth: 2,
				strokeColor: "#000000",
				fill : false
			};

		if (hucs.length === 1) {
			filter = new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.EQUAL_TO,
				property: property,
				value: hucs.first()
			});
		}
		else {
			hucs.each(function(huc) {
				hucFilters.push(new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.EQUAL_TO,
					property: property,
					value : huc
				}));
			});
			filter = new OpenLayers.Filter.Logical({
				filters : hucFilters,
				type : OpenLayers.Filter.Logical.OR
			});
		}

		hucLayer = new OpenLayers.Layer.Vector("WFS", {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: protocol,
			style: layerStyle,
			filter:filter
		});
		return hucLayer;
	};

	that.createHucSEBasinFeatureLayer = function(namespace, layerName, huc12) {
		var filter = new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "huc12",
			value: huc12
		});

		var protocol = new OpenLayers.Protocol.WFS({
			url : CONFIG.endpoint.geoserver + 'wfs',
			featureType: layerName,
			featureNS: "http://gov.usgs.cida/" + namespace,
			version: "1.1.0",
			geometryName: "the_geom",
			srsName : "EPSG:900913"
		});

		var hucLayer = new OpenLayers.Layer.Vector("WFS", {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: protocol,
			styleMap: new OpenLayers.StyleMap({
				strokeWidth: 2,
				strokeColor: "black",
				fillOpacity: 0,
				graphicOpacity: 1,
				fill: false
			}),
			filter:filter
		});
		return hucLayer;
	};

	that.createGageFeatureLayer = function(namespace, layerName, gageId) {
		var filter = new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "STAID",
			value: gageId
		});

		var protocol = new OpenLayers.Protocol.WFS({
			url : CONFIG.endpoint.geoserver + 'wfs',
			featureType: layerName,
			featureNS: "http://gov.usgs.cida/" + namespace,
			version: "1.1.0",
			geometryName: "the_geom",
			srsName : "EPSG:900913"
		});

		var gageLayer = new OpenLayers.Layer.Vector("WFS", {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: protocol,
			filter:filter
		});
		return gageLayer;
	};

	that.createCountyFeatureLayer = function(namespace, layerName, fips) {
		var filter = new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "fips",
			value: fips
		});

		var protocol = new OpenLayers.Protocol.WFS({
			url : CONFIG.endpoint.geoserver + 'wfs',
			featureType: layerName,
			featureNS: "http://gov.usgs.cida/" + namespace,
			version: "1.1.0",
			geometryName: "the_geom",
			srsName : "EPSG:900913"
		});

		var countyLayer = new OpenLayers.Layer.Vector("WFS", {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: protocol,
			filter:filter
		});
		return countyLayer;
	};

	that.createIntersectingCountiesLayer = function(namespace, layerName, geometry) {
		var filter = new OpenLayers.Filter.Spatial({
			type: OpenLayers.Filter.Spatial.INTERSECTS,
			property: 'the_geom',
			value: geometry
		});

		var protocol = new OpenLayers.Protocol.WFS({
			version: '1.1.0',
			url: CONFIG.endpoint.geoserver + 'wfs',
			featureType: layerName,
			featureNS: 'http://gov.usgs.cida/' + namespace,
			geometryName: 'the_geom',
			srsName: 'EPSG:900913'
		});

		var intersectingCountiesLayer = new OpenLayers.Layer.Vector(
			'Historical Counties',
			{
				displayInLayerSwitcher: false,
				strategies: [new OpenLayers.Strategy.Fixed()],
				styleMap: new OpenLayers.StyleMap({
					strokeWidth: 3,
					strokeColor: '#333333',
					fillColor: '#FF9900',
					fillOpacity: 0.4,
					//Display County Name
					label: '${name}',
					fontSize: '1em',
					fontWeight: 'normal',
					labelOutlineColor: "white",
					labelOutlineWidth: 1,
					labelAlign: 'cm',
					cursor: 'pointer'
				}),
				filter: filter,
				protocol : protocol
			}
		);
		return intersectingCountiesLayer;
	};

	that.createFlowlinesLayer = function() {
		return new OpenLayers.Layer.WMS('NHDPlus Flowlines',
			CONFIG.endpoint.direct.flowlinesgeoserver + 'service/wms',
			{
				layers : 'nhdplus:nhdflowline_network',
				transparent : true,
				srs : 'EPSG:900913'
			},
			{
				displayInLayerSwitcher : true,
				visibility : true,
				isBaseLayer : false,
				tiled : true,
				opacity : 0.6
			}
		);
	};
/*
	that.addFlowLinesToMap = function(map) {
		var streamOrderClipValues = [
			7, // 0
			7,
			7,
			6,
			6,
			6, // 5
			5,
			5,
			5,
			4,
			4, // 10
			4,
			3,
			3,
			3,
			2, // 15
			2,
			2,
			1,
			1,
			1 // 20
		];
		var streamOrderClipValue = 0;
		var flowlineAboveClipPixel;
		var createFlowlineColor = function(r,g,b,a) {
			flowlineAboveClipPixel = (a & 0xff) << 24 | (b & 0xff) << 16 | (g & 0xff) << 8 | (r & 0xff);
		};
		createFlowlineColor(100,100,255,255);
		streamOrderClipValue = streamOrderClipValues[map.zoom];

		map.events.register(
			'zoomend',
			map,
			function() {
				streamOrderClipValue = streamOrderClipValues[map.zoom];
			},
			true
		);

		// define per-pixel operation
		var flowlineClipOperation = OpenLayers.Raster.Operation.create(function(pixel) {
			if (pixel >> 24 === 0) { return 0; }
			var value = pixel & 0x00ffffff;
			if (value >= streamOrderClipValue && value < 0x00ffffff) {
				return flowlineAboveClipPixel;
			} else {
				return 0;
			}
		});

		var flowlinesWMSData = new OpenLayers.Layer.FlowlinesData(
			"Flowline WMS (Data)",
			CONFIG.endpoint.geoserver + 'gwc/service/wms'
		);
		map.addLayer(flowlinesWMSData);

		// source canvas (writes WMS tiles to canvas for reading)
		var flowlineComposite = OpenLayers.Raster.Composite.fromLayer(flowlinesWMSData, {int32: true});

		// filter source data through per-pixel operation
		var flowlineClipOperationData = flowlineClipOperation(flowlineComposite);

		var flowLayerName = "NHD Flowlines"
		var flowlineRaster = new OpenLayers.Layer.Raster({
			name: flowLayerName,
			data: flowlineClipOperationData,
			isBaseLayer: false,
			visibility : true
		});

		// add the special raster layer to the map viewport
		map.addLayer(flowlineRaster);
	};
*/
	return that;
}());


