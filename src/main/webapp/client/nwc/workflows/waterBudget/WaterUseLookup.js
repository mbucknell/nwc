/*global angular*/
(function () {
    var WaterUseLookup = angular.module('nwc.waterUseLookup', []);
    
    WaterUseLookup.factory('CountyWaterUseProperties', [function() {
            var choppedLiver = 'PS-WFrTo,DO-WFrTo,IN-WTotl,MI-WTotl';
            return {
                getObservedProperties : function() {
                    return choppedLiver
                } 
            };
    }])
})

