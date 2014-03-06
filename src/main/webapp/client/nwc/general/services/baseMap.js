/*global angular,OpenLayers,Exception*/
(function () {
    var baseMap = angular.module('nwc.map.base', []);
    var getDefaultConfig = function(){
        var mapLayers = [];
        var WGS84_GOOGLE_MERCATOR = new OpenLayers.Projection("EPSG:3857");
        var WGS84_GEOGRAPHIC = new OpenLayers.Projection("EPSG:4326");
        var EPSG3857Options = {
            sphericalMercator: true,
            layers: "0",
            isBaseLayer: true,
            projection: WGS84_GOOGLE_MERCATOR,
            units: "m",
            buffer: 3,
            transitionEffect: 'resize',
            wrapDateLine: true
        };
        // ////////////////////////////////////////////// BASE LAYERS
        var zyx = '/MapServer/tile/${z}/${y}/${x}';
        mapLayers.push(
            new OpenLayers.Layer.XYZ(
                "World Street Map",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
                {
                    isBaseLayer: true,
                    units: "m",
                    wrapDateLine: true
                }
            )
        );

        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Light Gray Base",
                "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base" + zyx,
                Object.merge(EPSG3857Options, {numZoomLevels: 14})
                ));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Topo Map",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map" + zyx,
                {isBaseLayer: true,
                    units: "m",
                    wrapDateLine: true
                }));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Imagery",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery" + zyx,
                {isBaseLayer: true,
                    units: "m",
                    wrapDateLine: true
                }));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Terrain Base",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
                Object.merge(EPSG3857Options, {numZoomLevels: 14})
                ));



        var controls = [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.MousePosition({
                prefix: 'POS: ',
                numDigits: 2,
                displayProjection: WGS84_GEOGRAPHIC
            }),
            new OpenLayers.Control.ScaleLine({
                geodesic: true
            }),
            new OpenLayers.Control.LayerSwitcher({
                roundedCorner: true
            }),
            new OpenLayers.Control.Zoom()
        ];
        var maxExtent = new OpenLayers.Bounds(-179.0, 10.0, -42.0, 75.0).transform(WGS84_GEOGRAPHIC, WGS84_GOOGLE_MERCATOR);
        var initialExtent = new OpenLayers.Bounds(-165.0, 10.0, -65.0, 65.0).transform(WGS84_GEOGRAPHIC, WGS84_GOOGLE_MERCATOR);

        var defaultConfig = {
            extent: initialExtent,
            layers: mapLayers,
            restrictedExtent: maxExtent,
            projection: WGS84_GOOGLE_MERCATOR,
            controls: controls
        };
        return defaultConfig;
    };
    var getWorkflowLayerOptions = function () {
        return {
            opacity: 0.6,
            displayInLayerSwitcher: false,
            visibility: true,
            isBaseLayer: false,
            tiled: true
        };
    };

    /**
     * 
     * @param {Object} config the parameter you would pass to a single-argument OpenLayers.Map constructor.
     *                  If a parameter's values is an array and a default array exists for that property, the 
     *                  values in the parameterized array will be appended to the default array. Currently there
     *                  is no method to override default array parameters.
     * @param {String} config.div Optional parameter that you may specify to ensure the graph auto-renders after construction
     * @returns {OpenLayers.Map}
     */
    var newBaseMap = function (config) {
        if (Object.isString(config)) {
            throw new Exception("config must be an object. String detected. You must set config.div if you want the map to auto-render");
        }
        var finalConfig = getDefaultConfig();
        //config overrides all properties on defaultConfig except for arrays.
        //we append the values of config onto the defaultConfig arrays
        var value;
        for(var key in config){
            if(config.hasOwnProperty(key)){
                value = config[key];
                if(Object.has(finalConfig, key)){
                    if(Object.isArray(finalConfig[key])){
                        finalConfig[key].add(value);
                    } else{
                        finalConfig[key] = value;
                    }
                } else {
                    finalConfig[key] = value;
                }
            }
        }
        return new OpenLayers.Map(finalConfig);
    };
    baseMap.factory('BaseMap', [
        function () {
            return {
                new : newBaseMap,
                getWorkflowLayerOptions: getWorkflowLayerOptions
            };
        }
    ]);
}());
