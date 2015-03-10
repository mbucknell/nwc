var NWC = NWC || {};

NWC.util = NWC.util || {};

(function () {

	NWC.util.SosSources = {
		dayMet: {
            observedProperty: 'MEAN_prcp',
            propertyLongName: 'Area Weighted Mean Precipitation',
            units: NWC.util.Units.metric.normalizedWater.daily,
            dataset: 'HUC12_data',
            fileName: 'HUC12_daymet.nc',
            downloadMetadata: 'Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
        },
        eta: {
            observedProperty: 'MEAN_et',
            propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
            units: NWC.util.Units.metric.normalizedWater.monthly,
            dataset: 'HUC12_data',
            fileName: 'HUC12_eta_fixed.ncml',
            downloadMetadata: 'Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php'
        },
//        countyWaterUse: {
//            observedProperty: CountyWaterUseProperties.getObservedProperties().join(),
//            propertyLongName: CountyWaterUseProperties.getPropertyLongNames().join(),
//            units: NWC.util.Units.usCustomary.totalWater.yearly,
//            dataset: 'county_data',
//            fileName: 'AWUDS.nc',
//            downloadMetadata: 'Data derived from the Aggregate Water Use Data System. Also available from NWIS Web. http://waterdata.usgs.gov/nwis/wu\n\nData plotted by the nwc web page (http://cida.usgs.gov/nwc/) was calculated as the sum of the codes after the name below:\nPublic Supply: PS-WGWFr, PS-WGWSa, PS-WSWFr, PS-WSWSa\nDomestic: DO-WGWFr, DO-WGWSa, DO-WSWFr, DO-WSWSa\nIrrigation" IT-WGWFr, IT-WGWSa, IT-WSWFr, IT-WSWSa\nThermoelectric Power: PF-WGWFr, PF-WGWSa, PF-WSWFr, PF-WSWSa, PG-WGWFr, PG-WGWSa, PG-WSWFr, PG-WSWSa, PN-WGWFr, PN-WGWSa, PN-WSWFr, PN-WSWSa, PO-WGWFr, PO-WGWSa, PO-WSWFr, PO-WSWSa, PC-WGWFr, PC-WGWSa, PC-WSWFr, PC-WSWSa\nLivestock and Aquaculture: LS-WGWFr, LS-WGWSa, LS-WSWFr, LS-WSWSa, LI-WGWFr, LI-WSWFr, LA-WGWFr, LA-WGWSa, LA-WSWFr, LA-WSWSa, AQ-WGWFr, AQ-WGWSa, AQ-WSWFr, AQ-WSWSa\nIndustrial: IN-WGWFr, IN-WGWSa, IN-WSWFr, IN-WSWSa\nMining: MI-WGWFr, MI-WGWSa, MI-WSWFr, MI-WSWSa\n\nPF, PG, PN, PO, and PC stand for: Thermoelectric Power Fossil-Fuel, Geothermal, Nuclear, Once-Through Cooling, and Closed-Loop Cooling, respectively.\nLS, LI, LA, and AQ stand for: Livestock Stock, Livestock (general), Livestock Animal Specialties, and Aquaculture respectively.\nWGW and WSW stand for: Withdrawals from Groundwater and Surface Water, respectively.\nFr and Sa stand for: Freshwater and Saline Water, respectively.\n\nA summary of water-use category changed can be found at: http://water.usgs.gov/watuse/WU-Category-Changes.html\n\nEmpty fields in the table below represent fields where data is not available and/or was not estimated.'
//        },
        modeledQ: {
            observedProperty: 'MEAN_streamflow',
            propertyLongName: 'Modeled Streamflow',
            units: NWC.util.Units.usCustomary.streamflow.daily,
            dataset: 'HUC12_data',
            fileName: 'HUC12_Q.nc',
            downloadMetadata: 'Data provided by a USGS research study that is in review. This information is\npreliminary and is subject to revision. It is being provided to meet the need for\ntimely \"best science\" information. The assessment is provided on the condition that\nneither the U.S. Geological Survey nor the United States Government may be\nheld liable for any damages resulting from the authorized or unauthorized use of\nthe assessment. Documentation can be found here:\nhttp://cida.usgs.gov/nwc/ang/#/workflow/streamflow-statistics/model-info'
        }
//        current : '' //very hacky, need to figure out better option
    };

	/**
	 * @param {String} offering The offerring id as appears in SOS GetCapabilities
	 * @param {String} observedProperty The property of the offering to return
	 * @param {String} dataset The folder below the SOS provider namespace
	 * @param {String} fileName The filename of the data of interest. The last 
	 * component of the path prior to the arguments
	 */
	var buildSosUrl = function (offering, observedProperty, dataset, fileName) {
	    var sosParams = Object.extended({
	        request: 'GetObservation',
	        service: 'SOS',
	        version: '1.0.0',
	        observedProperty: observedProperty,
	        offering: offering
	    });
	    return CONFIG.endpoint.thredds + dataset + '/' + fileName + '?' + $.param(sosParams);
	};
	
	/**
	 * @param {String} offerring The offerring id as appears in SOS GetCapabilities
	 * @param {object - NWCUI.data.SosSources entry} source 
	 */
	NWC.util.buildSosUrlFromSource = function (offering, source) {
	    return buildSosUrl(offering, source.observedProperty, source.dataset, source.fileName);
	};
}());
