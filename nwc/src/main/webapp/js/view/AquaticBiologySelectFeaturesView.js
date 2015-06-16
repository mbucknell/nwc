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
			var listContent = '{{#each tPairs}}<div id="pair-desc">' +
					'<i title="Remove Pair" class="fa fa-times dismiss-btn" data-site-id="{{site.SiteNumber}}" data-gage-id="{{gage.STAID}}"></i>' +
					'Site: {{site.SiteName}}' +
					'{{#if site.DrainageAr}}' +
					', {{site.DrainageAr}} mi<sup>2</sup>' +
					'{{else}}' +
					', mi</sup>2</sup> not available' +
					'{{/if}}' +
					'<br>Gage: {{gage.STANAME}}' +
					'{{#if gage.DRAIN_SQKM}}' +
					', {{gage.DRAIN_SQKM}} km<sup>2</sup>' +
					'{{else}}' +
					', km</sup>2</sup> not available' +
					'{{/if}}' +
					'</div>{{/each}}';
			this.listTemplate = Handlebars.compile(listContent);
			NWC.view.BaseView.prototype.initialize.apply(this, arguments);
			this._displayMap();
        },
       
        checkboxChanged: function (evt) {
			var $cb = $(evt.target),
			name = $cb.attr('name');
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
	    
	    _displayMap : function() {
			this.biodataGageMapView = new NWC.view.BiodataGageMapView({
				mapDiv : 'biodata-gage-selection-map',
				biodataFeature : this.context.biodataSites,
				gageFeature : this.context.gages,
				router : this.router,
				el : $('#biodata-gage-selection-div'),
				model : this.model
			});
        },
    
		removePair: function (evt) {
            var $cb = $(evt.target);
            this.model.associatePairs($cb.data('site-id'),$cb.data('gage-id') ,'remove');    
        },
			
		displayPairList : function () {
			var pairDesc;
			var newPairs = this.model.get('pairs');
			var $pairEl = $('#pair-list');
			$pairEl.find('div').remove();
			$pairEl.append(this.listTemplate({tPairs : newPairs}));
			return this;
		}
        
});