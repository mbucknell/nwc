var NWC = NWC || {};

NWC.model = NWC.model || {};

/**
 * Model to save current control attributes of a map used to select features.
 * @constructor
 */
NWC.model.BaseSelectMapModel = Backbone.Model.extend({

	defaults : {
		control : 'select'
	}

});


