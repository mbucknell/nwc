/*global angular*/
(function () {
    var waterYear = angular.module('nwc.waterYear', []);
    waterYear.service('waterYearUtil', [
        function(){
            return {
                dateToWaterYear: function(date) {
                    var sugarDate = Date.create(date);
                    var year = sugarDate.format('{yyyy}').toNumber();
                    if (sugarDate.is('October') || sugarDate.is('November') || sugarDate.is('December')) {
                        year = year + 1;
                    }
                    return year;
                },
                waterYearStart: function(wy) {
                    return Date.create(wy - 1, 9, 1); // months are 0 indexed for some reason
                },
                waterYearEnd: function(wy) {
                    return Date.create(wy, 8, 30); // months are 0 indexed for some reason
                }
            };
        }
    ]);
    
}());