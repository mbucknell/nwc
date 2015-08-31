/*jslint browser: true */
/*global Backbone */

var NWC = NWC || {};

NWC.model = NWC.model || {};

(function() {
	"use strict";

	NWC.model.SosVariable = Backbone.Model.extend({
		defaults : {
			observedProperty : '',
			propertyLongName : '',
			units : '',
			dataset : '',
			fileName : '',
			downloadMetadata : ''
		},

		getSosUrl : function (offering) {
			// fill in from SosSources.js
			return '';
		}
	});

	NWC.model.WatershedDataModel = Backbone.Model.extend({
		layerName : '',
		namespace : '',
		variables : NWC.model.SosVariableCollection
	});

	NWC.model.Config = Backbone.Model.extend({
		defaults : function() {
			return {
				watershed : {
					huc12 : new NWC.model.WatershedDataModel({
						layerName : 'nationalwbdsnapshot', // get from mapUtils
						namespace : 'NHDPlusHUCs', // getfrom mapUtils
						variables : {
							dayMet : new NWC.model.SosVariable({
								observedProperty: 'MEAN_prcp',
								propertyLongName: 'Area Weighted Mean Precipitation',
								units: NWC.util.Units.metric.normalizedWater.daily,
								dataset: 'HUC12_data',
								fileName: 'HUC12_daymet.nc',
								downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							}),
							eta : new NWC.model.SosVariable({
								observedProperty: 'MEAN_et',
								propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
								units: NWC.util.Units.metric.normalizedWater.monthly,
								dataset: 'HUC12_data',
								fileName: 'HUC12_eta.nc',
								downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							})
						}
					})
				}
			};
			// Add things as needed for the county variable and streamflow variables.
		}
	});
}());



