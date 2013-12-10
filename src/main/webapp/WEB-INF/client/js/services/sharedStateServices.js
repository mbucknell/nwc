/*global angular*/
(function(){
var sharedStateServices = angular.module('nwcui.sharedStateServices', []);

//enable sugarjs instance methods
var storedState = Object.extended({
    _version: 0.1,
    _clientState: {
        name: undefined,
        params: {}
        
    }
});

//this factory provides access to the state that can be Stored to the server and shared between controllers
sharedStateServices.factory('StoredState', 
    function(){
        return storedState;
    }
);

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

storedState.watch('favoriteColor', function(prop, oldValue, newValue){
    //this would normally be replaced by ajax calls whose callbacks update
    //commonState
    if(newValue === 'blue'){
        commonState.favoriteColorDependent = 'BlueDataSet';
    }
    else if(newValue === 'yellow'){
        commonState.favoriteColorDependent = 'YellowDataSet';
    }
    else{
        commonState.favoriteColorDependent = undefined;
    }
    
    //be EXTRA CERTAIN to return a value from the watch or else the property
    //will never be written to
    return newValue;
});

}());