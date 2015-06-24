var NWC = NWC || {};

NWC.model = NWC.model || {};

NWC.model.AquaticBiologyFeaturesModel =  Backbone.Model.extend({
	defaults : {
		sites : [],
		gages : [],
		hucs : [],
		selected : []
	}         
});

NWC.model.PairModel =  Backbone.Model.extend({
	defaults : {
		site: null,
		gage: null,
		comment: null
	}
});

NWC.model.PairCollection = Backbone.Collection.extend({
	Model : NWC.model.PairModel,
	
	addPair : function(s,g) {
		var newPair = new this.Model({site: s, gage: g, comment: null});
		this.add(newPair);
		var newId = this._byId;
		
		//var updPairs = this.get('pairs').clone();
		//if (action === 'add') {
		//	updPairs.add({site: s, gage : g, comment: null});
		//};
		//if (action === 'remove') {
		//	updPairs.remove(function(n) {
		//		return n['site'].SiteNumber === String(s) && n['gage'].STAID === String(g);
		//	});
		//};
		//this.set({pairs : updPairs});
	} 
});

