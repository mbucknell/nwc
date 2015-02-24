describe('Tests for NWC.BaseView', function() {
	var templateSpy;
	beforeEach(function() {
		templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = jasmine.createSpyObj('NWCTemplates', ['getTemplate', 'loadTemplates']);
		NWC.templates.getTemplate.andReturn(templateSpy);


	});

	it('Expects a view to use a template with the templateName property when rendering a view', function() {
		var NewView = NWC.view.BaseView.extend({templateName : 'base'});
		var view = new NewView();

		var templateSpy = jasmine.createSpy('templateSpy');
		NWC.templates = jasmine.createSpyObj('NWCTemplates', ['getTemplate', 'loadTemplates']);
		NWC.templates.getTemplate.andReturn(templateSpy);

		var NewView = NWC.view.BaseView.extend({templateName : 'base'});
		var view = new NewView();
		expect(NWC.templates.getTemplate).toHaveBeenCalledWith('base');
	});

	it('Expects a context property to be used when rendering a view', function() {
		var NewView = NWC.view.BaseView.extend({templateName : 'base', context : {a : 'this'}});
		var view = new NewView();
		expect(templateSpy).toHaveBeenCalledWith({a : 'this'});
	});

});