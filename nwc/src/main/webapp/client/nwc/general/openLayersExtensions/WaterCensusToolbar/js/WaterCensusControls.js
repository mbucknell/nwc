/*global CONFIG,OpenLayers*/

OpenLayers.Control.HucSelectionTool = OpenLayers.Class(OpenLayers.Control, (function () {
    var exports = {};
    exports.type = OpenLayers.Control.TYPE_TOOL;
    exports.CLASS_NAME = 'OpenLayers.Control.HucSelectionTool';
    exports.handler = {
        setMap: function (map) {
            exports.map = map;
        },
        activate: function () {
            exports.map.getLayer(OpenLayers.Control.HucSelectionTool.mapLayerId).setVisibility(true);
            exports.map.getControl(OpenLayers.Control.HucSelectionTool.underlyingControlId).activate();
        },
        deactivate: function () {
            //restore non-base layer visibility
            exports.map.getControl(OpenLayers.Control.HucSelectionTool.underlyingControlId).deactivate();
        }
    };
    exports.initialize = function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.events.register('click', null, this.handler);
    };
    return exports;
}()));
//set static properties
OpenLayers.Control.HucSelectionTool.underlyingControlId = 'hucs';
OpenLayers.Control.HucSelectionTool.mapLayerId = 'huc-feature-layer';


OpenLayers.Control.BioSitesSelectionTool = OpenLayers.Class(OpenLayers.Control, (function () {
    var exports = {};
    exports.type = OpenLayers.Control.TYPE_TOOL;
    exports.CLASS_NAME = 'OpenLayers.Control.BioSitesSelectionTool';
    exports.handler = {
        setMap: function (map) {
            exports.map = map;
        },
        activate: function () {
            exports.map.getLayer(OpenLayers.Control.BioSitesSelectionTool.mapLayerId).setVisibility(true);
            exports.map.getControl(OpenLayers.Control.BioSitesSelectionTool.underlyingControlId).activate();
        },
        deactivate: function () {
            exports.map.getControl(OpenLayers.Control.BioSitesSelectionTool.underlyingControlId).deactivate();
        }
    };
    exports.initialize = function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.events.register('click', null, this.handler);
    };
    return exports;
}()));
//static properties
OpenLayers.Control.BioSitesSelectionTool.underlyingControlId = 'bioDataSites';
OpenLayers.Control.BioSitesSelectionTool.mapLayerId = 'biodata-sites-feature-layer';