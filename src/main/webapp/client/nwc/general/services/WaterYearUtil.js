/*global angular*/
(function () {
    var waterYear = angular.module('nwc.waterYear', []);
    waterYear.factory('WaterYearUtil', [
        function(){
            var extractYear = function(date) {
                return date.format('{yyyy}').toNumber();
            };
            var dateToWaterYear = function(date) {
                var sugarDate = Date.create(date);
                var year = extractYear(sugarDate);
                if (sugarDate.is('October') || sugarDate.is('November') || sugarDate.is('December')) {
                    year = year + 1;
                }
                return year;
            };
            
            return {
                dateToWaterYear: dateToWaterYear,
                waterYearStart: function(wy) {
                    return Date.create(wy - 1, 9, 1); // months are 0 indexed for some reason
                },
                waterYearEnd: function(wy) {
                    return Date.create(wy, 8, 30); // months are 0 indexed for some reason
                },
                waterYearRange: function(range) {
                    var wyStart = undefined;
                    var wyEnd = undefined;
                    var oct1 = Date.create(extractYear(range.start), 9, 1); // Oct 1 start year
                    if (oct1.isAfter(range.start) || oct1.is(range.start)) {
                        wyStart = oct1;
                    } else {
                        wyStart = oct1.advance('1 year');
                    }
                    
                    var sep30 = Date.create(extractYear(range.end), 8, 30); // Sep 30 end year
                    if (sep30.isBefore(range.end) || sep30.is(range.end)) {
                        wyEnd = sep30;
                    } else {
                        wyEnd = sep30.rewind('1 year');
                    }
                    return Date.range(wyStart, wyEnd);
                },
                yearsAsArray: function(range, descending) {
                    var years = [];
                    range.every('year', function(d) {
                        (descending) ? years.unshift(dateToWaterYear(d)) : years.push(dateToWaterYear(d));
                    });
                    return years;
                }
            };
        }
    ]);
    
}());