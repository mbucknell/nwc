
describe('Tests for DataDiscoveryView', function() {
	var $testDiv;
	var testView;

	beforeEach(function() {

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="project-list-div">');
		$testDiv.append('<button id="show-project-detail-button" data-id="12345" class="btn btn-primary btn-xs" title="Show details" >+</button>');
		$testDiv.append('<div id="12345" class="page_body_content" hidden></div>');
		$testDiv.append('</div>');

		window.CONFIG = {};
		CONFIG.endpoint = {};
		CONFIG.endpoint.direct = {};
		CONFIG.endpoint.direct.sciencebase = 'http://test';

		spyOn(NWC.view.BaseView.prototype, 'initialize');

	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		spyOn($, "ajax");
		testView = new NWC.view.DataDiscoveryView();
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects getProjectData to use the correct url for ajax call', function() {
		spyOn($, "ajax");
		testView = new NWC.view.DataDiscoveryView();
		expect($.ajax.mostRecentCall.args[0]["url"]).toEqual(CONFIG.endpoint.direct.sciencebase +
				'/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject&max=100&format=json');
	});

	it('Expects getProjectData to call getTemplate on successful ajax response', function() {
	    spyOn($, "ajax").andCallFake(function(e) {
	    	e.success({});
	    });

		var getTemplateSpy = jasmine.createSpy('getTemplateSpy')
		var templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : getTemplateSpy.andReturn(templateSpy)
		};
		testView = new NWC.view.DataDiscoveryView();
		expect(NWC.templates.getTemplate).toHaveBeenCalled();
	});

	it('Expects getProjectData to receive a error for no ajax response', function() {
	    spyOn($, "ajax").andCallFake(function(e) {
	    	e.error({});
	    });
		spyOn(window, 'alert');
		testView = new NWC.view.DataDiscoveryView();
		expect(alert).toHaveBeenCalled();
	});

	it('Expect that event handler calls exist', function() {
		//the view has an event to wire up the clickable project details
		expect(testView.events['click #show-project-detail-button']).toBeDefined();
	});

	it('Expects showProjectDetail to use the correct url for ajax call', function() {
		spyOn($, "ajax");
		testView = new NWC.view.DataDiscoveryView();
		var event = {currentTarget : '#show-project-detail-button'}
		testView.showProjectDetail(event);
		expect($.ajax.mostRecentCall.args[0]["url"]).toEqual(CONFIG.endpoint.direct.sciencebase +
				'/catalog/item/12345?format=json');
	});

	it('Expects showProjectDetail to call getTemplate on successful ajax response', function() {
	    spyOn($, "ajax").andCallFake(function(e) {
	    	e.success({});
	    });

		var getTemplateSpy = jasmine.createSpy('getTemplateSpy')
		var templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : getTemplateSpy.andReturn(templateSpy)
		};
		testView = new NWC.view.DataDiscoveryView();
		var event = {currentTarget : '#show-project-detail-button'}
		testView.showProjectDetail(event);
		expect(NWC.templates.getTemplate).toHaveBeenCalled();
	});

	it('Expects showProjectDetail to receive a error for no ajax response', function() {
	    spyOn($, "ajax").andCallFake(function(e) {
	    	e.error({});
	    });
		spyOn(window, 'alert');
		testView = new NWC.view.DataDiscoveryView();
		var event = {currentTarget : '#show-project-detail-button'}
		testView.showProjectDetail(event);
		expect(alert).toHaveBeenCalled();
	});
});