describe('Tests for AquaticBiologyPairView', function() {
	var $testDiv;
	var testView;
	var templateSpy;
	var getTemplateSpy;
	var options;
	var testModel;
	var mock_sites = 
		{
			attributes: {
				SiteNumber:'1234',
				SiteName:'LONESOME CREEK',
				DrainageAr:"23"
			}
		}
	;

	var mock_gages = {
			attributes: {
				STAID:'8765',
				STANAME:'SNARL CREEK',
				DRAIN_SQKM:"999"
			}
		};		
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
		templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : jasmine.createSpy('getTemplateSpy').and.returnValue(templateSpy)
		};
		
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="site-selection-text"><div id="pair-list"><div></div></div></div>');
		$testDiv.append('<input type="text" class="pair-comment col-xs-2" id="site-gage-pair" value="test1">');
		
		
		
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		eventSpy = jasmine.createSpyObj('eventSpy', ['preventDefault']);
		testModel = new NWC.model.PairModel({
				site : mock_sites,
				gage : mock_gages,
				comment: null
			});
		options = {
			listTemplate : templateSpy,
			model : testModel
		};
		testView = new NWC.view.AquaticBiologyPairView(options);
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects updateComment to update comment element in model', function(){		
		testView.updateComment({
			evt : eventSpy,
			currentTarget : document.getElementById('site-gage-pair')});
		expect(testView.model.get("comment")).toMatch('test1');
		});
});