/*global angular,OpenLayers,Exception*/
(function () {
    var baseMap = angular.module('nwc.map.base', []);
    var getDefaultConfig = function(){
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
        mapLayers.push(
            new OpenLayers.Layer.XYZ(
                "World Street Map",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
                {
                    isBaseLayer: true,
                    units: "m"
                }
            )
        );

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
                "World Terrain Base",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
                Object.merge(EPSG900913Options, {numZoomLevels: 14})
                ));



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



        var defaultConfig = {
            layers: mapLayers,
            restrictedExtent: extent,
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
