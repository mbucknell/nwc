var NWC = NWC || {};

NWC.view = NWC.view || {};
/**
 * Abstract view for pages in the workflow used to select a feature.
 * Assumes that the template contains map controls for select, pan, and zoom
 * @constructor extends NWC.view.BaseView
 */
NWC.view.BaseSelectMapView = NWC.view.BaseView.extend({

	events : {
		'change #map-controls-group input' : 'changeControl'
	},

	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.mapDiv);
		this.map.zoomToExtent(this.map.getMaxExtent(), true);
	},
	model : new NWC.model.BaseSelectMapModel(),

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
		this.zoomBoxControl = new OpenLayers.Control.ZoomBox();

		this.flowLinesData = NWC.util.mapUtils.createFlowLinesData();
		this.flowLinesRaster = NWC.util.mapUtils.createFlowLinesRaster(this.flowLinesData);

		this.map = NWC.util.mapUtils.createMap(
			NWC.util.mapUtils.createAllBaseLayers().concat([this.flowLinesData, this.flowLinesRaster]),
			controls
		);
		this.map.events.register(
			'zoomend',
			this,
			function () {
				var zoom = this.map.zoom;
				this.flowLinesRaster.updateFromClipValue(this.flowLinesRaster.getClipValueForZoom(zoom));
			},
			true
		);

		this.flowLinesRaster.setStreamOrderClipValues(this.map.getNumZoomLevels());
        this.flowLinesRaster.updateFromClipValue(this.flowLinesRaster.getClipValueForZoom(this.map.zoom));

		this.mapDiv = options.mapDiv;

		this.map.addControl(this.zoomBoxControl);
		this.map.addControl(this.selectControl);

		this.listenTo(this.model, 'change:control', this.updateSelection);

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.updateSelection();
	},

	changeControl : function(ev) {
		var newSelection = ev.target.value;
		this.model.set('control', newSelection);
	},

	updateSelection : function() {
		var newSelection = this.model.get('control');
		$('#map-controls-div span').not('#map-control-' + newSelection).hide();
		$('#map-control-' + newSelection).show();

		if (newSelection === 'zoom') {
			this.zoomBoxControl.activate();
			this.selectControl.deactivate();
		}
		else if (newSelection === 'select') {
			this.zoomBoxControl.deactivate();
			this.selectControl.activate();
		}
		else {
			this.zoomBoxControl.deactivate();
			this.selectControl.deactivate();
		}
	}


});

