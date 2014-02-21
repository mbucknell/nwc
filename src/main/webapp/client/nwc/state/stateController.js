/*global angular*/
(function () {
    var stateMod = angular.module('nwc.controllers.state', ['nwc.sharedStateServices', 'nwc.watch']);
    stateMod.controller('RestoreState', ['StoredState', 'StatePersistence'
        
    ]);
}());
