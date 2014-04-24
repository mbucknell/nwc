/*global angular*/
(function () {
    var Conversion = angular.module('nwc.conversion', []);
    
    /**
     * Dimensional analysis for conversion factor as determined by dblodgett
     * 
     * Million Gallons      1 000 000           1 m^3               1 acre          1000 mm
     * _______________  *   _________   *   _______________ *   _____________   *   ________    = 935.395 mm*acres/day
     *      day             1 million       264.172 gallons     4046.86 m^2           1 m                     
     */
    var mgdToMmAcresPerDayConversionFactor = 935.395;
    var mgdToMmAcresPerDay = function (mgd) {
        return mgd * mgdToMmAcresPerDayConversionFactor;
    };
    
    /**
     * This function converts each entry of a table from million gallons per day per county to 
     * millimeter*acres per day and then scales by the number of acres in the county
     * to yield a table whose entries are all millimeters per day.
     * 
     * original table entry : (million gallons / day county)
     * final table entry : (mm / day)
     * 
     * @param {Array<Array>} table A table whose entries are in million gallons per day
     * @param {Number} acres The area of the county.
     * @returns {Array<Array>} the converted table
     */
    var mgdTableToMmPerDayTable = function (table, acres) {
        var convertRow = function (row) {
            return row.map(function (mgdOrDate, index) {
                var potentiallyConvertedResult;
                //if it's a date
                if (0 === index) {
                    potentiallyConvertedResult = mgdOrDate;
                } else {
                    //if it's an mgd
                    potentiallyConvertedResult = mgdToMmAcresPerDay(mgdOrDate) / acres;
                }
                return potentiallyConvertedResult;
            });
        };
        return table.map(convertRow);
    };

    //conversion factor per http://en.wikipedia.org/wiki/Acre#Description
    var squareMilesToAcresConversionFactor = 640.0;
    var squareMilesToAcres = function (squareMiles) {
        return squareMiles * squareMilesToAcresConversionFactor;
    };
    
    //conversion factor per http://en.wikipedia.org/wiki/Inch#Equivalence_to_other_units_of_length
    var mmToInchesConversionFactor = 0.03937;
    var mmToInches = function (millimeters) {
        return millimeters * mmToInchesConversionFactor;
    };

    Conversion.service('Convert', [
        function () {
            return {
                mgdToMmAcresPerDay: mgdToMmAcresPerDay,
                mgdTableToMmPerDayTable: mgdTableToMmPerDayTable,
                squareMilesToAcres: squareMilesToAcres,
                mmToInches: mmToInches
            };
        }
    ]);
    
    Conversion.factory("Units", ['Convert', function(Convert) {
        return {
            metric: {
                normalizedWater: {
                    unit: {
                        short: "mm",
                        long: "millimeters"
                    },
                    daily: "mm per day",
                    monthly: "mm per month",
                    yearly: "mm per year",
                    conversionFromBase: function(val) {return val;}
                },
                totalWater: {
                    unit: {
                        short: "",
                        long: ""
                    },
                    conversionFromBase: function(val) {return val;}
                }
            },
            imperial: {
                normalizedWater: {
                    unit: {
                        short: "in",
                        long: "inches",
                    },
                    daily: "in per day",
                    monthly: "in per month",
                    yearly: "in per year",
                    conversionFromBase: Convert.mmToInches
                },
                totalWater: {
                    unit: {
                        short: "mgd",
                        long: "millions of gallons per day"
                    },
                    conversionFromBase: function(val) {return val;}
                }
            }
        };
    }]);

}());
