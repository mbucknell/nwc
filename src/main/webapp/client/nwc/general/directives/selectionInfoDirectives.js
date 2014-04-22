/*global angular*/
(function () {
    var selectionInfo = angular.module('nwc.directives.selectionInfo', []);

    selectionInfo.directive('siteStats', function() {
        return {
            restrict: 'E',
            templateUrl: '../client/nwc/general/templates/siteStatsTemplate.html'
        };
    });
    
    selectionInfo.directive('hucStats', function() {
        return {
            restrict: 'E',
            templateUrl: '../client/nwc/general/templates/hucStatsTemplate.html'
        };
    });
}());