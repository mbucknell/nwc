/*global angular*/
(function () {
    var sosResponseParserModule = angular.module('nwc.sosResponseParser', []);
    var sosResponseParserService = sosResponseParserModule.service('SosResponseParser', [function(){
            var self = this;
            self.emptyValues = [9.96921e+36, -999];//these values will be considered NaN's    
            /**
             * 
             * @param {XMLHttpResponse} response Sos GetObservation ajax response
             * @returns {Array} a table of native data type results
             */
            self.parseSosResponse = function (response) {
                return self.parseSosResponseValues(
                    self.getValuesFromSosResponse(response)
                );
            };
            /**
             * 
             * @param {XMLHttpResponse} response Sos GetObservation ajax response
             * @returns {String} the values inside of the swe:values element
             */
            self.getValuesFromSosResponse = function (response) {
                var valuesTxt = $(response).find('swe\\:values').text();
                if (0 === valuesTxt.length) {
                    valuesTxt = $(response).find('values').text();
                }
                return valuesTxt;
            };
            /**
             * 
             * @param {String} valuesTxt the csv contained inside of the swe:values element of the GetObservation Response
             * @returns {Array} a table of native data type results
             */
            self.parseSosResponseValues = function (valuesTxt) {
                valuesTxt = valuesTxt.trim();//kill terminal space and newline (' \n')
                var rows = valuesTxt.split(/\s+/);
                var finalRows = [];
                var nonNanHasBeenFound = false;

                /**
                 * @param {Array} row A row containing Date, value, value, ... 
                 * @returns {Number} the number of non-date values in the row
                 */
                var getNumberOfValuesInRow = function (row) {
                    var numberOfDatesPerRow = 1;//just one at the beginning
                    var numberOfValuesInRow = row.length - numberOfDatesPerRow;
                    return numberOfValuesInRow;
                };

                rows.each(function (row) {
                    var tokens = row.split(',');

                    var dateStr = tokens[0].to(tokens[0].indexOf('T'));
                    dateStr = dateStr.replace(/-/g, '/');
                    dateStr = dateStr.trim();
                    var values = [];
                    var containsNaN = false;
                    var value;
                    //parses an individual token
                    var parseToken = function (token) {
                        value = parseFloat(token);
                        //if NaN of NaN-ish:
                        if (isNaN(value) || self.emptyValues.any(value)) {
                            containsNaN = true;

                            //if the any value in a row is NaN, all values will be considered NaN
                            values = [];

                            //the number of NaNs to generate must be the same as the number
                            //of values in the row
                            var numberOfNaNsToGenerate = getNumberOfValuesInRow(tokens);
                            (numberOfNaNsToGenerate).times(function () {
                                values.push(NaN);
                            });

                            //stop iteration through tokens, just use the NaNs
                            return false;
                        }
                        else {
                            values.push(value);
                        }

                    };

                    //start iteration through each token array at 1 because date is in token[0]
                    tokens.each(parseToken, 1);

                    //Do not display leading NaN values in periods of record.
                    //In other words:
                    //Only add the parsed row to final rows if the current row contains no 
                    //NaN(s) or if the current row does contain NaN(s), but a 
                    //previously-parsed row in the period of record contained no NaN(s)
                    if (!containsNaN || (containsNaN && nonNanHasBeenFound)) {//could be optimized to use implicit logic, but this way is more intelligible
                        finalRows.push([dateStr].concat(values));
                        nonNanHasBeenFound = true;  //it is a number, 
                    }
                });
                return finalRows;
            };
        }]);
}());
