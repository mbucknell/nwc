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
		'click #download-pairs-button' : 'downloadPairs'
	},

	initialize : function() {
		this.context.biodataSites = this.model.get('sites');
		this.context.gages = this.model.get('gages');
		this.context.hucs = this.model.get('hucs');
		this.collection = new NWC.model.PairCollection();
		this.pairViews = [];
		NWC.view.BaseView.prototype.initialize.apply(this, arguments);
		this.listenTo(this.collection, 'add', this.displayPairList);
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
	},
	
	onGageSelect : function(e){
		e.preventDefault();
		$cb = $(e.currentTarget);
		gageID = $cb.attr('id');
		this.router.navigate('/streamflow-stats/gage/' + gageID, {trigger : true});
	},
	   
	displayPairList : function (pair) {
		var pairView = new NWC.view.AquaticBiologyPairView({
			model: pair
		});
		this.$("#pair-list").append(pairView.render().el);
		// push created views to an array so that they can be removed later
		this.pairViews.push(pairView);
	},
	
	_displayMap : function() {
		this.biodataGageMapView = new NWC.view.BiodataGageMapView({
			mapDiv : 'biodata-gage-selection-map',
			biodataFeature : this.context.biodataSites,
			gageFeature : this.context.gages,
			router : this.router,
			el : $('#biodata-gage-selection-div'),
			collection : this.collection
		});
	},
		
	downloadPairs : function() {
		var blob = new Blob([this.collection.toCSV()], {type:'text/csv'});
		saveAs(blob, 'AquaticBiologyNWISGagePairs.csv');
	},
		
	remove : function() {
		this.pairViews.each(function(pv){
			pv.remove();
		});
		NWC.view.BaseView.prototype.remove.apply(this, arguments);
	}
		
});