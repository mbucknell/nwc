/*global angular*/
(function () {
    var allWorkflow = angular.module('nwc.workflows.all', []);
    allWorkflow.controller('AllWorkflow', ['$scope', 'StoredState', 'StatePersistence',
        function($scope, StoredState, StatePersistence){
            $scope.storeState = function(){
                StatePersistence.store(StoredState);
            };
        }
    ]);
}());
