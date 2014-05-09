/*global angular*/
(function () {
    var sosSourcesModule = angular.module('nwc.sosSources', ['nwc.waterBudgetServices', 'nwc.conversion']);
    sosSourcesModule.service('SosSources', ['CountyWaterUseProperties','Units',function (CountyWaterUseProperties,Units) {
        //TODO[Sibley]  TODO for Code Review, lets look over whether we want these configs here, or we want to
        // pull them into their workflow module.
        return {
            dayMet: {
                observedProperty: 'MEAN_prcp',
                propertyLongName: 'Area Weighted Mean Precipitation',
                units: Units.metric.normalizedWater.daily,
                dataset: 'HUC12_data',
                fileName: 'HUC12_daymet.nc',
                downloadMetadata: '"Data derived by sampling the DayMet precipitation variable to NHD+ Version II"\n"12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal."\n"http://daymet.ornl.gov/ http://cida.usgs.gov/gdp/"\n"http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php"'
            },
            eta: {
                observedProperty: 'MEAN_et',
                propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
                units: Units.metric.normalizedWater.monthly,
                dataset: 'HUC12_data',
                fileName: 'HUC12_eta_fixed.ncml',
                downloadMetadata: '"Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+"\n"Version II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal."\n"http://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly"\n"http://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php"'
            },
            countyWaterUse: {
                observedProperty: CountyWaterUseProperties.getObservedProperties().join(),
                propertyLongName: CountyWaterUseProperties.getPropertyLongNames().join(),
                units: Units.usCustomary.totalWater.yearly,
                dataset: 'county_data',
                fileName: 'AWUDS.nc',
                downloadMetadata: '"Data derived from the Aggregate Water Use Dataset, Also available from NWIS Web."\n"Data plotted by the nwc web page (http://cida.usgs.gov/nwc/) was calculated as:"\n"Public Supply,PS-WGWFr,PS-WGWSa,PS-WSWFr,PS-WSWSa"\n"Domestic,DO-WGWFr,DO-WGWSa,DO-WSWFr,DO-WSWSa"\n"Irrigation,IT-WGWFr,IT-WGWSa,IT-WSWFr,IT-WSWSa"\n"Thermoelectric Power,PF-WGWFr,PF-WGWSa,PF-WSWFr,PF-WSWSa,PG-WGWFr,PG-WGWSa,PG-WSWFr,PG-WSWSa,PN-WGWFr,PN-WGWSa,PN-WSWFr,PN-WSWSa,PO-WGWFr,PO-WGWSa,PO-WSWFr,PO-WSWSa,PC-WGWFr,PC-WGWSa,PC-WSWFr,PC-WSWSa"\n"Livestock and Aquaculture,LS-WGWFr,LS-WGWSa,LS-WSWFr,LS-WSWSa,LI-WGWFr,LI-WSWFr,LA-WGWFr,LA-WGWSa,LA-WSWFr,LA-WSWSa,AQ-WGWFr,AQ-WGWSa,AQ-WSWFr,AQ-WSWSa"\n"Industrial,IN-WGWFr,IN-WGWSa,IN-WSWFr,IN-WSWSa"\n"Mining,MI-WGWFr,MI-WGWSa,MI-WSWFr,MI-WSWSa"\n"These categories, for which the last set of estimates were made in 1995, are not included:"\n"Hydroelectric Power (HY)"\n"Commercial (CO)"\n"Wastewater Treatment (return flow) (WW)"\n"also not including consumptive use (CU) for any categories"\n"A summary of water-use category changed can be found at: http://water.usgs.gov/watuse/WU-Category-Changes.html"\n"Data for the specific codes above can be found at: http://waterdata.usgs.gov/nwis/wu"\n"NaNs in the table below represent fields where data is not available."'
            },
            modeledQ: {
                observedProperty: 'MEAN_streamflow',
                propertyLongName: 'Modeled Streamflow',
                units: Units.usCustomary.streamflow.daily,
                dataset: 'HUC12_data',
                fileName: 'HUC12_Q.nc',
                downloadMetadata: '"Data provided by a USGS research study that is in review. This information is"\n"preliminary and is subject to revision. It is being provided to meet the need for"\n"timely \"best science\" information. The assessment is provided on the condition that"\n"neither the U.S. Geological Survey nor the United States Government may be"\n"held liable for any damages resulting from the authorized or unauthorized use of"\n"the assessment. Documentation can be found here:"\n"http://cida.usgs.gov/nwc/ang/#/workflow/streamflow-statistics/model-info"'
            }
        };
    }]);

    sosSourcesModule.service('SosUrlBuilder', [
        function () {
        var self = this;
        /**
         * @param {String} offering The offerring id as appears in SOS GetCapabilities
         * @param {String} observedProperty The property of the offering to return
         * @param {String} dataset The folder below the SOS provider namespace
         * @param {String} fileName The filename of the data of interest. The last 
         * component of the path prior to the arguments
         */
        self.buildSosUrl = function (offering, observedProperty, dataset, fileName) {
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
        self.buildSosUrlFromSource = function (offering, source) {
            return self.buildSosUrl(offering, source.observedProperty, source.dataset, source.fileName);
        };
    }
]);

}());
