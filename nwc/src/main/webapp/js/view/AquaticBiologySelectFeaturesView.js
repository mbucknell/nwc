var NWC = NWC || {};

NWC.view = NWC.view || {};

NWC.view.AquaticBiologySelectFeaturesView = NWC.view.BaseView.extend({
	templateName : 'aquaticBiologySelectFeatures',  
        context : {
        },
        
        events: {
            'change input[type=checkbox]': 'checkboxChanged',
            'click #selected-sites-button' : 'showSites',
            'click #allSelected' : 'selectAll',
            'click #biodata-form-button' : 'sitesDoc',
            'click #hucs-table-div tr' : 'onHucSelect',
            'click #gages-table-div tr' : 'onGageSelect'
        },

        initialize : function() {
            this.context.biodataSites = this.model.get('sites');
            this.context.gages = this.model.get('gages');
            this.context.hucs = this.model.get('hucs');
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
            this.displayMap();
        },
       
        checkboxChanged: function (evt) {
            
            var $cb      = $(evt.target),
            name     = $cb.attr('name');
            var disable = !($('#sites-table-div input').is(':checked'));
            $('#biodata-form-button').prop('disabled', disable);
            if (name !== 'allSelected') {
                if ($cb.is(':checked')) {
                    this.model.set({ 
                    'selected' : this.model.get('selected').concat(name)
                    });
                } else {
                    var selected = this.model.get('selected');
                    var index = selected.indexOf(name);
                        if (index > -1) {
                            selected.splice(index, 1);
                            this.model.set({ 'selected' : selected});        
                        }
                    }
            } 
        },
        
        selectAll : function(evt){
            var $cb      = $(evt.target);
            var checkAll = ($cb.prop('checked'));
            $('.sites-table td input[type="checkbox"]').each(function() {
                $(this).prop('checked', checkAll).change();
            });
        },
        // send selected sites to Bioshare and pre-populate the sites filter with those sites
        sitesDoc : function () {
                var bioDataSiteSelectionDoc;
                var preselectBioDataSites = function (siteIds) {
                    var doc = bioDataSiteSelectionDoc;
                    var siteNumbersElt = $(doc).find('siteNumbers').empty()[0];
                    siteIds.each(function (siteId) {
                        var child = doc.createElement('siteNumber');
                        child.textContent = siteId;
                        siteNumbersElt.appendChild(child);
                    });

                    //serialize xml document
                    var xmlString = "";
                    
                    try {
                    	xmlString = (new XMLSerializer()).serializeToString(doc);
                    } catch(e) {}

                    //Give IE a shot
                    if (xmlString.length <= 0 && window.ActiveXObject) {
                        xmlString = doc.xml;
                    }
                    $("[name='currentQuery']").val(xmlString);
                    $('#bioData_form').submit();
                };
                var siteIds = this.model.get('selected');

                if (bioDataSiteSelectionDoc) {
                    preselectBioDataSites(siteIds);
                } else {
                    //retrieve document from server
                    $.ajax({
                        url: 'templates/xml/BioDataSiteSelection.xml',
                        success : function (response, status, jqXHR) {
                            bioDataSiteSelectionDoc = response;
                            preselectBioDataSites(siteIds);
                        },
                        error : function (response, status, jqXHR) {
                            alert("Error Retrieving BioData query skeleton");
                        },
                        context : this
                    });
                }
            },
            onHucSelect : function(e){
                e.preventDefault();
                $cb = $(e.currentTarget);
                hucID = $cb.attr('id');
                this.router.navigate('/streamflow-stats/huc/' + hucID, {trigger : true});
            } ,
            onGageSelect : function(e){
                e.preventDefault();
                $cb = $(e.currentTarget);
                gageID = $cb.attr('id');
                this.router.navigate('/streamflow-stats/gage/' + gageID, {trigger : true});
            },
	    
	    displayMap : function() {	
		this.biodataGageMapView = new NWC.view.BiodataGageMapView({
			mapDiv : 'biodata-gage-selection-map',
			//biodataFeature : mapFeatures,
			biodataFeature : this.context.biodataSites,
			router : this.router,
			el : $('#biodata-gage-selection-div')
		});
            }
        
});