/*global angular*/
(function () {
    var sosSourcesModule = angular.module('nwc.sosSources', ['nwc.waterBudgetServices']);
    var SosSources = sosSourcesModule.service('SosSources', ['CountyWaterUseProperties',function (CountyWaterUseProperties) {
        //TODO[Sibley]  TODO for Code Review, lets look over whether we want these configs here, or we want to
        // pull them into their workflow module.
        return {
            dayMet: {
                observedProperty: 'MEAN_prcp',
                units: 'mm/day',
                dataset: 'HUC12_data',
                fileName: 'HUC12_daymet.nc'
            },
            eta: {
                observedProperty: 'MEAN_et',
                units: 'mm/day',
                dataset: 'HUC12_data',
                fileName: 'HUC12_eta_fixed.ncml'
            },
            countyWaterUse: {
                observedProperty: CountyWaterUseProperties.getObservedProperties(),
                units: 'Mgal/d',
                dataset: 'county_data',
                fileName: 'AWUDS.nc',
                defaultTimeIncrement: '5 years'
            },
            modeledQ: {
                observedProperty: 'MEAN_streamflow',
                units: 'ft&sup3;/s',
                dataset: 'HUC12_data',
                fileName: 'HUC12_Q.nc'
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
