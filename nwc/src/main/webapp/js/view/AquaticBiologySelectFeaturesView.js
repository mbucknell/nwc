var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologySelectFeaturesView = NWC.view.BaseView.extend({
	templateName : 'aquaticBiologySelectFeatures',
        template: $('#biodata-site-template').html(),    
        render : function() {
		NWC.view.BaseView.prototype.render.apply(this, arguments);
                alert(JSON.stringify(this.model.getSites()));
                var biodataSites = new NWC.collection.Features();
                biodataSites.add(this.model.getSites());
	},
        initialize : function() {
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
            
        }
         
        //biodataSites: new NWC.collection.Sites(),
});