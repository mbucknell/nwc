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
        this.updPairs = this.get('pairs').clone();
	    if (action === 'add') {
            this.updPairs.add({site_id: s, gage_id : g});
	    };
	    if (action === 'remove') {
            this.updPairs.remove(function(n) {
	        return n['site_id'] === s && n['gage_id'] === g;
            });
	    };
        this.set({pairs : this.updPairs});
	}
                        
});