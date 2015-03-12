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
		this.context = {selectBox : true};
		this.aquaticBiologyFeaturesModel = options.aquaticBiologyFeaturesModel;

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

		var biodataProtocol  = new OpenLayers.Protocol.WFS({
			version: "1.1.0",
			url: CONFIG.endpoint.geoserver + 'wfs',
			featureType: 'SiteInfo',
			featureNS: 'http://cida.usgs.gov/BioData',
			srsName: 'EPSG:900913',
			propertyNames: ['SiteNumber', 'SiteName']
		});

		var gageProtocol = OpenLayers.Protocol.WFS.fromWMSLayer(this.gageFeatureLayer, {
			url : CONFIG.endpoint.geoserver + "wfs",
			srsName : "EPSG:3857",
			propertyNames: ["STAID","STANAME","DRAIN_SQKM"]
		});

		var hucProtocol = OpenLayers.Protocol.WFS.fromWMSLayer(this.hucLayer, {
			url : CONFIG.endpoint.geoserver + "wfs",
			srsName : "EPSG:3857"
//			propertyNames : ["HUC12","DRAIN_SQKM", "HU_12_NAME"]
		});

		var featureTypeIsVisible = function(featureType) {
			if (featureType === 'SiteInfo') {
				return true; // Always visible
			}
			else if (featureType === 'gagesII') {
				return this.gageFeatureLayer.getVisibility();
			}
			else if (featureType === 'huc12_SE_Basins_v2') {
				return this.hucLayer.getVisibility();
			}
		};

		var getFeatureProtocolList = [gageProtocol, hucProtocol, biodataProtocol];

		/**
		 * Create a protocol which will issue all three getFeatureInfo requests and
		 * combine the results into a single results array.
		 * @param {Array of OpenLayers.Protocols} protocols
		 * @param {Object} scope - the scope to be used when processing the individual protocol objects.
		 */
		var joinedProtocol = new (function(protocols, scope) {
			this.protocols = protocols;

			/*
			 * Calls each protocols read function if the associated feature's layer is visible.
			 * The callback function for each read
			 * adds the results to the common results, and sets it's deferred to resolved.
			 * when all reads have finished, the original request's callback is called with
			 * the common results array.
			 */
			this.read = function(request) {
				var deferreds = [];
				var theResults = [];

				this.protocols.forEach(function(el) {
					var thisDeferred = $.Deferred();
					deferreds.push(thisDeferred);
					if (featureTypeIsVisible.apply(scope, [el.featureType])) {
						var newCallback = function(result) {
							if (result.success()) {
								theResults = theResults.concat(result.features);
							}
							thisDeferred.resolve();
						};
						var newRequest = Object.clone(request);
						newRequest.callback = newCallback;
						el.read(newRequest);
					}
					else {
						thisDeferred.resolve();
					}
				}, scope);

				$.when.apply(this, deferreds).done(function() {
					request.callback.apply(request.scope, [{
						success : function() { return true; },
						features: theResults
					}]);
				});
			};
			this.abort = function(abortParam) {
				this.protocols.each(function(el) {
					el.abort(abortParam);
				});
			};
		})(getFeatureProtocolList, this);

		var getFeatureHandler = function(responseObject) {
			var features = responseObject.features;
			if (responseObject.type === 'featuresselected') {
				var siteFeatures = features.findAll(function(f) {
					return f.fid.startsWith('SiteInfo');
				});
				var gageFeatures = features.findAll(function(f) {
					return f.fid.startsWith('gagesII');
				});
				var hucFeatures = features.findAll(function(f) {
					return f.fid.startsWith('huc12_SE_Basins_v2');
				});

				this.aquaticBiologyFeaturesModel.set({
					sites : siteFeatures.map(function(f) { return f.attributes; }),
					gages : gageFeatures.map(function(f) { return f.attributes; }),
					hucs : hucFeatures.map(function(f) { return f.attributes; })
				});
				this.router.navigate('/aquatic-biology/select-features', {trigger : true});
			};
		};

		this.selectControl = new OpenLayers.Control.GetFeature({
			protocol : joinedProtocol,
			box: true
		});

		this.selectControl.events.register('featuresselected', this, getFeatureHandler);
		this.selectControl.events.register('clickout', this, getFeatureHandler);
		this.selectControl.events.register('endselect', this, function() {console.log('endselect event handler');});

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.addFlowLines();
		this.map.addLayers([this.bioDataSitesLayer, this.gageFeatureLayer, this.hucLayer]);

		this.listenTo(this.model, 'change:gageLayerOn', this.updateGageLayer);
		this.listenTo(this.model, 'change:hucLayerOn', this.updateHucLayer);

		this.updateGageLayer();
		this.updateHucLayer();
	},

	_setButtonActive : function(el, on) {
		if (on) {
			el.addClass('active');
		}
		else {
			el.removeClass('active');
		}
	},

	_setVisibility : function(el, on) {
		if (on) {
			el.show();
		}
		else {
			el.hide();
		}
	},

	updateGageLayer : function() {
		var gageOn = this.model.get('gageLayerOn');
		this.gageFeatureLayer.setVisibility(gageOn);
		this._setButtonActive($('#gage-layer-button'), gageOn);
		this._setVisibility($('#streamflow-observed-info'), gageOn);

		// Because this shifts the map's location on the page, call updateSize
		this.map.updateSize();
	},
	updateHucLayer : function() {
		var hucOn = this.model.get('hucLayerOn');
		this.hucLayer.setVisibility(hucOn);
		this._setButtonActive($('#huc-layer-button'), hucOn);
		this._setVisibility($('#modeled-streamflow-info'), hucOn);

		// Because this shifts the map's location on the page, call updateSize
		this.map.updateSize();
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


