/*global angular*/
/*global $*/
(function () {
    var sosResponseParserModule = angular.module('nwc.sosResponseParser', []);
    sosResponseParserModule.service('RealSosResponseParser', [function() {
            var self = this;

            //parses an individual token
            var parseToken = function (token) {
                var value = parseFloat(token);
                return value;
            };

            var handleRow = function (row) {
                var result = null;
                var tokens = row.split(',');

                var dateStr = tokens[0].to(tokens[0].indexOf('T'));
                dateStr = dateStr.replace(/-/g, '/');
                dateStr = dateStr.trim();
                var values = [];

                //start iteration through each token array at 1 because date is in token[0]
                values = tokens.slice(1).map(parseToken);

                result = [dateStr].concat(values);
                return result;
            };

            var parseSosResponseValues = function (valuesTxt) {
                valuesTxt = valuesTxt.trim();//kill terminal space and newline (' \n')
                var rows = valuesTxt.split(/\s+/);
                return rows;
            };

            var getValuesFromSosResponse = function (response) {
                var valuesTxt = $(response).find('swe\\:values').text();
                if (0 === valuesTxt.length) {
                    valuesTxt = $(response).find('values').text();
                }
                return valuesTxt;
            };

            self.parseSosResponse = function (response) {
                var result = null;
                if (response) {
                    var innerData = getValuesFromSosResponse(response);
                    var rows = parseSosResponseValues(innerData);

                    result = rows.map(handleRow);
                }
                return result;
            };

            self.methodsForTesting = {
                parseToken : parseToken,
                handleRow : handleRow,
                parseSosResponseValues : parseSosResponseValues,
                getValuesFromSosResponse : getValuesFromSosResponse
            };
    }]);
    sosResponseParserModule.service('SosResponseCleaner', ['RealSosResponseParser', function(RealSosResponseParser){
            var self = this;
            
            var emptyValues = [9.96921e+36, -999];//these values will be considered NaN's
            var numberOfDatesPerRow = 1;//just one at the beginning
            
            var cleanRow = function(row) {
                var result = row;
                
                if (row) {
                    var date = row.slice(0, numberOfDatesPerRow);
                    var values = row.slice(numberOfDatesPerRow);
                    var reducedVals = values.reduce(function(prev, value) {
                        var next = prev;
                        if (null !== prev) {
                            if (!isNaN(value) && !emptyValues.any(value)) {
                                next.push(value);
                            } else {
                                next = null;
                            }
                        }
                        return next;
                    }, []);
                    
                    if (reducedVals) {
                        result = date.concat(reducedVals);
                    } else {
                        result = date;
                    }
                }
                
                return result;
            };
            
            var trimRows = function(rows) {
                var result = rows;
                
                var firstRowIndex = rows.findIndex(function(row) {
                    return row.length > numberOfDatesPerRow;
                });
                
                if (0 > firstRowIndex) {
                    result = [];
                } else {
                    result = rows.slice(firstRowIndex);
                }
                
                return result;
            };
            
            var fillRow = function(fillLength, fillVal, row) {
                var result = row.clone();
                
                while (result.length - numberOfDatesPerRow < fillLength) {
                    result.push(fillVal);
                }
                
                return result;
            };
            
            var cleanRows = function(rows) {
                var result = rows;
                
                if (rows) {
                    var cleanedRows = rows.map(cleanRow);
                    
                    var trimmedRows = trimRows(cleanedRows);
                    
                    if (trimmedRows.length > 0) {
                        var rowLength = trimmedRows[0].length;
                        var filledRows = trimmedRows.map(fillRow.fill(rowLength - numberOfDatesPerRow, NaN));
                        result = filledRows;
                    } else {
                        result = trimmedRows;
                    }
                    
                }
                
                return result;
            };
            
            self.parseAndCleanSosResponse = function(response) {
                var result = null;
                var rows = RealSosResponseParser.parseSosResponse(response);
                
                if (rows) {
                    result = cleanRows(rows);
                }
                
                return result;
            };
            
            self.methodsForTesting = {
                cleanRow : cleanRow,
                cleanRows : cleanRows
            };
    }]);
    sosResponseParserModule.service('SosResponseParser', ['SosResponseCleaner', function(SosResponseCleaner){
            var self = this;
            /**
             * 
             * @param {XMLHttpResponse} response Sos GetObservation ajax response
             * @returns {Array} a table of native data type results
             */
            self.parseSosResponse = function (response) {
                return SosResponseCleaner.parseAndCleanSosResponse(response);
            };
        }]);
}());
