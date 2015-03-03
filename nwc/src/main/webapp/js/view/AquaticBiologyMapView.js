var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologyMapView = NWC.view.BaseSelectMapView.extend({

	templateName : 'aquaticBiology',

	Model : NWC.model.AquaticBiologySelectMapModel,

	events : {
		'click #gage-layer-button' : 'toggleGageLayer',
		'click #huc-layer-button' : 'toggleHucLayer',
		'click #both-layers-button' : 'turnOnLayers',
		'click #no-layers-button' : 'turnOffLayers'
	},

	initialize : function(options) {
		this.model = new this.Model();

		this.bioDataSitesLayer = new OpenLayers.Layer.WMS(
			"BioData Sites",
				CONFIG.endpoint.geoserver + 'wms',
				{
					layers: 'BioData:SiteInfo',
					transparent: true
				},
				NWC.util.mapUtils.defaultWorkflowLayerProperties
		);
		this.gageFeatureLayer = new OpenLayers.Layer.WMS(
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
				visibility : false
			}
		);
		this.hucLayer = new OpenLayers.Layer.WMS(
			"National WBD Snapshot",
			CONFIG.endpoint.geoserver + 'gwc/service/wms',
			{
				layers: 'NWC:huc12_SE_Basins_v2',
				transparent: true,
				styles: ['polygon']
			},
			{
				isBaseLayer : false,
				displayInLayerSwitcher : false,
				visibility : false
			}
		);

		var getFeatureInfoHandler = function(responseObject) {
			if (responseObject.features.length > 0) {
				console.log('Got features ' + responseObject.features.length);
			}
		};

		this.selectControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title : 'select-control',
			hover : false,
			autoActivate : false,
			drillDown : true,
			layers : [this.bioDataSitesLayer, this.gageFeatureLayer, this.hucLayer],
			queryVisible : true,
			infoFormat: 'application/vnd.ogc.gml',
			vendorParams: {
				radius: 5
			}
		});
		this.selectControl.events.register('getfeatureinfo', this, getFeatureInfoHandler);

		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.addFlowLines();
		this.map.addLayers([this.bioDataSitesLayer, this.gageFeatureLayer, this.hucLayer]);

		this.listenTo(this.model, 'change:gageLayerOn', this.updateGageLayer);
		this.listenTo(this.model, 'change:hucLayerOn', this.updateHucLayer);

		this.updateGageLayer();
		this.updateHucLayer();
	},

	_setCheckBox : function(el, on) {
		if (on) {
			el.addClass('active');
		}
		else {
			el.removeClass('active');
		}
	},

	updateGageLayer : function() {
		var gageOn = this.model.get('gageLayerOn');
		this.gageFeatureLayer.setVisibility(gageOn);
		this._setCheckBox($('#gage-layer-button'), gageOn);
	},
	updateHucLayer : function() {
		var hucOn = this.model.get('hucLayerOn');
		this.hucLayer.setVisibility(hucOn);
		this._setCheckBox($('#huc-layer-button'), hucOn);
	},

	toggleGageLayer : function(ev) {
		ev.preventDefault();
		this.model.set('gageLayerOn', !this.model.get('gageLayerOn'));
	},

	toggleHucLayer : function(ev) {
		ev.preventDefault();
		this.model.set('hucLayerOn', !this.model.get('hucLayerOn'));
	},

	turnOnLayers : function() {
		this.model.set({
			'gageLayerOn' : true,
			'hucLayerOn' : true
		});
	},

	turnOffLayers : function() {
		this.model.set({
			'gageLayerOn' : false,
			'hucLayerOn' : false
		});
	}

});


