var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologySelectFeaturesView = NWC.view.BaseView.extend({
	templateName : 'aquaticBiologySelectFeatures',  
        context : {
        },
        
        events: {
            'change input[type=checkbox]': 'checkboxChanged',
            'click #selected-sites-button' : 'showSites',
            'click #allSelected' : 'selectAll'
        },
        //render : function() {
	//	NWC.view.BaseView.prototype.render.apply(this, arguments);
        //        alert(JSON.stringify(this.model.getSites()));
        //        var biodataSites = new NWC.collection.Features();
        //        biodataSites.add(this.model.get('sites'));
        //        return this;
	//},
        
        initialize : function() {
            this.context.biodataSites = this.model.get('sites');
            this.context.gages = this.model.get('gages');
            this.context.hucs = this.model.get('hucs');
            $('#sites-table-div').html({biodataSites : this.model.get('sites')});
            $('#gages-table-div').html({gages : this.model.get('gages')});
            $('#hucs-table-div').html({hucs : this.model.get('hucs')});
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
            //this.listenTo(this.model, 'change', this.render);
        },
       
        checkboxChanged: function (evt) {
            
            $cb      = $(evt.target),
            name     = $cb.attr('name');
            if (name != 'allSelected') {
                if ($cb.is(':checked')) {
                    this.model.set({ 
                    'selected' : this.model.get('selected').concat(name)
                });
                } else {
                    var selected = this.model.get('selected');
                    var index = selected.indexOf(name);
                        if (index > -1) {
                        selected.splice(index, 1);
                        }
                }
            }
        },
        
        showSites : function(){
            var selSites = JSON.stringify(this.model.get('selected'));
            alert(selSites);
        },
        
        selectAll : function(evt){
            $cb      = $(evt.target);
            var checkAll = ($cb.prop('checked'));
            $('.sites-table td input[type=checkbox]').each(function() {
                $(this).prop('checked', checkAll).change();
            });
        }
        
});