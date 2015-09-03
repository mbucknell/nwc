/*jslint browser: true */
/*global Backbone */
/*global $ */
/*global CONFIG */

var NWC = NWC || {};

NWC.model = NWC.model || {};

(function() {
	"use strict";

	var SosVariable = Backbone.Model.extend({
		defaults : {
			observedProperty : '',
			propertyLongName : '',
			units : '',
			dataset : '',
			fileName : '',
			downloadMetadata : ''
		},

		getSosUrl : function (offering) {
			var sosParams = Object.extended({
				request: 'GetObservation',
				service: 'SOS',
				version: '1.0.0',
				observedProperty: this.get('observedProperty'),
				offering: offering
			});
			return CONFIG.endpoint.thredds + this.get('dataset') + '/' + this.get('fileName') + '?' + $.param(sosParams);
		}
	});

	var DataSourceModel = Backbone.Model.extend({
		layerName : '',
		namespace : '',
		variables : {}
	});

	var Config = Backbone.Model.extend({
		defaults : function() {
			return {
				watershed : {
					huc12 : new DataSourceModel({
						layerName : 'nationalwbdsnapshot', // get from mapUtils
						namespace : 'NHDPlusHUCs', // getfrom mapUtils
						variables : {
							dayMet : new SosVariable({
								observedProperty: 'MEAN_prcp',
								propertyLongName: 'Area Weighted Mean Precipitation',
								units: NWC.util.Units.metric.normalizedWater.daily,
								dataset: 'HUC12_data',
								fileName: 'HUC12_daymet.nc',
								downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							}),
							eta : new SosVariable({
								observedProperty: 'MEAN_et',
								propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
								units: NWC.util.Units.metric.normalizedWater.monthly,
								dataset: 'HUC12_data',
								fileName: 'HUC12_eta.nc',
								downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							})
						}
					}),
					huc8 : new DataSourceModel({
						layerName : 'nationalwbdsnapshot', // get from mapUtils
						namespace : 'NHDPlusHUCs', // getfrom mapUtils
						variables : {
							dayMet : new SosVariable({
								observedProperty: 'MEAN_prcp',
								propertyLongName: 'Area Weighted Mean Precipitation',
								units: NWC.util.Units.metric.normalizedWater.daily,
								dataset: 'HUC8_data',
								fileName: 'HUC8_daymet.nc',
								downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n8-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							}),
							eta : new SosVariable({
								observedProperty: 'MEAN_et',
								propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
								units: NWC.util.Units.metric.normalizedWater.monthly,
								dataset: 'HUC8_data',
								fileName: 'HUC8_eta.nc',
								downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 8-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							})
						}
					})
				},
				county : new DataSourceModel({
					layerName : 'us_historical_counties',
					namespace : 'NWC',
					variables : {
						waterUse : new SosVariable({
							observedProperty: NWC.util.CountyWaterUseProperties.getObservedProperties().join(),
							propertyLongName: NWC.util.CountyWaterUseProperties.getPropertyLongNames().join(),
							units: NWC.util.Units.usCustomary.totalWater.yearly,
							dataset: 'county_data',
							fileName: 'AWUDS.nc',
							downloadMetadata: 'Data derived from the Aggregate Water Use Data System. Also available from NWIS Web. http://waterdata.usgs.gov/nwis/wu\n\nData plotted by the nwc web page (http://cida.usgs.gov/nwc/) was calculated as the sum of the codes after the name below:\nPublic Supply: PS-WGWFr, PS-WGWSa, PS-WSWFr, PS-WSWSa\nDomestic: DO-WGWFr, DO-WGWSa, DO-WSWFr, DO-WSWSa\nIrrigation" IT-WGWFr, IT-WGWSa, IT-WSWFr, IT-WSWSa\nThermoelectric Power: PF-WGWFr, PF-WGWSa, PF-WSWFr, PF-WSWSa, PG-WGWFr, PG-WGWSa, PG-WSWFr, PG-WSWSa, PN-WGWFr, PN-WGWSa, PN-WSWFr, PN-WSWSa, PO-WGWFr, PO-WGWSa, PO-WSWFr, PO-WSWSa, PC-WGWFr, PC-WGWSa, PC-WSWFr, PC-WSWSa\nLivestock and Aquaculture: LS-WGWFr, LS-WGWSa, LS-WSWFr, LS-WSWSa, LI-WGWFr, LI-WSWFr, LA-WGWFr, LA-WGWSa, LA-WSWFr, LA-WSWSa, AQ-WGWFr, AQ-WGWSa, AQ-WSWFr, AQ-WSWSa\nIndustrial: IN-WGWFr, IN-WGWSa, IN-WSWFr, IN-WSWSa\nMining: MI-WGWFr, MI-WGWSa, MI-WSWFr, MI-WSWSa\n\nPF, PG, PN, PO, and PC stand for: Thermoelectric Power Fossil-Fuel, Geothermal, Nuclear, Once-Through Cooling, and Closed-Loop Cooling, respectively.\nLS, LI, LA, and AQ stand for: Livestock Stock, Livestock (general), Livestock Animal Specialties, and Aquaculture respectively.\nWGW and WSW stand for: Withdrawals from Groundwater and Surface Water, respectively.\nFr and Sa stand for: Freshwater and Saline Water, respectively.\n\nA summary of water-use category changed can be found at: http://water.usgs.gov/watuse/WU-Category-Changes.html\n\nEmpty fields in the table below represent fields where data is not available and/or was not estimated.'
						})
					}
				}),
				streamflow : {
					huc12 : new DataSourceModel({
						localLayerName : 'huc12_se_basins_v2_local', // this is used for the selection map
						accumulatedLayerName : 'huc12_se_basins_v2', // this is used for the inset map
						namespace : 'NWC',
						variables : {
							modeledQ : new SosVariable({
								observedProperty: 'MEAN_streamflow',
								propertyLongName: 'Modeled Streamflow',
								units: NWC.util.Units.usCustomary.streamflow.daily,
								dataset: 'HUC12_data',
								fileName: 'HUC12_Q.nc',
								downloadMetadata: 'Streamflow data documentation can be found here:\nhttp://pubs.er.usgs.gov/publication/sir20145231'
							})
						}
					}),
					gage : new DataSourceModel({
						layerName : 'gagesII',
						namespace : 'NWC',
						variables : {
							nwisData : {
								queryParams : {
									'format': 'waterml,1.1',
									'statCD' : '00003',
									'parameterCd': '00060'
								}
							}
						}
					})
				}
			};
			// Add things as needed for the county variable and streamflow variables.
		}
	});

	NWC.config = new Config();
}());



