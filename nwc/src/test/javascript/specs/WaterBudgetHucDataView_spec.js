describe('Tests for NWC.view.WaterBudgetHucDataView', function() {
	it("has these dependencies", function() {
		expect(NWC.view.BaseView).toBeDefined();
	});

	it("has these API functions defined", function() {
		expect(NWC.view.WaterBudgetHucDataView.prototype.templateName).toBeDefined();
		expect(NWC.view.WaterBudgetHucDataView.prototype.events).toBeDefined();
		expect(NWC.view.WaterBudgetHucDataView.prototype.getHucData).toBeDefined();
	});

	it("retrieves the huc data calls function to render plot", function() {
		//TODO
	});
	
//	var addLayerSpy;
//	beforeEach(function() {
//		addLayerSpy = jasmine.createSpy('addLayerSpy');
//		spyOn(view.WaterBudgetHucDataView.prototype, 'initialize').andCallFake(function() {
//			this.map = {
//				addLayer : addLayerSpy
//			};
//		});
//	});

	it('Expects appropriate properties to be defined after instantiation', function() {
//		var view = new NWC.view.WaterBudgetHucDataView('test');

//		expect(NWC.view.BaseView.prototype.initialize).toHaveBeenCalled();
//		expect(view.baseLayer).toBeDefined();
//		expect(view.hucLayer).toBeDefined();
//		expect(addLayerSpy).toHaveBeenCalledWith(view.hucLayer);
	});

	it('Expect that event handler calls exist and behave as expected', function() {
//		var view = new NWC.view.WaterBudgetHucDataView('test');
//
//		//the view has an event to wire up the clickable plot options
//		expect(view.events['click .back-button']).toBeDefined();
//		expect(view.events['click .counties-button']).toBeDefined();
//		expect(view.events['click .metric-button']).toBeDefined();
//		expect(view.events['click .customary-button']).toBeDefined();
//		expect(view.events['click .monthly-button']).toBeDefined();
//		expect(view.events['click .daily-button']).toBeDefined();
//		expect(view.events['click .evapotranspiration-download-button']).toBeDefined();
//		expect(view.events['click .precipitation-download-button']).toBeDefined();
//
//		//plot buttons exist and get set with the proper disabled attribute
//		view.toggleMetricLegend();
//		expect($(view.$('.metric-button').attr("disabled")).toBe("disabled"));
//		view.toggleCustomaryLegend();
//		expect($(view.$('.customary-button').attr("disabled")).toBe("disabled"));
//		view.toggleMonthlyLegend();
//		expect($(view.$('.monthly-button').attr("disabled")).toBe("disabled"));
//		view.toggleDailyLegend();
//		expect($(view.$('.daily-button').attr("disabled")).toBe("disabled"));
	});
});