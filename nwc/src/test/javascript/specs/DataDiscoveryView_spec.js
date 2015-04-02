
describe('Tests for DataDiscoveryView', function() {
	var $testDiv;
	var testView;
	var testList = '{"total":1,"took":"18ms","selflink":{"rel":"self","url":"https://www.sciencebase.gov/catalog/items?facetTermLevelLimit=false&max=100&q=&community=National+Water+Census&filter0=browseCategory%3DProject&format=json"},"items":[{"link":{"rel":"self","url":"https://www.sciencebase.gov/catalog/item/5151f42de4b0f0b3d011a81f"},"relatedItems":{"link":{"url":"https://www.sciencebase.gov/catalog/itemLinks?itemId=5151f42de4b0f0b3d011a81f","rel":"related"}},"id":"5151f42de4b0f0b3d011a81f","title":"Colorado River Geographic Focus Area Study","summary":"Working to better quantify selected components of the water budget in the Colorado River Basin to assist in the assessment of water availability for the region.","hasChildren":true}]}'

	beforeEach(function() {

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="project-list-div"></div>');

		window.CONFIG = {};
		CONFIG.endpoint = {};
		CONFIG.endpoint.direct = {};
		CONFIG.endpoint.direct.sciencebase = 'http://test';

	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn($, "ajax");
		testView = new NWC.view.DataDiscoveryView();
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects getProjectData to use the correct url for ajax call', function() {
		spyOn(NWC.view.BaseView.prototype, 'initialize');
		spyOn($, "ajax");
		testView = new NWC.view.DataDiscoveryView();
		expect($.ajax.mostRecentCall.args[0]["url"]).toEqual(CONFIG.endpoint.direct.sciencebase +
				'/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json');
	});

	it('Expects getProjectData to receive a successful ajax response', function() {
//		spyOn(NWC.view.BaseView.prototype, 'initialize');
//	    spyOn($, "ajax").andCallFake(function(e) {
//	    	e.success({});
//	    });
//		testView = new NWC.view.DataDiscoveryView();
//		expect(NWC.templates.getTemplate).toHaveBeenCalled();
	});

	it('Expects getProjectData to receive a error for no ajax response', function() {
	});

});