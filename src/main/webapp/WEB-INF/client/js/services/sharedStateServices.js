/*global angular*/
(function(){
var sharedStateServices = angular.module('nwc.sharedStateServices', ['nwc.watch']);

//enable sugarjs instance methods
var storedState = Object.extended({
    _version: 0.1,
    _clientState: {
        name: undefined,
        params: {}
        
    }
});


//enable sugarjs instance methods
var commonState = Object.extended();

//this factory provides access to the state that is NOT stored to the server, but that
//can be shared between controllers
//generally, the commonState should NOT be written to by controllers, rather it should
//be written to by listeners on the StoredState
sharedStateServices.factory('CommonState', [
    function(){
        return commonState;
    }
]);
var sharedStateWatchers = [];

    //we're going to inject all of the sharedStateWatchers into a service
    //in order to do that we need to add their names to an array and append the
    //actual service to the end of the array

//we want the storedStateWatchers service, but you can't inject a service into a
//config function, so instead we inject a provider
sharedStateServices.config(['storedStateWatchersProvider', function(sharedStateWatchersProvider){
    
    var theWatchers = sharedStateWatchersProvider.$get(); //Weird syntax because it's a provider, not a service
    
    //append all of the service name strings to the existing array
    sharedStateWatchers.add(theWatchers);
    
    //define the service
    var sharedStateWatch = function(){
        angular.forEach(arguments, function(service){
            storedState.watch(service.propertyToWatch, service.watchFunction);
        });
    };
    
    //now append the actual service to the array...
    sharedStateWatchers.push(sharedStateWatch);
}]);
//...and register the service with the module
sharedStateServices.factory('sharedStateWatch', sharedStateWatchers);

//This factory provides access to the state that can be Stored to the server and shared between controllers.
//The shared state watch service must be instantiated in order for the app to dynamically set shared state
//that is not stored to the server.
sharedStateServices.factory('StoredState', ['sharedStateWatch',
    function(sharedStateWatch){
        return storedState;
    }
]);

}());