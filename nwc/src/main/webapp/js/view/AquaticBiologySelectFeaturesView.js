var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologySelectFeaturesView = NWC.view.BaseView.extend({
	templateName : 'aquaticBiologySelectFeatures',  
        context : {
        },
        
        initialize : function() {
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
            this.context.biodataSites = this.model.get('sites');
            $('#sites-table-div').html(NWC.templates.getTemplate('aquaticBiologySitesList')({biodataSites : this.model.get('sites')}));
            }
});