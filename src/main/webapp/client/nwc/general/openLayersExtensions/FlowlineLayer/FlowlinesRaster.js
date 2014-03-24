/*global OpenLayers*/

/**
 * @requires OpenLayers/Layer/Raster.js
 */

/**
 * Class: OpenLayers.Layer.FlowlinesRaster
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Raster>
 */
OpenLayers.Layer.FlowlinesRaster = OpenLayers.Class(OpenLayers.Layer.Raster, {
    flowlineAboveClipPixel: undefined,
    flowlineAboveClipPixelR: 0,
    flowlineAboveClipPixelG: 0,
    flowlineAboveClipPixelB: 255,
    flowlineAboveClipPixelA: 128,
    CLASS_NAME: "OpenLayers.Layer.FlowlinesRaster",
    
    streamOrderClipValue: 0,
    streamOrderTable: new Array(21),
    streamOrderSlider: undefined,
    streamOrderLock: true,
    streamOrderClipValues: new Array(21),
    
    initialize: function (config) {
        this.createFlowlineAboveClipPixel();
        config.isBaseLayer = false;
        if (!config.data && config.dataLayer) {
            var flowlineComposite = OpenLayers.Raster.Composite.fromLayer(
                config.dataLayer,
                {int32: true}
            );
            config.data = this.clipOperation(flowlineComposite);
        }
        OpenLayers.Layer.Raster.prototype.initialize.apply(this, [config]);
        this.events.on('visibilitychanged', this.updateVisibility);
    },
    clipOperation: function (composite) {
        /*jslint bitwise: true*/
        var scope = this;
        return (OpenLayers.Raster.Operation.create(function (pixel) {
            if (pixel >> 24 === 0) {
                return 0;
            }
            var value = pixel & 0x00ffffff;
            if (value >= scope.streamOrderClipValue && value < 0x00ffffff) {
                return scope.flowlineAboveClipPixel;
            } else {
                return 0;
            }
        }))(composite);
    },
    createFlowlineAboveClipPixel: function () {
        /*jslint bitwise: true*/
        this.flowlineAboveClipPixel = (this.flowlineAboveClipPixelA & 0xff) << 24 |
            (this.flowlineAboveClipPixelB & 0xff) << 16 |
            (this.flowlineAboveClipPixelG & 0xff) << 8 |
            (this.flowlineAboveClipPixelR & 0xff);
    },
    updateFromClipValue: function (cv) {
        this.streamOrderClipValue = cv;
        if (this.getVisibility()) {
            this.onDataUpdate();
        }
    },
    getClipValueForZoom: function (zoom) {
        return this.streamOrderClipValues[zoom];
    },
    setClipValueForZoom: function (zoom, value) {
        if (streamOrderLock === true) {
            var zoomIndex;
            for (zoomIndex = 0; zoomIndex < this.streamOrderTable.length; ++zoomIndex) {
                if (zoomIndex < zoom) {
                    if (this.streamOrderTable[zoomIndex].getValue() < value) {
                        this.streamOrderTable[zoomIndex].setValue(value);
                    }
                } else if (zoomIndex > zoom) {
                    if (this.streamOrderTable[zoomIndex].getValue() > value) {
                        this.streamOrderTable[zoomIndex].setValue(value);
                    }
                } else {
                    this.streamOrderTable[zoomIndex].setValue(value);
                }
            }
        } else {
            this.streamOrderTable[zoom].setValue(value);
        }
    },
    setStreamOrderClipValues: function(zoomLevels) {
        var clipCount = 7;
        this.streamOrderClipValues = new Array(zoomLevels);
        var tableLength = this.streamOrderClipValues.length;
        var cInd;
        for (cInd = 0; cInd < tableLength; cInd++) {
            this.streamOrderClipValues[cInd] = Math.ceil((tableLength - cInd) * (clipCount / tableLength));
        }
    }
    
});