/*global angular*/
(function(){
var sharedStateServices = angular.module('nwc.sharedStateServices', []);

//enable sugarjs instance methods
var storedState = Object.extended({
    _version: 0.1,
});


//enable sugarjs instance methods
var commonState = Object.extended({
    DataSeriesStore: Object.extended(),
    newDataSeriesStore: false
    
});

//this factory provides access to the state that is NOT stored to the server, but that
//can be shared between controllers
//generally, the commonState should NOT be written to by controllers, rather it should
//be written to by listeners on the StoredState
sharedStateServices.factory('CommonState', [
    function(){
        return commonState;
    }
]);

//This factory provides access to the state that can be Stored to the server and shared between controllers.
//The shared state watch service must be instantiated in order for the app to dynamically set shared state
//that is not stored to the server.
sharedStateServices.factory('StoredState', [
    function(){
        return storedState;
    }
]);

sharedStateServices.factory('StatePersistence', [
        'StoredState', '$state', '$timeout', '$http', '$modal', 'CommonState',
        function (StoredState, $state, $timeout, $http, $modal, CommonState) {
            var restore = function (stateId) {
                $http.get('../../loadsession/' + stateId)
                    .success(function (data) {
                        Object.merge(StoredState, data);
                        //let listeners on StoredState run before changing state
                        $timeout(function(){
                            $state.go(StoredState.stateName, StoredState.stateParams);
                        });
                    })
                    .error(function () {
                        $modal.open({
                            template: 'Error Retrieving State'
                        });
                    });
            };

            var store = function (stateObject) {
                $http.post('../../savesessionpost', stateObject)
                    .success(function (data) {
                        console.dir(data);
                        $modal.open({
                            template: '<p>Share this link with others:</p><input type="text" value="' + data + '"/>'
                        });
                    })
                    .error(function () {
                        $modal.open({
                            template: 'Error Storing State'
                        });
                    });
            };
            return {
                restore: restore,
                store: store
            };
        }
    ]);
            

}());