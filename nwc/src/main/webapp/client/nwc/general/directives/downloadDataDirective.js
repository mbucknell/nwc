/*global angular*/
(function () {
    var downloadData = angular.module('nwc.directives.downloadData', []);

    downloadData.directive('downloadDataButton', function() {
        return {
            restrict: 'E',
            scope: {
                filename: '=filename',
                type: '=type',
                data: '=data',
                title: '=title'
            },
            templateUrl: '../client/nwc/general/templates/downloadDataTemplate.html'
        };
    });
    
}());