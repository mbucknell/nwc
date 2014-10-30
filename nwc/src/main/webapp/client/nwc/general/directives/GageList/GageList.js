/**
 * this directive expects
 * $scope.gageListName (name of the gage list being displayed)
 * $scope.gageListDescription (scope.description of the gage list being displayed)
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

	/*this service is a util function that allows a controller to set the scope properties without know the actual field names*/
	gageList.service('GageListService', [
         function(){
        	 return {
        		 setScopeParams: function(scope, name, description, gages, onSelectHandler) {
        			 scope.gageListName = name,
        			 scope.gageListDescription = description;
        			 scope.gages = gages; 
        			 scope.onGageSelect = onSelectHandler;
        		 }
        	 };
         }
     ]);
}());

