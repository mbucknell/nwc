/*global angular*/
(function () {
    var sosSourcesModule = angular.module('nwc.sosSources', ['nwc.waterBudgetServices', 'nwc.conversion']);
    var SosSources = sosSourcesModule.service('SosSources', ['CountyWaterUseProperties','Units',function (CountyWaterUseProperties,Units) {
        //TODO[Sibley]  TODO for Code Review, lets look over whether we want these configs here, or we want to
        // pull them into their workflow module.
        return {
            dayMet: {
                observedProperty: 'MEAN_prcp',
                propertyLongName: 'Area Weighted Mean Precipitation',
                units: Units.metric.normalizedWater.daily,
                dataset: 'HUC12_data',
                fileName: 'HUC12_daymet.nc',
                downloadMetadata: "Data derived by sampling the DayMet precipitation variable to NHD+ Version II\n12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://daymet.ornl.gov/ http://cida.usgs.gov/gdp/\nhttp://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php"
            },
            eta: {
                observedProperty: 'MEAN_et',
                propertyLongName: 'Area Weighted Mean Actual Evapotranspiration',
                units: Units.metric.normalizedWater.monthly,
                dataset: 'HUC12_data',
                fileName: 'HUC12_eta_fixed.ncml',
                downloadMetadata: "Data derived by sampling the SSEBop Actual Evapotranspiration dataset to NHD+\nVersion II 12-digit Hydrologic Unit Code Watersheds using the Geo Data Portal.\nhttp://cida.usgs.gov/thredds/catalog.html?dataset=cida.usgs.gov/ssebopeta/monthly\nhttp://cida.usgs.gov/gdp/ http://www.horizon-systems.com/NHDPlus/NHDPlusV2_home.php"
            },
            countyWaterUse: {
                observedProperty: CountyWaterUseProperties.getObservedProperties(),
                propertyLongName: CountyWaterUseProperties.getPropertyLongName(),
                units: Units.usCustomary.totalWater.yearly,
                dataset: 'county_data',
                fileName: 'AWUDS.nc',
                downloadMetadata: "Data derived from the Aggregate Water Use Dataset, Also available from NWIS Web.\nhttp://waterdata.usgs.gov/nwis/wu"
            },
            modeledQ: {
                observedProperty: 'MEAN_streamflow',
                propertyLongName: 'Modeled Streamflow',
                units: Units.usCustomary.streamflow.daily,
                dataset: 'HUC12_data',
                fileName: 'HUC12_Q.nc',
                downloadMetadata: "Data provided by a USGS research study that is in review. This information is\npreliminary and is subject to revision. It is being provided to meet the need for\ntimely \"best science\" information. The assessment is provided on the condition that\nneither the U.S. Geological Survey nor the United States Government may be\nheld liable for any damages resulting from the authorized or unauthorized use of\nthe assessment. Documentation can be found here:\nhttp://cida.usgs.gov/nwc/ang/#/workflow/streamflow-statistics/model-info"
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
