NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.CountyWaterUseProperties = (function () {
	var that = {};

	var groupings = Object.extended({
		'Public Supply' : {
			observed_properties : ["PS-WGWFr", "PS-WGWSa", "PS-WSWFr", "PS-WSWSa"],
			color : 'purple'
		},
		'Domestic' : {
			observed_properties : ["DO-WGWFr", "DO-WGWSa", "DO-WSWFr", "DO-WSWSa"],
			color : 'red'
		},
		'Irrigation' : {
			observed_properties : ["IT-WGWFr", "IT-WGWSa", "IT-WSWFr", "IT-WSWSa"],
			color : 'green'
		},
		'Thermoelectric Power' : {
			observed_properties : ["PF-WGWFr", "PF-WGWSa", "PF-WSWFr", "PF-WSWSa", "PG-WGWFr", "PG-WGWSa", "PG-WSWFr", "PG-WSWSa", "PN-WGWFr", "PN-WGWSa", "PN-WSWFr", "PN-WSWSa", "PO-WGWFr", "PO-WGWSa", "PO-WSWFr", "PO-WSWSa", "PC-WGWFr", "PC-WGWSa", "PC-WSWFr", "PC-WSWSa"],
			color : 'gold'
		},
		'Livestock and Aquaculture' : {
			observed_properties : ["LS-WGWFr", "LS-WGWSa", "LS-WSWFr", "LS-WSWSa", "LI-WGWFr", "LI-WSWFr", "LA-WGWFr", "LA-WGWSa", "LA-WSWFr", "LA-WSWSa", "AQ-WGWFr", "AQ-WGWSa", "AQ-WSWFr", "AQ-WSWSa"],
			color : 'lightblue'
		},
		'Industrial' : {
			observed_properties : ["IN-WGWFr", "IN-WGWSa", "IN-WSWFr", "IN-WSWSa"],
			color : 'blue'
		},
		'Mining' :  {
			observed_properties : ["MI-WGWFr", "MI-WGWSa", "MI-WSWFr", "MI-WSWSa"],
			color : 'orange'
		}
	});

	that.getObservedProperties = (function() {
		var result = [];
		groupings.values(function(el) {
			if (el.observed_properties) {
				result.add(el.observed_properties);
			}
		});
		return result;
	}).once();

	that.getPropertyLongNames = (function() {
		var result = [];
		groupings.keys(function(key) {
			if (key) {
				result.add(key);
			}
		});
		return result;
	}).once();


	that.observedPropertiesLookup = (function() {
		return groupings.clone(true);
	}).once();

	that.propertyLongNameLookup = (function() {
		var result = {};

		groupings.keys(function(longName, properties) {
			properties.observed_properties.each(function(property) {
				result[property] = longName;
			});
		});

		return result;
	}).once();

	return that;
}());