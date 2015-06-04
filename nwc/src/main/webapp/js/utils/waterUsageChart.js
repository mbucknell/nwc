NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.WaterUsageChart = (function () {
	var that = {};

    var numberOfDatesPerRow = 1; //TODO[Sibley] Copy paste from SosResponseParser, figure out a better place for this

    that.splitRow = function(row) {
    	var result = null;
    	if (row) {
    		result = {
    			dates : row.slice(0, numberOfDatesPerRow),
    			values : row.slice(numberOfDatesPerRow)
    		};
    	}
    	return result;
    };

    var isSomeData = function(val) {
    	return (val || 0 === val);
    };

    that.combineDataRow = function(row, inLabels, outLabels, lookup) {
    	var result = null;
    	var segregatedValueHolder = outLabels.reduce(function(prev, curr) {
    		prev[curr] = [];
    		return prev;
    	}, {});

    	row.forEach(function(el, index) {
    		segregatedValueHolder[lookup[inLabels[index]]].push(el);
    	});

    	result = outLabels.map(function(outLabel) {
    		return segregatedValueHolder[outLabel].reduce(function(runningTotal, nextValue) {
    			var result = runningTotal;
    			if (isSomeData(nextValue)) {
    				if (isSomeData(runningTotal)) {
    					result = runningTotal + nextValue;
    				} else {
    					result = nextValue;
    				}
    			}
    			return result;
    		}, null);
    	});

    	return result;
    };

    that.combineData = function(rows) {
    	var result = [];

    	if (rows) {
    		var splitRows = rows.map(function(row) {
    			return that.splitRow(row);
    		});

    		var inLabels = NWC.util.CountyWaterUseProperties.getObservedProperties();
    		var outLabels = NWC.util.CountyWaterUseProperties.getPropertyLongNames();
    		var lookup = NWC.util.CountyWaterUseProperties.propertyLongNameLookup();

    		result = splitRows.map(function(row) {
    			return row.dates.concat(that.combineDataRow(row.values, inLabels, outLabels, lookup));
    		});
    	}

    	return result;
    };

    var privateChart = {};
    that.setChart = function(chartEltSelector, chartLegendDivSelector, inputData, labels, ylabel, precision) {
    	if (!inputData || !inputData.length) {
    		if (privateChart.shutdown) {
    			privateChart.shutdown()
    		}
    		return;
    	}

    	var dateFormat = '{yyyy}';
    	var dateIndex = 0;

    	var stack = true,
    	bars = true;

    	var combinedData = that.combineData(inputData);

    	//convert all x values from String to Date
    	combinedData = combinedData.map(function(row) {
    		row[dateIndex] = Date.create(row[dateIndex]).utc();
    		return row;
    	});
    	//now transform from the parameterized row-oriented parallel array to flotchart's column-oriented array
    	var data = [];
    	//first check row length
    	var dataRowLength = combinedData[0].length - numberOfDatesPerRow;

    	if (dataRowLength !== labels.length) {
    		var errMsg = 'Water Usage labels and data differ in length';
    		alert(errMsg);
    		throw new Exception(errMsg);
    	}

		var props = NWC.util.CountyWaterUseProperties.observedPropertiesLookup();

    	labels.each(function(label, labelIndex) {
    		var column = {
				label: label,
				color : props[label].color
			};
    		//date column offsets index calculation by one
    		var valueIndex = labelIndex + 1;
    		column.data = combinedData.map(function(row) {
    			var newRow = null;

    			if (row[valueIndex] || 0 === row[valueIndex]) {
    				newRow = [
    				          row[dateIndex],
    				          row[valueIndex]
    				          ];
    			}

    			return newRow;
    		});
    		column.data = column.data.compact();
    		data.push(column);
    	});
    	var yearTooltipSeparator = ' - ';
    	var numYearsPerDatum = 1;
    	(function plotWithOptions() {
    		/*
    		 *  #ms in 5 years = (#ms in 4 non-leap years) + (#ms in 1 leap year)   =   157766400000
    		 *  #ms in 4 non-leap years = 4 * #ms one leap year                 =   126144000000
    		 *  #ms in 1 leap year = #ms one non-leap year + #ms in one day     =   31622400000
    		 *  #ms in one non-leap year = 365 * #ms in one day                 =   31536000000
    		 *  #ms in one day = 1000 * 60 * 60 * 24                            =   86400000
    		 */
    		var yearInMilliseconds = 1000 * 60 * 60 * 24 * 365; // 31536000000
    		privateChart = $.plot(chartEltSelector, data, {
    			series: {
					stack: stack,
					bars: {
						show: bars,
						barWidth: yearInMilliseconds,
						fill: 0.7 // This adjusts the opaqueness
					}
				},
				xaxis: {
					mode: "time",
					tickFormatter: function (val, axis) {
						return Date.create(val).utc().format(dateFormat);
					},
					tickSize: [5, "year"],
					tickLength: 10,
					color: "black",
					axisLabel: "Date",
					axisLabelPadding: 10,
                                        min: 473212800000, // This is the number of milliseconds since 1884-12-30 00:00:00
					font: {
						size: 12,
						family: "sans-serif",
						color: "#000000"
					}
				},
				yaxis: {
					color: "black",
					axisLabel: ylabel,
					axisLabelPadding: 3,
					font: {
						size: 12,
						family: "sans-serif",
						color: "#000000"
					}
				},
				grid: {
					hoverable: true,
					borderWidth: 2
				},
				tooltip: true,
				tooltipOpts: {
					content: function (label, xval, yval, flotItem) {
						var offsetIndex = flotItem.datapoint.length - 1;
						var offset = flotItem.datapoint[offsetIndex];
						var realValue = yval - offset;
						var roundedValue = realValue.round(precision);
						var initialDatumYear = Date.create(xval).utc().format(dateFormat);
						var finalDatumYear = parseInt(initialDatumYear) + numYearsPerDatum;
						var dateDisplay = initialDatumYear + yearTooltipSeparator + finalDatumYear;
						var waterUsageUnitName = (function grabUnitsFromLabel(label) {
							var result = '';
							var regex = /\((.*)\)/;
							if (regex.test(label)) {
								result = regex.exec(label)[1];
							}
							return result;
						})(label);
						var tooltipText = 'Date: ' + dateDisplay + "<br/>" + label + ": " + roundedValue + " " + waterUsageUnitName;
						return tooltipText;
					}
				},
				legend: {
					container: chartLegendDivSelector
				}
    		});
    	})();
    };

    that.getChart = function() {
		return privateChart;
	};

    return that;
}());
