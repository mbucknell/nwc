var NWC = NWC || {};

NWC.model = NWC.mode || {};

NWC.model.BaseSelectMapModel = Backbone.Model.extend({

	defaults : {
		control : 'select',
		featurelayer : null,
		extent : null,
		selectControls : null,
		zoomBoxControl : new OpenLayers.Control.ZoomBox()
	}

});


