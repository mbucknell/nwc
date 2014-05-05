/*global angular*/
(function () {
    var sosSourcesModule = angular.module('nwc.sosSources', ['nwc.conversion']);
    var SosSources = sosSourcesModule.service('SosSources', ['Units', function (Units) {
        return {
            dayMet: {
                observedProperty: 'MEAN_prcp',
                units: Units.metric.normalizedWater.daily,
                dataset: 'HUC12_data',
                fileName: 'HUC12_daymet.nc'
            },
            eta: {
                observedProperty: 'MEAN_et',
                units: Units.metric.normalizedWater.monthly,
                dataset: 'HUC12_data',
                fileName: 'HUC12_eta_fixed.ncml'
            },
            countyWaterUse: {
                observedProperty: 'PS-WFrTo,DO-WFrTo,IN-WTotl,MI-WTotl',
                units: Units.imperial.totalWater.yearly,
                dataset: 'county_data',
                fileName: 'AWUDS.nc'
            },
            modeledQ: {
                observedProperty: 'MEAN_streamflow',
                units: Units.imperial.streamflow.daily,
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
