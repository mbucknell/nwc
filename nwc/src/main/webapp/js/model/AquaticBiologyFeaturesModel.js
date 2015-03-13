var NWC = NWC || {};

NWC.model = NWC.model || {};
NWC.collection = NWC.collection || {};

NWC.model.AquaticBiologyFeaturesModel =  Backbone.Model.extend({
        defaults : function() {
		return $.extend({
			sites : [],
                        gages : [],
                        hucs : []
		}, NWC.model.BaseSelectMapModel.prototype.defaults);
	},
        getSites: function(){
           // var biodata_sites = this.get('sites');
           // newBiodataSites = {};
                  
           // this.each(biodata_sites, function(site) {
           //     newBiodataSites[site.SiteNumber] = {
           //         'SiteName': site.SiteName
           //     };
            return this.get('sites');
            }
});


NWC.collection.Features = Backbone.Collection.extend({
  model: NWC.model.AquaticBiologyFeaturesModel
});