var NWC = NWC || {};

NWC.view = NWC.view || {};
/**
 * Abstract view for pages in the workflow used to select a feature.
 * Assumes that the template contains map controls for select, pan, and zoom.
 * When extending the view,define the selectControl property which should have
 * an activate and deactivate method.
 *
 * @constructor extends NWC.view.BaseView
 */
NWC.view.BaseSelectMapView = NWC.view.BaseView.extend({

	events : {
		'click #map-controls-group button' : 'changeControl'
	},

	selectControl : function() { return; },

	Model : NWC.model.BaseSelectMapModel,

	/**
	 * renders the view and sets the map's bounding box
	 * @returns {undefined}
	 */
	render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
		this.map.render(this.mapDiv);
	},

	addFlowLines : function() {
		NWC.util.mapUtils.addFlowLinesToMap(this.map);
	},

	/**
	 * @constructs
	 * @param {Object} options
	 *	@prop {String} mapDiv
	 */
	initialize : function(options) {
		this.model = Object.has(options, 'model') ? options.model : new this.Model();

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

		this.mapDiv = options.mapDiv;

		this.map = NWC.util.mapUtils.createMap(
			NWC.util.mapUtils.createAllBaseLayers(),
			controls
		);

		// Add controls which will be are tied to the model data.
		this.zoomBoxControl = new OpenLayers.Control.ZoomBox();
		this.map.addControl(this.zoomBoxControl);
		this.map.addControl(this.selectControl);

		//Initialize and render the view
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);

		//Set the initial extent
		if (this.model.has('extent')) {
			this.map.zoomToExtent(this.model.get('extent'), true);
		}
		else {
			this.map.zoomToExtent(this.map.getMaxExtent(), true);
			this.model.set('extent', this.map.getExtent());
		}
		this.map.events.register('move', this, function(ev) {
			this.model.set('extent', ev.object.getExtent());
		});

		// Add listeners to model and initialize the view.
		this.listenTo(this.model, 'change:control', this.updateSelection);
		this.updateSelection();
	},

	/**
	 * Updates the model from the data in ev.
	 * @param {jquery.Event} ev
	 */
	changeControl : function(ev) {
		ev.preventDefault();
		var newSelection = ev.target.value;
		this.model.set('control', newSelection);
	},

	/**
	 * Updates the view to reflect the model data.
	 */
	updateSelection : function() {
		var newSelection = this.model.get('control');
		var selectActive = newSelection === 'select';
		var panActive = newSelection === 'pan';
		var zoomActive = newSelection === 'zoom';

		$('#map-controls-div span').not('#map-control-' + newSelection).hide();
		$('#map-control-' + newSelection).show();

		this._setButtonActive($('#select-button'), selectActive);
		this._setButtonActive($('#pan-button'), panActive);
		this._setButtonActive($('#zoom-button'), zoomActive);

		if (zoomActive) {
			this.zoomBoxControl.activate();
			this.selectControl.deactivate();
		}
		else if (selectActive) {
			this.zoomBoxControl.deactivate();
			this.selectControl.activate();
		}
		else {
			this.zoomBoxControl.deactivate();
			this.selectControl.deactivate();
		}
	},

		_setButtonActive : function(el, on) {
		if (on) {
			el.addClass('active');
		}
		else {
			el.removeClass('active');
		}
	}


});

