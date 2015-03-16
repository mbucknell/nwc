var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologySelectFeaturesView = NWC.view.BaseView.extend({
	templateName : 'aquaticBiologySelectFeatures',  
        context : {
        },
        
        initialize : function() {
            this.context.biodataSites = this.model.get('sites');
            this.context.gages = this.model.get('gages');
            this.context.hucs = this.model.get('hucs');
            $('#sites-table-div').html({biodataSites : this.model.get('sites')});
            $('#gages-table-div').html({gages : this.model.get('gages')});
            $('#hucs-table-div').html({hucs : this.model.get('hucs')});
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
            }
});