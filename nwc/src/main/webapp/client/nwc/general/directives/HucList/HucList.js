/**
 * this directive expects
 * $scope.hucListName (name of the gage list being displayed)
 * $scope.hucListDescription (scope.description of the gage list being displayed)
 * $scope.hucs (json object of a list of huc features)
 * 
 * When a user clicks on a list node, the directive will call $scope.onHucSelect(huc)
 */
(function () {
	var templatePath = '../client/nwc/general/directives/HucList/HucList.html';
	
	var hucList = angular.module('nwc.directive.HucList', []);

	hucList.directive('nwcHucList', function() {
		return {
			restrict: 'E',
			templateUrl: templatePath
		};
	});
	
	/*this service is a util function that allows a controller to set the scope properties without know the actual field names*/
	hucList.service('HucListService', [
         function(){
        	 return {
        		 setScopeParams: function(scope, name, description, hucs, onSelectHandler) {
        			 scope.hucListName = name,
        			 scope.hucListDescription = description;
        			 scope.hucs = hucs; 
        			 scope.onHucSelect = onSelectHandler;
        		 }
        	 };
         }
     ]);
	
	hucList.filter("drainageLessThan2k", function() {
    	return function(hucs) {
            var filteredItems = [];
            angular.forEach(hucs, function ( huc ) {
                if ( parseFloat(huc.data.DRAIN_SQKM) < 2000 ) {
                    filteredItems.push(huc);
                }
            });
            return filteredItems;
    	}
    });
}());

