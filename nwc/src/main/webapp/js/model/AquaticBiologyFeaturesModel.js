var NWC = NWC || {};

NWC.model = NWC.model || {};
NWC.collection = NWC.collection || {};

NWC.model.AquaticBiologyFeaturesModel =  Backbone.Model.extend({
        defaults : {
            sites : [],
            gages : [],
            hucs : []
        }                       
                        
});


NWC.collection.Features = Backbone.Collection.extend({
  model: NWC.model.AquaticBiologyFeaturesModel
});