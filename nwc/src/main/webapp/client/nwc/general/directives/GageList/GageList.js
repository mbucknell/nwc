/**
 * this directive expects
 * $scope.name (name of the gage list being displayed)
 * $scope.description (scope.description of the gage list being displayed)
 * $scope.gages (json object of a list of site features)
 * 
 * When a user clicks on a list node, the directive will call $scope.onGageSelect(gage)
 */
(function () {
	var templatePath = '../client/nwc/general/directives/GageList/GageList.html';
	
	var gageList = angular.module('nwc.directive.GageList', []);

	gageList.directive('nwcGageList', function() {
		return {
			restrict: 'E',
			templateUrl: templatePath
		};
	});
}());

//This next bit of code is to set up a scope configuration helper.
//I am doing this because I do not yet know how Angular enforces an API, this is a helper to ensure
//the required scope fields exist
if(typeof NWC === 'undefined'){
    NWC = {};
}
if(!NWC.directive){
    NWC.directive = {};
}
if(!NWC.directive.GageList){
    NWC.directive.GageList = {};
}
NWC.directive.GageList.setScopeParams = function(scope, name, description, gages, onSelectHandler) {
	scope.name = name,
	scope.description = description;
    scope.gages = gages; 
    scope.onGageSelect = onSelectHandler;
};

