var NWC = NWC || {};

NWC.model = NWC.model || {};
NWC.collection = NWC.collection || {};

NWC.model.AquaticBiologyFeaturesModel =  Backbone.Model.extend({
	defaults : {
		sites : [],
		gages : [],
		hucs : [],
		selected : [],
		pairs : []
	},
	
	associatePairs : function(s, g, action) {
		var updPairs = this.get('pairs').clone();
		if (action === 'add') {
			updPairs.add({site: s, gage : g});
		};
		if (action === 'remove') {
			updPairs.remove(function(n) {
				return n['site'].SiteNumber === String(s) && n['gage'].STAID === String(g);
				//return n['SiteNumber'] === s && n['STAID'] === g;
			});
		};
		this.set({pairs : updPairs});
	}                    
});