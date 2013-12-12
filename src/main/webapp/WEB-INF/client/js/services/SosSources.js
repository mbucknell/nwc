/*global angular*/
(function () {
    var sosSourcesModule = angular.module('nwc.sosSources', []);
    var SosSources = sosSourcesModule.service('SosSources', function () {
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
                observedProperty: 'PS-WFrTo,DO-WFrTo,IN-WTotl,MI-WTotl',
                units: 'Mgal/d',
                dataset: 'county_data',
                fileName: 'AWUDS.nc',
                defaultTimeIncrement: '5 years'
            }
        };
    });

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
            return CONFIG.endpoint.threddsProxy + dataset + '/' + fileName + '?' + sosParams.toQueryString();
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
