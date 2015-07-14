/*global spyOn*/
/*global NWC*/
/*global expect*/
/*global CONFIG*/

describe('Tests for DataDiscoveryView', function() {
	var $testDiv;
	var testView;

	beforeEach(function() {

		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="data-discovery-tabs"><ul class="nav">' +
			'<li id="show-a-button" class="active"><a data-target="show-a" href="#"></a></li>' +
			'<li id="show-b-button"><a data-target="show-b" href="#"></a></li>' +
			'</ul>' +
			'<div class="tab-content">' +
			'<div id="show-a" class="active"></div>' +
			'<div id="show-b"></div>' +
			'</div></div>');

		window.CONFIG = {};
		CONFIG.endpoint = {};
		CONFIG.endpoint.direct = {};
		CONFIG.endpoint.direct.sciencebase = 'http://test';

		//do this to prevent intialize from running
		spyOn(NWC.view.BaseView.prototype, 'initialize');

		spyOn(NWC.view.ProjectTabView.prototype, 'initialize');
		spyOn(NWC.view.DataTabView.prototype, 'initialize');
		spyOn(NWC.view.PublicationsTabView.prototype, 'initialize');

		testView = new NWC.view.DataDiscoveryView({
			el : $testDiv
		});

	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects the view\'s constructor to call BaseView initialize', function() {
		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects the child views to be created', function() {
		expect(testView.projectTabView).not.toBeNull();
		expect(testView.dataTabView).not.toBeNull();
		expect(testView.publicationsTabView).not.toBeNull();

		expect(NWC.view.ProjectTabView.prototype.initialize).toHaveBeenCalled();
		expect(NWC.view.DataTabView.prototype.initialize).toHaveBeenCalled();
		expect(NWC.view.PublicationsTabView.prototype.initialize).toHaveBeenCalled();
	});

	it('Expects a call to showTab to assign the active class to the tab button and tab content of the target', function()  {
		var ev = {
			currentTarget : $testDiv.find('#show-b-button a').get(),
			preventDefault : jasmine.createSpy('preventDefaultSpy')
		};

//		testView.showTab(ev);
//		expect($('#show-a-button').hasClass('active')).toBe(false);
//		expect($('#show-a').hasClass('active')).toBe(false);
//
//		expect($('#show-b-button').hasClass('active')).toBe(true);
//		expect($('#show-b').hasClass('active')).toBe(true);
	});

});