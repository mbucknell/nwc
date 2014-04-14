/*global angular*/
(function () {
    var allWorkflow = angular.module('nwc.workflows.all', []);
    var modalSuccess = allWorkflow.controller('ModalSuccess', [
                '$scope', '$modalInstance', '$window',
        function($scope, $modalInstance, $window){
            $scope.modal = $modalInstance;
            $scope.close = function(){
                $modalInstance.close();
            };
        }
    ]);
    allWorkflow.controller('AllWorkflow', ['$scope', 'StoredState', 'StatePersistence', '$modal',
        function($scope, StoredState, StatePersistence, $modal){
            $scope.storeState = function(){
                StatePersistence.store(StoredState).success(function (stateId) {
                        //construct a url for the base of the single-page app
                        //do NOT include the current fragment identifer (stuff after the '#')
                        var loc = document.location;
                        var fullUri = loc.protocol + '//' + loc.host + loc.pathname;
                        fullUri += '#/state/restore/' + stateId;
                        $scope.uri = fullUri;
                        $modal.open({
                            templateUrl: '../client/nwc/state/storageSuccess.html',
                            controller: 'ModalSuccess',
                            scope: $scope
                        });
                    })
                    .error(function () {
                        $modal.open({
                            template: 'Error Storing State'
                        });
                    });;
            };
        }
    ]);
}());
