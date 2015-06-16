describe('Tests for AquaticBiologySelectFeaturesView', function() {
	var $testDiv;
	var testView;
	var mock_sites = [{attributes: {
			SiteNumber:'1234',
			SiteName:'LONESOME CREEK',
			DrainageAr:"23"
		}},
		{attributes:{
			SiteNumber:'5678',
			SiteName:'HOOLIGAN RIVER',
			DrainageAr:"299"
		}}
		];

	var mock_gages = [{
			STAID:'4321',
			STANAME:'MUD RIVER',
			DRAIN_SQKM:"403"
		},
		{
			STAID:'8765',
			STANAME:'SNARL CREEK',
			DRAIN_SQKM:"999"
		}
		];
		
	var mock_sitePair = {
			SiteNumber:'1234',
			SiteName:'LONESOME CREEK',
			DrainageAr:"23"
		};
	
	var mock_gagePair = {
			STAID:'8765',
			STANAME:'SNARL CREEK',
			DRAIN_SQKM:"999"
		};
		
	var mock_sitePair1 = {
			SiteNumber:'05234',
			SiteName:'FROG POND',
			DrainageAr:"233"
		};
	
	var mock_gagePair1 = {
			STAID:'80432765',
			STANAME:'RAGING RIVER',
			DRAIN_SQKM:"992"
		};
	var mock_sitePair2 = {
			SiteNumber:'3939234',
			SiteName:'SEA OF TRANQILITY',
			DrainageAr:"2"
		};
	
	var mock_gagePair2 = {
			STAID:'3939234',
			STANAME:'SEA OF TRANQILITY',
			DRAIN_SQKM:"99"
		};
	beforeEach(function() {
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="site-selection-text"><div id="pair-list"><div></div></div></div>')
		$testDiv.append ('<div id="sites-table-div"><input type="checkbox" id="as1" name="as1" value="as1"/><input type="checkbox" id="allSelected" name="allSelected"/>');
		$testDiv.append('<button id="biodata-form-button" disabled="disabled" class="btn btn-success"></button>');
		$testDiv.append('<table class="sites-table">');
		$testDiv.append('<tr><td><input type="checkbox" class="sites" id="as2" name="as2" value="as2"/></td></tr>');
		$testDiv.append('<tr><td><input type="checkbox" class="sites" id="as3" name="as3" value="as3"/></td></tr>');
		$testDiv.append('</table></div>');
		
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);
		spyOn(NWC.view.BiodataGageMapView.prototype, 'initialize');
		
							
		
		testView = new NWC.view.AquaticBiologySelectFeaturesView({
			model : new NWC.model.AquaticBiologyFeaturesModel({
				sites : mock_sites,
				hucs : ["21312","23234","34534534"],
				gages : mock_gages,
				selected : [],
				pairs : []
			})
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects view\'s constructor to set the context property', function() {
		expect(testView.context).toBeDefined();
		expect(testView.context.biodataSites).toEqual(mock_sites);
        expect(testView.context.gages).toEqual(mock_gages);
        expect(testView.context.hucs).toEqual(["21312","23234","34534534"]);
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects view.checkboxChanged to enable the biodata form button if any of the site checkboxes have been checked', function() {
		$('#as1').prop('checked', true);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1')});
		expect($('#biodata-form-button').prop('disabled')).toBe(false);

		$('#as1').prop('checked', false);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1')});
		expect($('#biodata-form-button').prop('disabled')).toBe(true);
	});
        
	it('Expects view.checkboxChanged to add or remove checkbox name to selected array', function() {
		$('#as1').prop('checked', true);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1')});
		expect(testView.model.get('selected')).toEqual(['as1']);
                
		$('#as1').prop('checked', false);
		testView.checkboxChanged({
			evt : eventSpy,
			target : document.getElementById('as1') });
		expect(testView.model.get('selected')).toEqual([]);
	});
    
	it('Expects model.associatePairs to add or remove site and gage pairs to pairs array', function(){
		
		testView.model.associatePairs(mock_sitePair, mock_gagePair, 'add');
		expect(testView.model.get('pairs')).toEqual([{site : mock_sitePair, gage: mock_gagePair}]);
		
		testView.model.associatePairs(mock_sitePair, mock_gagePair, 'add');
		testView.model.associatePairs('1234', '8765', 'remove');
		expect(testView.model.get('pairs')).toEqual([]);
		
		testView.model.associatePairs(1234, 8765, 'remove');
		expect(testView.model.get('pairs')).toEqual([]);

		testView.model.associatePairs(mock_sitePair, mock_gagePair, 'add');
		testView.model.associatePairs(mock_sitePair1, mock_gagePair1, 'add');
		testView.model.associatePairs(mock_sitePair2, mock_gagePair2, 'add');
		testView.model.associatePairs('1234', '8765', 'remove');
		var goodPair = {site: mock_sitePair1, gage: mock_gagePair1};
		expect(testView.model.get('pairs')).toContain(goodPair);
		goodPair = {site: mock_sitePair2, gage: mock_gagePair2};
		expect(testView.model.get('pairs')).toContain(goodPair);
		var badPair = {site: mock_sitePair, gage: mock_gagePair};
		expect(testView.model.get('pairs')).not.toContain(badPair);
	});
	
	it('Expects a displayPairList to display the correct pairs', function(){
		testView.model.associatePairs(mock_sitePair1, mock_gagePair1, 'add');
		testView.displayPairList();
		expect($('#pair-list div').html()).toMatch(/Site: FROG POND/);
		expect($('#pair-list div').html()).toMatch(/Gage: RAGING RIVER/);
		testView.model.associatePairs('05234', '80432765', 'remove');
		testView.displayPairList();
		expect($('#pair-list div').html()).not.toMatch(/Site: FROG POND/);
		expect($('#pair-list div').html()).not.toMatch(/Gage: RAGING RIVER/);
	});
});