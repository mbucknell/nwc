var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BaseSelectMapView = NWC.view.BaseView.extend({

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.mapDiv);
		this.map.zoomToExtent(this.map.getMaxExtent(), true);
	},

	initialize : function(options) {
		var controls = [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.MousePosition({
                prefix: 'POS: ',
                numDigits: 2,
                displayProjection: NWC.util.mapUtils.WGS84_GEOGRAPHIC
            }),
            new OpenLayers.Control.ScaleLine({
                geodesic: true
            }),
            new OpenLayers.Control.LayerSwitcher({
                roundedCorner: true
            }),
            new OpenLayers.Control.Zoom()
        ];
		this.map = NWC.util.mapUtils.createMap(NWC.util.mapUtils.createAllBaseLayers(), controls);

		this.mapDiv = options.mapDiv;
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
	},


});

