/* jslint browser */
/* global jasmine, spyOn, expect */
/* global NWC */

describe('Test for NWC.view.StreamflowStatsMapView', function() {
	"use strict";
	var addLayersSpy, addLayerSpy;
	var addControlSpy;
	var thisTemplate;
	var view;

	beforeEach(function() {
		window.CONFIG = {
			endpoint : {
				geoserver : 'http://fakeserver.com'
			}
		};

		$('body').append('<div id="test-div"></div');
		$('#test-div').append('<div id="stream-gage-filters-div"><span id="filter-label"></span>' +
			'<a data-value="default">Default</a>' +
			'<a data-value="active">Active</a>' +
			'<a data-value="reference">Reference</a>' +
			'<a data-value="por">Por</a>' +
			'</div>'
		);
		thisTemplate = jasmine.createSpy('thisTemplate');
		addLayersSpy = jasmine.createSpy('addLayersSpy');
		addLayerSpy = jasmine.createSpy('addLayerSpy');
		addControlSpy = jasmine.createSpy('addControlSpy');
		spyOn(NWC.util.mapUtils, 'createFlowlinesLayer');
		spyOn(NWC.view.BaseSelectMapView.prototype, 'initialize').andCallFake(function() {
			this.map = {
				addLayers : addLayersSpy,
				addLayer : addLayerSpy,
				addControl : addControlSpy,
				updateSize : jasmine.createSpy('updateSizeSpy')
			};
		});
		view = new NWC.view.StreamflowStatsMapView({
			template : thisTemplate,
			model : new NWC.model.StreamflowStatsSelectMapModel()
		});
	});

	afterEach(function() {
		$('#test-div').remove();
	});

	it('Expects the appropriate properties to be defined after instantiation', function() {
		expect(NWC.view.BaseSelectMapView.prototype.initialize).toHaveBeenCalled();
		expect(view.gagesLayer).toBeDefined();
		expect(view.hucLayer).toBeDefined();
		expect(view.legendControl).toBeDefined();
		expect(view.selectControl).toBeDefined();
	});

	it('Expects update to the model\'s gageFilter to update the attribution control and gagelayer', function() {
		spyOn(view.gagesLayer, 'addOptions');
		spyOn(view.gagesLayer, 'mergeNewParams');

		view.model.set('gageFilter', 'active');
		expect($('#filter-label').html()).toEqual('Active');
		expect(view.gagesLayer.addOptions.mostRecentCall.args[0].attribution).toMatch(view.model.getFilterStyle());
		expect(view.gagesLayer.mergeNewParams.mostRecentCall.args[0].STYLES).toMatch(view.model.getFilterStyle());
	});
});