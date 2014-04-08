/*global angular,NWC */
(function() {
    var dataDiscoveryControllers = angular.module('nwc.controllers.dataDiscovery', []);

    dataDiscoveryControllers.controller('DataDiscovery', ['$scope', 'StoredState', '$sce',
        NWC.ControllerHelpers.WorkflowController(
        {
            name: "Search National Water Census Data, Reports, and Projects.",
            description: "Coming Soon: Search the repository of records documenting\n\
                data, reports, and other information used or produced by the National Water Census.\n\
                Choose a category and/or enter a search term to search the catalog."
        },
        function($scope, StoredState, $sce) {
            $scope.description = $sce.trustAsHtml($scope.description);
        }
    )]);

}());
