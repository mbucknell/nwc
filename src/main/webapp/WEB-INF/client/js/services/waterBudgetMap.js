/*global angular,OpenLayers*/
(function () {
    var waterBudgetMap = angular.module('nwc.waterBudgetMap', []);
    var privateMap;

    var mapper = function () {
        var initMap = function () {
            var mapLayers = [];
            var WGS84_GOOGLE_MERCATOR = new OpenLayers.Projection("EPSG:900913");
            var EPSG900913Options = {
                sphericalMercator: true,
                layers: "0",
                isBaseLayer: true,
                projection: WGS84_GOOGLE_MERCATOR,
                units: "m",
                buffer: 3,
                transitionEffect: 'resize',
                wrapDateLine: false
            };
            // ////////////////////////////////////////////// BASE LAYERS
            var zyx = '/MapServer/tile/${z}/${y}/${x}';
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Light Gray Base",
                    "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base" + zyx,
                    Object.merge(EPSG900913Options, {numZoomLevels: 14})
                    ));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Topo Map",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map" + zyx,
                    {isBaseLayer: true,
                        units: "m"
                    }));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Imagery",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery" + zyx,
                    {isBaseLayer: true,
                        units: "m"
                    }));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Street Map",
                    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
                    {isBaseLayer: true,
                        units: "m"
                    }));
            mapLayers.push(new OpenLayers.Layer.XYZ(
                    "World Terrain Base",
                    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
                    Object.merge(EPSG900913Options, {numZoomLevels: 14})
                    ));
            var workflowLayerOptions = {
                opacity: 0.6,
                displayInLayerSwitcher: false,
                visibility: true,
                isBaseLayer: false,
                tiled: true
            };

            var hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
                    CONFIG.endpoint.geoserver + 'gwc/service/wms',
                    {
                        layers: 'NHDPlusHUCs:NationalWBDSnapshot',
                        transparent: true,
                        styles: ['polygon']
                    },
            workflowLayerOptions
                    );
            mapLayers.push(hucLayer);
            var controls = [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.MousePosition({
                    prefix: 'POS: '
                }),
                new OpenLayers.Control.ScaleLine({
                    geodesic: true
                }),
                new OpenLayers.Control.LayerSwitcher({
                    roundedCorner: true
                }),
                new OpenLayers.Control.Zoom()
            ];
            var extent = new OpenLayers.Bounds(-146.0698, 19.1647, -42.9301, 52.8949).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

            var map = new OpenLayers.Map({
                layers: mapLayers,
                restrictedExtent: extent,
                projection: WGS84_GOOGLE_MERCATOR,
                controls: controls
            });

            privateMap = map;
            //convenience accessor
            privateMap.getHucLayer = function () {
                return hucLayer;
            };
            return privateMap;
        };
        var getMap = function () {
            if (!privateMap) {
                initMap();
            }
            return privateMap;
        };
        return {
            initMap: initMap,
            getMap: getMap
        };
    };
    waterBudgetMap.service('WaterBudgetMap', [
        mapper
    ]);
}());