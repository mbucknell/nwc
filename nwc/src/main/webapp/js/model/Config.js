/*jslint browser: true */
/*global Backbone */
/*global $ */
/*global CONFIG */
/*global _*/

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

	NWC.model.DataSourceModel = Backbone.Model.extend({
		layerName : '',
		namespace : '',
		variables : {}
	});

	NWC.model.WaterUseModel = Backbone.Model.extend({
		name : '',
		observedProperties : [],
		color : ''
	});

	// Assumes that the collection is never updated once created.
	NWC.model.WaterUseCollection = Backbone.Collection.extend({
		model : NWC.model.WaterUseModel,

		initialize : function(options) {
			Backbone.Collection.prototype.initialize.apply(this, arguments);
			// Create fast lookups
			this.waterUseNames = _.pluck(options, 'name');
			this.observedProperties = _.chain(options)
				.pluck('observedProperties')
				.flatten()
				.value();

			this.lookupByName = {};
			_.each(options, function(waterUse) {
				this.lookupByName[waterUse.name] = waterUse;
			}, this);

			this.lookupNameByObservedProperty = {};
				_.each(options, function(waterUse) {
					var result = {};
					_.each(waterUse.observedProperties, function(prop) {
						result[prop] = waterUse.name;
					});
				_.extend(this.lookupNameByObservedProperty, result);
			}, this);
		},

		getAllObservedProperties : function() {
			return this.observedProperties;
		},

		getAllNames : function() {
			return this.waterUseNames;
		},

		getName : function(observedProperty) {
			return this.lookupNameByObservedProperty[observedProperty];
		},
		getObservedProperties : function(name) {
			return this.lookupByName[name].observedProperties;
		},
		getColor : function(name) {
			return this.lookupByName[name].color;
		}
	});

	NWC.model.WatershedGagesModel = Backbone.Model.extend({
			hucId : '',
			gageId : ''
	});

	// Assumes that the collection is never updated once created.
	NWC.model.WatershedGagesCollection = Backbone.Collection.extend({
		model : NWC.model.WatershedGagesModel,
		url : 'json/watershed_gages.json',
		// Create fast lookup
		parse : function (data) {
			this.lookupByHucId = {};
			_.each(data, function(watershed) {
				this.lookupByHucId[watershed.hucId] = watershed;
			}, this);
			return this;
		},
		getGageId : function(hucId) {
			return this.lookupByHucId[hucId] ? this.lookupByHucId[hucId].gageId : null;
		}		
	});

	NWC.model.SciencebaseUrlFragmentModel = Backbone.Model.extend({
		defaults : {
			singleitem : '/catalog/item/',
			dataItems : '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DData',
			projectItems : '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DProject',
			publicationItems : '/catalog/items?facetTermLevelLimit=false&q=&community=National+Water+Census&filter0=browseCategory%3DPublication'
		},

		getSingleItemFragment : function(id) {
			return this.get('singleitem') + id + '?format=json';
		},

		getProjectsFragment : function() {
			return this.get('projectItems') + '&format=json';
		},

		getDataFragment : function(parentId) {
			if (parentId) {
				return this.get('dataItems') + '&parentId=' + parentId + '&format=json';
			}
			else {
				return this.get('dataItems') + '&format=json';
			}
		},
		getPublicationsFragment : function(parentId) {
			if (parentId) {
				return this.get('publicationItems') + '&parentId=' + parentId + '&format=json';
			}
			else {
				return this.get('publicationItems') + '&format=json';
			}
		}
	});

	var Config = Backbone.Model.extend({
		defaults : function() {
			var countyWaterUse = new NWC.model.WaterUseCollection([
				{
					name : 'Public Supply',
					observedProperties : ["PS-WGWFr", "PS-WGWSa", "PS-WSWFr", "PS-WSWSa"],
					color : '#67609e'
				},{
					name : 'Domestic',
					observedProperties : ["DO-WGWFr", "DO-WGWSa", "DO-WSWFr", "DO-WSWSa"],
					color : '#ed1c24'
				},{
					name : 'Irrigation',
					observedProperties : ["IT-WGWFr", "IT-WGWSa", "IT-WSWFr", "IT-WSWSa"],
					color : '#009c88'
				},{
					name : 'Thermoelectric Power',
					observedProperties : ["PF-WGWFr", "PF-WGWSa", "PF-WSWFr", "PF-WSWSa", "PG-WGWFr", "PG-WGWSa", "PG-WSWFr", "PG-WSWSa", "PN-WGWFr", "PN-WGWSa", "PN-WSWFr", "PN-WSWSa", "PO-WGWFr", "PO-WGWSa", "PO-WSWFr", "PO-WSWSa", "PC-WGWFr", "PC-WGWSa", "PC-WSWFr", "PC-WSWSa"],
					color : '#f1b650'
				},{
					name : 'Livestock and Aquaculture',
					observedProperties : ["LS-WGWFr", "LS-WGWSa", "LS-WSWFr", "LS-WSWSa", "LI-WGWFr", "LI-WSWFr", "LA-WGWFr", "LA-WGWSa", "LA-WSWFr", "LA-WSWSa", "AQ-WGWFr", "AQ-WGWSa", "AQ-WSWFr", "AQ-WSWSa"],
					color : '#b9cfe6'
				},{
					name: 'Industrial',
					observedProperties : ["IN-WGWFr", "IN-WGWSa", "IN-WSWFr", "IN-WSWSa"],
					color : '#0080b7'
				},{
					name : 'Mining',
					observedProperties : ["MI-WGWFr", "MI-WGWSa", "MI-WSWFr", "MI-WSWSa"],
					color : '#f5833c'
				}
			]);

			return {
				featureToggles : {
					enableAccumulatedWaterBudget : true
				},
				watershed : {
					huc12 : new NWC.model.DataSourceModel({
						layerName : 'huc12',
						namespace : 'WBD',
						property : 'huc12',
						name : 'name',
						watershedArea : 'DRAIN_SQKM',
						selectDisplay : '12 Digit',
						variables : {
							dayMet : new NWC.model.SosVariable({
								observedProperty: 'prcp',
								propertyLongName: 'Area Weighted Mean Precipitation',
								units: NWC.util.Units.metric.normalizedWater.daily,
								dataset: 'HUC12_data',
								fileName: 'HUC12_daymet.nc',
								downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							}),
							eta : new NWC.model.SosVariable({
								observedProperty: 'et',
								propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
								units: NWC.util.Units.metric.normalizedWater.monthly,
								dataset: 'HUC12_data',
								fileName: 'HUC12_eta.nc',
								downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							})
						}
					}),
					huc08 : new NWC.model.DataSourceModel({
						layerName : 'huc08',
						namespace : 'WBD',
						property : 'huc8',
						name : 'name',
						selectDisplay : '8 Digit',
						variables : {
							dayMet : new NWC.model.SosVariable({
								observedProperty: 'prcp',
								propertyLongName: 'Area Weighted Mean Precipitation',
								units: NWC.util.Units.metric.normalizedWater.daily,
								dataset: 'HUC08_data',
								fileName: 'HUC08_daymet.nc',
								downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n8-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							}),
							eta : new NWC.model.SosVariable({
								observedProperty: 'et',
								propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
								units: NWC.util.Units.metric.normalizedWater.monthly,
								dataset: 'HUC08_data',
								fileName: 'HUC08_eta.nc',
								downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 8-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
							})
						}
					})
				},
				//just a copy of huc12 watershed, need to update
				accumulated : new NWC.model.DataSourceModel({
					layerName : 'huc12agg',
					namespace : 'WBD',
					property : 'huc12',
					name : 'name',
					watershedAreaUnit : 'DRAIN_SQKM',
					selectDisplay : 'Accumulated',
					variables : {
						dayMet : new NWC.model.SosVariable({
							observedProperty: 'prcp',
							propertyLongName: 'Area Weighted Mean Precipitation',
							units: NWC.util.Units.metric.normalizedWater.daily,
							dataset: 'HUC12_data',
							fileName: 'HUC12_daymet.nc',
							downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
						}),
						eta : new NWC.model.SosVariable({
							observedProperty: 'et',
							propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
							units: NWC.util.Units.metric.normalizedWater.monthly,
							dataset: 'HUC12_data',
							fileName: 'HUC12_eta.nc',
							downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
						})
					}
				}),
				county : new NWC.model.DataSourceModel({
					layerName : 'us_historical_counties',
					namespace : 'NWC',
					variables : {
						waterUse : new NWC.model.SosVariable({
							observedProperty: countyWaterUse.getAllObservedProperties().join(','),
							propertyLongName: countyWaterUse.getAllNames().join(','),
							units: NWC.util.Units.usCustomary.totalWater.yearly,
							dataset: 'county_data',
							fileName: 'AWUDS.nc',
							downloadMetadata: 'Data derived from the Aggregate Water Use Data System. Also available from NWIS Web. http://waterdata.usgs.gov/nwis/wu\n\nData plotted by the nwc web page (http://cida.usgs.gov/nwc/) was calculated as the sum of the codes after the name below:\nPublic Supply: PS-WGWFr, PS-WGWSa, PS-WSWFr, PS-WSWSa\nDomestic: DO-WGWFr, DO-WGWSa, DO-WSWFr, DO-WSWSa\nIrrigation" IT-WGWFr, IT-WGWSa, IT-WSWFr, IT-WSWSa\nThermoelectric Power: PF-WGWFr, PF-WGWSa, PF-WSWFr, PF-WSWSa, PG-WGWFr, PG-WGWSa, PG-WSWFr, PG-WSWSa, PN-WGWFr, PN-WGWSa, PN-WSWFr, PN-WSWSa, PO-WGWFr, PO-WGWSa, PO-WSWFr, PO-WSWSa, PC-WGWFr, PC-WGWSa, PC-WSWFr, PC-WSWSa\nLivestock and Aquaculture: LS-WGWFr, LS-WGWSa, LS-WSWFr, LS-WSWSa, LI-WGWFr, LI-WSWFr, LA-WGWFr, LA-WGWSa, LA-WSWFr, LA-WSWSa, AQ-WGWFr, AQ-WGWSa, AQ-WSWFr, AQ-WSWSa\nIndustrial: IN-WGWFr, IN-WGWSa, IN-WSWFr, IN-WSWSa\nMining: MI-WGWFr, MI-WGWSa, MI-WSWFr, MI-WSWSa\n\nPF, PG, PN, PO, and PC stand for: Thermoelectric Power Fossil-Fuel, Geothermal, Nuclear, Once-Through Cooling, and Closed-Loop Cooling, respectively.\nLS, LI, LA, and AQ stand for: Livestock Stock, Livestock (general), Livestock Animal Specialties, and Aquaculture respectively.\nWGW and WSW stand for: Withdrawals from Groundwater and Surface Water, respectively.\nFr and Sa stand for: Freshwater and Saline Water, respectively.\n\nA summary of water-use category changed can be found at: http://water.usgs.gov/watuse/WU-Category-Changes.html\n\nEmpty fields in the table below represent fields where data is not available and/or was not estimated.'
						})
					}
				}),
				streamflow : {
					huc12 : new NWC.model.DataSourceModel({
						localLayerName : 'huc12_se_basins_v2_local', // this is used for the selection map
						accumulatedLayerName : 'huc12_se_basins_v2', // this is used for the inset map
						namespace : 'NWC',
						variables : {
							modeledQ : new NWC.model.SosVariable({
								observedProperty: 'MEAN_streamflow',
								propertyLongName: 'Modeled Streamflow',
								units: NWC.util.Units.usCustomary.streamflow.daily,
								dataset: 'HUC12_data',
								fileName: 'HUC12_Q.nc',
								downloadMetadata: 'Streamflow data documentation can be found here:\nhttp://pubs.er.usgs.gov/publication/sir20145231'
							}),
							statsWpsService : {
								identifier : 'org.n52.wps.server.r.stats_huc12_modeled',
								sos : 'HUC12_data/HUC12_Q.nc',
								observedProperty : 'MEAN_streamflow',
								wfsTypename : 'NWC:huc12_se_basins_v2',
								wfsFilterProperty : 'NWC:huc12',
								wfsAreaPropertyname : 'NWC:mi2'
							}
						}
					}),
					gage : new NWC.model.DataSourceModel({
						layerName : 'gagesII',
						namespace : 'NWC',
						variables : {
							nwisStreamFlowData : {
								queryParams : {
									'format': 'waterml,1.1',
									'statCD' : '00003',
									'parameterCd': '00060'
								}
							},
							nwisSiteFileData : {
								queryParams : {
									'format' : 'rdb',
									'seriesCatalogOutput': 'true',
									'parameterCd': '00060',
									'outputDataTypeCd': 'dv'
								},
								colNames : {
									beginDate : 'begin_date',
									endDate : 'end_date'
								}
							},
							statsWpsService : {
								identifier : 'org.n52.wps.server.r.stats_nwis'
							}
						}
					})
				},
				countyWaterUse : countyWaterUse,
				sciencebaseUrlFragment : new NWC.model.SciencebaseUrlFragmentModel(),
				watershedGages : new NWC.model.WatershedGagesCollection()
			};
			// Add things as needed for the county variable and streamflow variables.
		},

		fetch : function() {
			return this.get('watershedGages').fetch();
		},

		getWatershed : function (hucId) {
			if (hucId.length === 8) {
				return this.get('watershed').huc08.attributes;
			}
			else {
				return this.get('watershed').huc12.attributes;
			}
		}
	});

	NWC.config = new Config();
}());



