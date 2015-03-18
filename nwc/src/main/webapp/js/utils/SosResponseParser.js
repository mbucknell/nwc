var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.SosResponseParser = function () {
	//parses an individual token
	var parseToken = function (token) {
		var value = parseFloat(token);
		return value;
	};

	var breakRowStringsIntoColumns = function (row) {
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

	var getValuesFromSosResponse = function (response) {
		var valuesTxt = $(response).find('swe\\:values').text();
		if (0 === valuesTxt.length) {
			valuesTxt = $(response).find('values').text();
		}

		//IE parsing of xml
		if (0 === valuesTxt.length) {
			valuesTxt = $($.parseXML(response)).find('swe\\:values').text();
		}

		return valuesTxt;
	};

	var getRowStringsFromCSV = function(data) {
		var result = [];

		if (data) {
			var trimmedData = data.trim();//kill terminal space and newline (' \n')
			if (trimmedData) {
				result = trimmedData.split(/\s+/);
			}
		}

		return result;
	};

	return {
		parseCSVData : function(data) {
			var result = [];
			if (data) {
				var rows = getRowStringsFromCSV(data);
				result = rows.map(breakRowStringsIntoColumns);
			}
			return result;
		},

		parseSosResponse : function (response) {
			var result = null;
			if (response) {
				var innerData = getValuesFromSosResponse(response);
				result = NWC.util.SosResponseParser.parseCSVData(innerData);
			}
			return result;
		},

		methodsForTesting : {
			parseToken : parseToken,
			breakRowStringsIntoColumns : breakRowStringsIntoColumns
		}
	};
}();

NWC.util.SosResponseFormatter = function () {

//	var SosResponseCleaner =  function() {
//		var self = this;

		var emptyValues = [9.96921e+36, -999];//these values will be considered NaN's
		var numberOfDatesPerRow = 1;//just one at the beginning

		var cleanRow = function(row) {
			var result = row;

			if (row) {
				var dates = row.slice(0, numberOfDatesPerRow);
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
					result = dates.concat(reducedVals);
				} else {
					result = dates;
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
//	};

    return {
    	formatCSVData : function(data) {
    		var result = null;

    		var rows = NWC.util.SosResponseParser.parseCSVData(data);
    		var cleaned = cleanRows(rows);

    		result = cleaned;

    		return result;
    	},

    	/**
    	 *
    	 * @param {XMLHttpResponse} response Sos GetObservation ajax response
    	 * @returns {Array} a table of native data type results
    	 */
    	formatSosResponse : function (response) {
    		var result = null;

    		var rows = NWC.util.SosResponseParser.parseSosResponse(response);
    		var cleaned = cleanRows(rows);

    		result = cleaned;

    		return result;
    	}
    };
}();