/*global angular*/
(function () {
    var stateMod = angular.module('nwc.controllers.state', ['nwc.sharedStateServices', 'nwc.watch']);
    stateMod.controller('RestoreState', [
                '$scope', '$state', 'StoredState', 'StatePersistence',
        function($scope, $state, StoredState, StatePersistence){
            var stateId = $state.params.stateId;
            $scope.stateId = stateId;
            StatePersistence.restore(stateId);
        }
    ]);
}());
