describe('Tests for AquaticBiologyPairView', function() {
	var $testDiv;
	var testView;
	var templateSpy;
	var getTemplateSpy;
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
		getTemplateSpy = jasmine.createSpy('getTemplateSpy');
		NWC.templates = {
			getTemplate : jasmine.createSpy('getTemplateSpy').andReturn(templateSpy)
		};
		
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="site-selection-text"><div id="pair-list"><div></div></div></div>');
		
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);
		
		testView = new NWC.view.AquaticBiologyPairView({
			model : new NWC.model.PairModel({
				site : null,
				gage : null,
				comment: null
			})
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects collection.addPair to add site and gage pairs to pairs collection', function(){		
		testView.collection.addPair(mock_sitePair, mock_gagePair);
		expect(testView.model.get('site')).toEqual(mock_sitePair);
		expect(testView.model.get('gage')).toEqual(mock_gagePair);

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