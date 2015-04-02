var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the streamflow stats selection page
 *
 * @constructor extends NWC.BaseSelectMapView
 */
NWC.view.StreamflowStatsMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'streamflowStats',

	context : {
		warningModalTitle : 'Selection Warning'
	},

	events : {
		'click #map-streamflow-type-group button' : 'changeStreamflowType',
		'click #stream-gage-filters-div a' : 'changeGageFilter'
	},

	Model : NWC.model.StreamflowStatsSelectMapModel,

	/*
	 * @constructs
	 * @param {Object options}
	 *	@prop {String} mapDiv
	 */
	initialize : function(options) {
		this.model = new this.Model();

		this.gagesLayer = new OpenLayers.Layer.WMS(
			"Gage Location",
			CONFIG.endpoint.geoserver + 'NWC/wms',
			{
				LAYERS: "NWC:gagesII",
				STYLES: 'blue_circle',
				format: 'image/png',
				transparent: true,
				tiled: true
			},
			{
				isBaseLayer: false,
				displayInLayerSwitcher: false,
				visibility: false
			}
		);

		this.hucLayer = new OpenLayers.Layer.WMS("National WBD Snapshot",
			CONFIG.endpoint.geoserver + 'gwc/service/wms',
			{
				layers: 'NWC:huc12_se_basins_v2',
				transparent: true,
				styles: ['seOutline']
			},
			{
				opacity: 0.6,
				displayInLayerSwitcher: false,
				visibility: false,
				isBaseLayer: false,
				tiled: true
			}
		);

		this.legendControl = new OpenLayers.Control.Attribution();

		var gageFeatureInfoHandler = function(responseObject) {
			if (responseObject.features.length > 1) {
				this.showWarningDialog('Multiple gages were selected. Please zoom in and select a single gage.')
			}
			else if (responseObject.features.length === 1) {
				this.router.navigate('/streamflow-stats/gage/' + responseObject.features[0].attributes.STAID, {trigger : true});
			}
		};
		this.gageControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title : 'selection-control',
			hover : false,
			autoActivate : false,
			layers : [this.gagesLayer],
			queryVisible : true,
			infoFormat: 'application/vnd.ogc.gml',
			vendorParams: {
				radius: 5
			}
		});
		this.gageControl.events.register("getfeatureinfo", this, gageFeatureInfoHandler);

		var hucFeatureHandler = function(responseObject) {
			var sortedFeature;
			if (responseObject.features.length > 0) {
				sortedFeature = responseObject.features.min(function(el) {
					var result = Infinity;

                    var mi2 = parseFloat(el.data.mi2);
					if (mi2) {
						result = mi2;
					}

					return result;
				});

				// Determine if the model for this feature is valid
				var km2 = NWC.util.Convert.acresToSquareKilometers(
							NWC.util.Convert.squareMilesToAcres(sortedFeature.data.mi2));
				if (km2 > 2000) {
					this.showWarningDialog("Hydrologic model results are not valid for watersheds this large (" + km2.round(0) + " km^2), please choose a smaller watershed.");
				} else {
					this.router.navigate('/streamflow-stats/huc/' + sortedFeature.attributes.huc12, {trigger : true});
				}
			}
		};

		this.hucsControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title : 'huc-control',
			hover : false,
			autoActivate : false,
			layers : [this.hucLayer],
			queryVisible : true,
			infoFormat: 'application/vnd.ogc.gml',
			vendorParams: {
				radius: 5
			}
		});
		this.hucsControl.events.register('getfeatureinfo', this, hucFeatureHandler);

		this.selectControl = this.gageControl;

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.map.addLayers([this.gagesLayer, this.hucLayer]);
		this.addFlowLines();

		this.map.addControl(this.legendControl);
		this.map.addControl(this.hucsControl);

		this.listenTo(this.model, 'change:streamflowType', this.updateSelectionLayer);
		this.listenTo(this.model, 'change:gageFilter', this.updateGageFilter);

		this.updateSelectionLayer();
		this.updateGageFilter();
	},

	changeStreamflowType : function(ev) {
		this.model.set('streamflowType', ev.target.value);
	},

	changeGageFilter : function(ev) {
		ev.preventDefault();
		this.model.set('gageFilter', $(ev.target).data('value'));
	},


	updateSelectionLayer : function() {
		var $modeledInfo = $('#modeled-streamflow-warning-div');
		var $observedInfo = $('#observed-streamflow-info-div');
		var $gageFilteringDiv = $('#stream-gage-filters-div');

		var streamflowType = this.model.get('streamflowType');

		var gageVisible = streamflowType === 'observed';
		var hucVisible = streamflowType === 'modeled';

		var setControlActive = function(toControl, active) {
			if (active) {
				toControl.activate();
			}
			else {
				toControl.deactivate();
			}
		};

		// Set layer visibility
		this.gagesLayer.setVisibility(gageVisible);
		this.hucLayer.setVisibility(hucVisible);

		setControlActive(this.legendControl, gageVisible);

		this._setButtonActive($('#observed-button'), gageVisible);
		this._setButtonActive($('#modeled-button'), hucVisible);

		if (hucVisible) {
			$modeledInfo.show();
			setControlActive(this.hucsControl, this.selectControl.active);
			this.gageControl.deactivate();
			this.selectControl = this.hucsControl;
		}
		else {
			$modeledInfo.hide();
		}

		if (gageVisible) {
			$observedInfo.show();
			$gageFilteringDiv.show();
			setControlActive(this.gageControl, this.selectControl.active);
			this.hucsControl.deactivate();
			this.selectControl = this.gageControl;
		}
		else {
			$observedInfo.hide();
			$gageFilteringDiv.hide();
		}

		// Because this shifts the map's location on the page, call updateSize
		this.map.updateSize();
	},

	updateGageFilter : function() {
		var filterVal = this.model.get('gageFilter');
		var filterDescr = $('#stream-gage-filters-div a[data-value="' + filterVal + '"]').html();
		var legendUrl = function(style) {
			return CONFIG.endpoint.geoserver + 'NWC/wms?request=GetLegendGraphic&format=image/png&width=20&height=20' +
				"&layer=gagesII&style=" + style +
				"&legend_options=forceLabels:on;fontName:Times New Roman;fontAntiAliasing:true;fontColor:0x000033;fontSize:8px;bgColor:0xFFFFEE;dpi:100";
		};

		$('#filter-label').html(filterDescr);
		this.gagesLayer.addOptions({attribution: '<img src="' + legendUrl(this.model.getFilterStyle()) + '"/>'});
		this.gagesLayer.mergeNewParams({STYLES : this.model.getFilterStyle()});
	}
});


