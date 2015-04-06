describe('Tests for DataDiscoveryView (sinon version)', function() {
	var $testDiv;
	var testView;
	var server;
	
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

		//do this to prevent intialize from running
		spyOn(NWC.view.BaseView.prototype, 'initialize'); 
		
		server = sinon.fakeServer.create();

	});

	afterEach(function() {
		$testDiv.remove();
		server.restore();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		testView = new NWC.view.DataDiscoveryView();
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects getProjectData to use the correct url for ajax call', function() {
		testView = new NWC.view.DataDiscoveryView();
		expect(server.requests.last().url).toMatch('http://test');
	});

	it('Expects getProjectData to make an ajax call', function() {
		var requestCount = server.requests.length;
		var getTemplateSpy = jasmine.createSpy('getTemplateSpy')
		var templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : getTemplateSpy.andReturn(templateSpy)
		};
		testView = new NWC.view.DataDiscoveryView();		
		expect(server.requests.length).toBe(requestCount + 1);
	});

	it('Expects getProjectData to receive a error for no ajax response', function() {
		spyOn(window, 'alert');
		testView = new NWC.view.DataDiscoveryView();		
		server.requests[0].respond(
			400,
			{ "Content-Type": "application/json" },
			JSON.stringify([{}])
		);
		expect(alert).toHaveBeenCalled();
	});

	it('Expect that event handler calls exist', function() {
		//the view has an event to wire up the clickable project details
		expect(testView.events['click #show-project-detail-button']).toBeDefined();
	});

	it('Expects showProjectDetail to use the correct url for ajax call', function() {
		testView = new NWC.view.DataDiscoveryView();
		var event = {currentTarget : '#show-project-detail-button'}
		testView.showProjectDetail(event);
		expect(server.requests.last().url).toMatch('http://test');
	});

	it('Expects showProjectDetail to make ajax call', function() {
		var getTemplateSpy = jasmine.createSpy('getTemplateSpy')
		var templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : getTemplateSpy.andReturn(templateSpy)
		};
		testView = new NWC.view.DataDiscoveryView();
		var event = {currentTarget : '#show-project-detail-button'}
		var requestCount = server.requests.length;
		testView.showProjectDetail(event);
		expect(server.requests.length).toBe(requestCount + 1);
	});

	it('Expects showProjectDetail to receive a error for no ajax response', function() {
		spyOn(window, 'alert');
		testView = new NWC.view.DataDiscoveryView();
		var event = {currentTarget : '#show-project-detail-button'};
		testView.showProjectDetail(event);
		server.requests[0].respond(
				400,
				{ "Content-Type": "application/json" },
				JSON.stringify([{}])
			);
		expect(alert).toHaveBeenCalled();
	});
	
});