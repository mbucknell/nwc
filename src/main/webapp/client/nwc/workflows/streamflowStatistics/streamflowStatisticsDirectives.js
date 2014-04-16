/*global angular*/
(function () {
    var streamflowStatistics = angular.module('nwc.directives.streamflowStatistics', []);

    streamflowStatistics.directive('siteStats', function() {
        return {
            restrict: 'E',
            templateUrl: '../client/nwc/workflows/streamflowStatistics/siteStats.html'
        };
    });
    
    streamflowStatistics.directive('hucStats', function() {
        return {
            restrict: 'E',
            templateUrl: '../client/nwc/workflows/streamflowStatistics/hucStats.html'
        };
    });
}());