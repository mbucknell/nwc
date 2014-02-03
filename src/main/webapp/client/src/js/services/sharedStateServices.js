/*global angular*/
(function(){
var sharedStateServices = angular.module('nwc.sharedStateServices', []);

//enable sugarjs instance methods
var storedState = Object.extended({
    _version: 0.1,
    _clientState: {
        name: undefined,
        params: {}
        
    }
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

}());