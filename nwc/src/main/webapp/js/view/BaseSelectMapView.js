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

		this._initializeSearchBox('map-search-box');

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

	_initializeSearchBox : function(divId) {
		var lastResults = [];
		var $searchBox = $('#' + divId);
		$searchBox.select2({
			placeholder: 'Hint: Type a place and state (e.g. Franklin AZ), zip code, or area code',
			minimumInputLength: 3,
			containerCssClass : 'col-xs-12 col-sm-6',
			ajax : {
				url: CONFIG.endpoint.searchService,
				dataType: 'json',
				quietMillis : 500,
				data : function(term, page, context) {
					var terms = term.split(' ');
					var state = '';
					var thisTerm = '';
					if (terms.length > 1 && (terms.last().length === 2)) {
						thisTerm = terms.to(terms.length - 1).join(' ');
						state = terms.last();
					}
					else {
						thisTerm = term;
					}
					return {
						term: thisTerm,
						state : state,
						topN : 50,
						LATmin : -90,
						LATmax : 90,
						LONmin: -180,
						LONmax : 180,
						includeGNIS: true,
						includeState : true,
						includeUsgsSiteSW : false,
						includeUsgsSiteGW : false,
						includeUsgsSiteSP: false,
						includeUsgsSiteAT : false,
						includeUsgsSiteOT : false,
						includeZIPcodes : true,
						includeAREAcodes : true,
						useCommonGnisClasses : true
					};
				},
				results : function(data) {
					var result = [];
					lastResults = data;
					data.each(function (el, index) {
						var elText = el.nm + ' ' + el.st + ' ' + el.ct;
						result.push({
							id : index,
							text : elText
						});
					});
					return {results : result};
				},
				params :{
					timeout : 10000
				}
			}
		});

		$searchBox.on('select2-selecting', this.map, function(ev) {
			var result = lastResults[ev.val];
			var lonLat = new OpenLayers.LonLat(result.x, result.y);
			ev.data.setCenter(NWC.util.mapUtils.transformWGS84ToMercator(lonLat), 11);
		});
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

		this.setButtonActive($('#select-button'), selectActive);
		this.setButtonActive($('#pan-button'), panActive);
		this.setButtonActive($('#zoom-button'), zoomActive);

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

	legendUrl : function(layer, style) {
		return CONFIG.endpoint.geoserver + 'wms?request=GetLegendGraphic&format=image/png&width=20&height=20' +
			"&layer=" + layer + "&style=" + style +
			"&legend_options=forceLabels:on;fontName:Times New Roman;fontAntiAliasing:true;fontColor:0x000033;fontSize:8px;bgColor:0xFFFFEE;dpi:100";
	}

});

