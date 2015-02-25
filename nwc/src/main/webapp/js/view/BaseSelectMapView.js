var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.BaseSelectMapView = NWC.view.BaseView.extend({

	events : {
		'change #map-controls-group input' : 'changeControl'
	},

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

		this.selection = new NWC.model.BaseSelectMapModel();

		this.map.addControl(this.selection.get('zoomBoxControl'));

		this.listenTo(this.selection, 'change:control', this.updateSelection);

		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.updateSelection();
	},

	changeControl : function(ev) {
		var newSelection = ev.target.value;
		this.selection.set('control', newSelection);
	},

	updateSelection : function() {
		var newSelection = this.selection.get('control');
		$('#map-controls-div span').not('#map-control-' + newSelection).hide();
		$('#map-control-' + newSelection).show();

		if (newSelection === 'zoom') {
			this.selection.get('zoomBoxControl').activate();
		}
		else {
			this.selection.get('zoomBoxControl').deactivate();
		}
	}


});

