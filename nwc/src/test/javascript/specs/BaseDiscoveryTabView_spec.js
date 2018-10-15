/*global expect*/
/*global sinon*/
/*global NWC*/
/*global jasmine*/

describe('NWC.view.BaseDiscoveryTabView', function() {
	var server;
	var TestView;
	var testView;
	var templateSpy;
	var testListResponse

	beforeEach(function() {
		var testHtml = '<div id="test-div"><div class="summary-container-div">' +
			'<div class="summary-content-div"></div>' +
			'<button id="test-button" class="toggle-details-btn" data-id="1234" title="Show details"></button>' +
			'<div id="1234" class="details-content"></div>' +
			'</div></div>';

		testListResponse = '{"items" : [{"id": "1"}, {"id" : "2"}]}';

		TestView = NWC.view.BaseDiscoveryTabView.extend({
			listTemplateName : 'listTemplate',
			detailsTemplateName : 'detailsTemplate',
			listUrl : function() {
				return 'http://fakeserver.com/list';
			},
			detailsUrl : function(id) {
				return 'http://fakeserver.com/details/' + id;
			}
		});

		templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = {
			getTemplate : jasmine.createSpy('getTemplateSpy').and.returnValue(templateSpy)
		};

		spyOn(window, 'alert');

		server = sinon.fakeServer.create();

		$('body').append(testHtml);

		testView = new TestView({
			showSummary : true,
			el : $('#test-div')
		});
	});

	afterEach(function() {
		$('#test-div').remove();
		server.restore();
	});

	it('Expects that creating a view  renders the listTemplate and calls the ajax function with the listUrl', function() {
		expect(NWC.templates.getTemplate).toHaveBeenCalledWith('listTemplate');
		expect(server.requests.length).toBe(1);
		expect(server.requests[0].url).toEqual('http://fakeserver.com/list');
	});

	it('Expects the template to be rendered when a successful call is made using the data as the list property', function() {
		server.respond([200, {'Content-Type' : 'application/json'}, testListResponse]);
		expect(templateSpy).toHaveBeenCalled();
		var args = templateSpy.calls.argsFor(0);
		expect(args[0].showSummary).toBe(true);
		expect(args[0].toggleTitle).toBe(testView.SHOW_TITLE);
		expect(args[0].toggleIcon).toBe(testView.SHOW_ICON);
		expect(args[0].list).toEqual($.parseJSON(testListResponse).items);
	});

	it ('Expects that when the list request fails, the template is not rendered', function() {
		server.respond([500, {"Content-Type": 'text/plain'}, "Server Error"]);
		expect(templateSpy).not.toHaveBeenCalled();
	});

	describe('Tests for toggleDetails', function() {
		var testDetailResponse = '{"items" : [{"project" : "1234"}, {"project" : "3245"}]}';
		var ev;

		beforeEach(function() {
			server.respond([200, {'Content-Type' : 'application/json'}, testListResponse]);
			ev = {
				currentTarget : $('#test-button').get(),
				preventDefault : jasmine.createSpy('preventDefaultSpy')
			};
		});

		it('Expects that call to toggleDetails switches the button\'s title and contents and toggles the summary div', function() {
			var $btn = $('#test-button');
			var $detailsDiv = $('#1234');
			var $summaryDiv = $('.summary-content-div');
			testView.toggleDetails(ev);

			expect($btn.attr('title')).toEqual(testView.HIDE_TITLE);
			expect($btn.html()).toEqual(testView.HIDE_ICON);
			expect($detailsDiv.is(':visible')).toBe(true);
			expect($summaryDiv.is(':visible')).toBe(false);

			testView.toggleDetails(ev);
			expect($btn.attr('title')).toEqual(testView.SHOW_TITLE);
			expect($btn.html()).toEqual(testView.SHOW_ICON);
			expect($detailsDiv.is(':visible')).toBe(false);
			expect($summaryDiv.is(':visible')).toBe(true);
		});

		it('Expects that the first call toggleDetails triggers the ajax call to retrieve the details', function() {
			testView.toggleDetails(ev);

			expect(server.requests.length).toBe(2);
			expect(server.requests[1].url).toEqual(testView.detailsUrl('1234'));
			expect(NWC.templates.getTemplate.calls.count()).toBe(1);
			expect(templateSpy.calls.count()).toBe(1);

			server.respond([200, {'Content-type' : 'application/json'}, testDetailResponse]);
			expect(NWC.templates.getTemplate.calls.count()).toBe(2);
			expect(NWC.templates.getTemplate.calls.argsFor(1)).toEqual([testView.detailsTemplateName]);
			expect(templateSpy.calls.count()).toBe(2);
			expect(templateSpy.calls.argsFor(1)).toEqual([$.parseJSON(testDetailResponse)]);
		});

		it('Expects when the ajax call fails the template does not get rendered', function() {
			testView.toggleDetails(ev);
			server.respond([500, {'Content-type' : 'text/plain'}, "Server error"]);

			expect(NWC.templates.getTemplate.calls.count()).toBe(1);
			expect(templateSpy.calls.count()).toBe(1);
		});
	});
});