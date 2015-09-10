/*jslint browser: true */
/*global OpenLayers */

var NWC = NWC || {};

NWC.view = NWC.view || {};

/*
 * View for the water budget huc selection page
 *
 * @constructor extends NWC.BaseSelectMapView
 */

NWC.view.WaterBudgetMapView = NWC.view.BaseSelectMapView.extend({
	templateName : 'waterbudget',

	events: {
		'change select' : 'toggleLayer'
	},

	context : {
		hucs : {none : "none"},
		warningModalTitle : 'Warning'
	},
	
	hucLayers : [],
	hucLayersIndex : [],

	/**
	 * @constructs
	 * @param {Object} options
	 *	@prop {String} mapDiv
	 *	@prop {NWC.model.WaterBudgetSelectMapModel} model
	 *	@prop {String} hucId - Previously selected watershed
	 */
	initialize : function(options) {
		var self = this;
		var watershedConfig = NWC.config.get('watershed');
				
		var index = 0;
    	Object.keys(watershedConfig, function(key, value) {
    		self.hucLayers[index] = NWC.util.mapUtils.createHucLayer(value.attributes.namespace, value.attributes.layerName, {
    		visibility : false
    		});
    		self.hucLayersIndex[index] = value.attributes.property;
    		self.context.hucs[value.attributes.property] = value.attributes.property;
    		index++;
    	});

		this.selectControl = new OpenLayers.Control.WMSGetFeatureInfo({
			title: 'huc-identify-control',
			hover: false,
			layers: this.hucLayers,
			queryVisible: true,
			infoFormat: 'application/vnd.ogc.gml',
			vendorParams: {
				radius: 5
			},
			autoActivate: false
		});

		var featureInfoHandler = function (responseObject) {
			var actualFeatures = responseObject.features;
			var hucCount = actualFeatures.length;
			if (hucCount > 1) {
				this.showWarningDialog('Multiple watersheds have been selected. Please zoom in and select a single watershed');
			}
			else if (hucCount === 1) {
				var actualFeature = actualFeatures[0];
				var huc;				
		    	Object.keys(watershedConfig, function(key, value) {
		    		if (actualFeature.attributes[value.attributes.property]) {
						huc = actualFeature.attributes[value.attributes.property];
		    		};
		    	});
		    	
				if (Object.has(options, 'hucId')) {
					if (options.hucId === huc) {
						this.showWarningDialog('The same watershed has been selected for comparison. Please select a different watershed');						
					}
					else {
						this.router.navigate('#!waterbudget/comparehucs/' + options.hucId + '/' + huc, {trigger : true});
					}
				}
				else {
					this.router.navigate('#!waterbudget/huc/' + huc, {trigger : true});
				}
			}
		};
        this.selectControl.events.register("getfeatureinfo", this, featureInfoHandler);

		$.extend(this.events, NWC.view.BaseSelectMapView.prototype.events);
		NWC.view.BaseSelectMapView.prototype.initialize.apply(this, arguments);

		this.map.addLayers(this.hucLayers);
		
		if (Object.has(options, 'hucId')) {
			var highlightStyle = new OpenLayers.StyleMap({
				strokeWidth: 2,
				strokeColor: "black",
				fillColor: '#FF9900',
				fillOpacity: 0.4
			});
			var watershedHucConfig = NWC.config.getWatershed(options.hucId);
			this.map.addLayer(NWC.util.mapUtils.createHucFeatureLayer(
				watershedHucConfig.namespace,
				watershedHucConfig.layerName,
				watershedHucConfig.property,
				[options.hucId],
				highlightStyle));
			this.model.set('watershedLayer', watershedHucConfig.property);
			this.$el.find('.huc-layers').val(watershedHucConfig.property).prop('selected');
			this.$el.find('.huc-layers').prop('disabled', true);			
			this.updateLayerVisibility();
		}
		this.addFlowLines();

		this.listenTo(this.model, 'change:watershedLayer', this.updateLayerVisibility);
	},

	/**
	 * Toggles the model's Layer attribute
	 * @param {jquery.Event} ev
	 */
	toggleLayer : function(ev) {
		var newSelection = this.$el.find('.huc-layers option:selected').val();
		this.model.set('watershedLayer', newSelection);
		ev.preventDefault();
	},

	/**
	 * Sets the hucLayer visibility to match this.model's layer attribute.
	 */
	updateLayerVisibility : function() {
		var self = this;
		var layer = this.model.get('watershedLayer');

		//better way to do this?
    	this.hucLayersIndex.forEach(function(el, index) {
    		if (el === layer) {
    			self.hucLayers[index].setVisibility(true)
    		}
    		else {
    			self.hucLayers[index].setVisibility(false)    			
    		}
    	});	
	}
});


