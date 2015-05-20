/* global this */

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
            'click #gages-table-div tr' : 'onGageSelect',
            'click .dismiss-btn' : 'removePair'
        },

        initialize : function() {
            this.context.biodataSites = this.model.get('sites');
            this.context.gages = this.model.get('gages');
            this.context.hucs = this.model.get('hucs');
            this.context.pairs = this.model.get('pairs');
            this.listenTo(this.model, 'change:pairs', this.displayPairList);
            this.listTemplate = Handlebars.compile('{{#each pairs}}<div>Site ID: {{site_id}}, Gage ID: {{gage_id}}<button title="Remove Pair" id="{{site_id}}" name="{{gage_id}}" class="dismiss-btn">x</button></div>{{/each}}');
            NWC.view.BaseView.prototype.initialize.apply(this, arguments);
            this._displayMap();
        },
       
        checkboxChanged: function (evt) {
            var $cb      = $(evt.target),
            name     = $cb.attr('name');
            var disable = !($('#sites-table-div input').is(':checked'));
            $('#biodata-form-button').prop('disabled', disable);
            if (name !== 'allSelected') {
                var selected = this.model.get('selected');
                if ($cb.is(':checked')) {
                    $('#' + name + '-btn').prop('disabled', false);
                    selected.add(name);
                    } else {
                    $('#' + name + '-btn').prop('disabled', true);
                    selected.remove(name);
                };
            }; 
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
	    
	    _displayMap : function(options) {	
		this.biodataGageMapView = new NWC.view.BiodataGageMapView({
			mapDiv : 'biodata-gage-selection-map',
			biodataFeature : this.context.biodataSites,
			gageFeature : this.context.gages,
			router : this.router,
			el : $('#biodata-gage-selection-div'),
			model : this.model
		});
            },
	    
	    highlightGageRow : function(feature) {
		$('#gage-' + feature.attributes.STAID).addClass('gage-selected');
		//this.model.associatePairs(this.selSiteId, feature.attributes.STAID);
		this.managePairList(this.selSiteId, feature.attributes.STAID);
	    },
	
	    unHighlightGageRow : function(feature) {
		$('#gage-' + feature.attributes.STAID).removeClass('gage-selected');
	    },
    
        removePair: function (evt) {
            var $cb      = $(evt.target),
            siteId     = $cb.attr('id'),
            gageId      = $cb.attr('name');
            this.model.associatePairs(siteId,gageId,'remove');    
        },
        
	    displayPairList : function () {
            var newPairs = this.model.get('pairs');
            var $pairEl = $('#pair-list');
            $pairEl.find('div').remove();
            $pairEl.append(this.listTemplate({pairs : newPairs}));
            return this;
	    }
        
});