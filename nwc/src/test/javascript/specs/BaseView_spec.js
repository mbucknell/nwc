describe('Tests for NWC.BaseView', function() {
	var templateSpy;
	beforeEach(function() {
		templateSpy = jasmine.createSpy('templateSpy');
		spyOn(NWC.templates, 'getTemplate').andReturn(templateSpy);
		spyOn(NWC.templates, 'loadTemplates');
	});

	it('Expects a view to use a template with the templateName property when rendering a view', function() {
		var NewView = NWC.view.BaseView.extend({templateName : 'base'});
		var view = new NewView();
		expect(NWC.templates.getTemplate).toHaveBeenCalledWith('base');
	});

	it('Expects a context property to be used when rendering a view', function() {
		var NewView = NWC.view.BaseView.extend({templateName : 'base'});
		var view = new NewView({context : {a : 'this'}});
		expect(templateSpy).toHaveBeenCalledWith({a : 'this'});
	});

	it('Expects if a template is passed in as an option, that it will be used to render', function() {
		var thisTemplateSpy = jasmine.createSpy('thisTemplateSpy');
		var NewView = NWC.view.BaseView.extend();
		var view = new NewView({template : thisTemplateSpy});
		expect(NWC.templates.getTemplate).not.toHaveBeenCalled();
		expect(thisTemplateSpy).toHaveBeenCalled();
	});

});