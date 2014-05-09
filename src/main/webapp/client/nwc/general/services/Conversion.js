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
    var gallonsToCubicMetersConversionFactor = (1/264.172);
    var squareMetersToAcresConversionFactor = (1/4046.86);
    var mgdToMmAcresPerDayConversionFactor = (1000000/1) * gallonsToCubicMetersConversionFactor * squareMetersToAcresConversionFactor * (1000/1);
    var mgdToMmAcresPerDay = function (mgd) {
        return mgd * mgdToMmAcresPerDayConversionFactor;
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

    /**
     * Dimensional analysis for conversion factor
     * 
     * Million Gallons          1 m^3              365 day   
     * _______________  *   _______________ *   _____________   = 1.381675575 m^3/year
     *      day             264.172 gallons         1 year            
     */
    var mgdToMillionCubicMetersPerYearConversionFactor = gallonsToCubicMetersConversionFactor * (365 / 1);
    var mgdToMillionCubicMetersPerYear = function(mgd) {
        var result = mgd * mgdToMillionCubicMetersPerYearConversionFactor;
        return result;
    };

    //go from Millions of Gallons per time to Millimeters per time
    var normalize = function(val, areaSqMiles) {
        var result = mgdToMmAcresPerDay(val) / squareMilesToAcres(areaSqMiles);
        return result;
    };
    
    var noop = function(val) {
        return val;
    };

    Conversion.service('Convert', [
        function () {
            return {
                mgdToMmAcresPerDay: mgdToMmAcresPerDay,
                squareMilesToAcres: squareMilesToAcres,
                mmToInches: mmToInches,
                mgdToMillionCubicMetersPerYear: mgdToMillionCubicMetersPerYear,
                normalize: normalize,
                noop: noop
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
                    conversionFromBase: Convert.noop
                },
                totalWater: {
                    unit: {
                        short: "millions of m&sup3; per year",
                        long: "millions of cubic meters per year"
                    },
                    daily: "millions of m&sup3; per year",
                    monthly: "millions of m&sup3; per year",
                    yearly: "millions of m&sup3; per year",
                    conversionFromBase: Convert.mgdToMillionCubicMetersPerYear
                },
                streamflow: {
                    unit: {
                        short: "",
                        long: ""
                    },
                    daily: "",
                    monthly: "",
                    yearly: "",
                    conversionFromBase: Convert.noop
                }
            },
            usCustomary: {
                normalizedWater: {
                    unit: {
                        short: "in",
                        long: "inches"
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
                    daily: "mgd",
                    monthly: "mgd",
                    yearly: "mgd",
                    conversionFromBase: Convert.noop
                },
                streamflow: {
                    unit: {
                        short: "cfs",
                        long: "cubic feet per second"
                    },
                    daily: "cfs",
                    monthly: "cfs",
                    yearly: "cfs",
                    conversionFromBase: Convert.noop
                }
            }
        };
    }]);

}());
