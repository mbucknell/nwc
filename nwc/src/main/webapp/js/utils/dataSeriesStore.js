/* jslint browser: true */
/* global _ */
/* global NaN */

var NWC = NWC || {};

NWC.util = NWC.util || {};

NWC.util.DataSeries = function () {
	"use strict";
	return {
		newSeries : function() {
			var createSeriesLabel = function (metadata) {
				var label = metadata.seriesName;
				if (metadata.seriesUnits.length !== 0) {
					label += ' (' + metadata.seriesUnits + ')';
				}
				return label;
			};
			return {
				metadata: {
					seriesLabels: [{
						seriesName: 'Date',
						seriesUnits: ''
					}],
					downloadHeader: ""
				},
				data: [],
				toCSV: function() {
					var csvHeader = "";
					if (this.metadata.downloadHeader && this.metadata.downloadHeader.length !== 0) {
						this.metadata.downloadHeader.lines(function(line) {
							csvHeader += "\"# " + line + "\"\r\n";
						});
					}
					csvHeader += this.metadata.seriesLabels.map(function(label) {
						return createSeriesLabel(label);
					}).join(",") + "\r\n";
					var csvValues = "";
					this.data.each(function(row) {
						csvValues += row.join(",") + "\r\n";
					});
					return csvHeader + csvValues;
				},
				getDataAs: function(measurementSystem, measure, normalizationFn) {
					var convert = NWC.util.Units[measurementSystem][measure].conversionFromBase;
					var normalize = normalizationFn || NWC.util.Convert.noop;
					return this.data.map(function(arr, index) {
						// Assume All series have untouchable date
						var date = arr[0];
						return [date].concat(arr.from(1).map(normalize).map(convert));
					});
				},
				getSeriesLabelsAs: function(measurementSystem, measure, timeGranularity) {
					return this.metadata.seriesLabels.map(function(label) {
						var seriesMetadata = Object.clone(label);
						seriesMetadata.seriesUnits = ''; //NWC.util.Units[measurementSystem][measure][timeGranularity];
						return createSeriesLabel(seriesMetadata);
					});
				}
			};
		}
	};
}();

/**
* Given mixed frequency data series metadata and data, converts it to
* monthly and daily series for Graph to consume.
* @returns {undefined}
*/
NWC.util.DataSeriesStore = function () {

	var self = this;

	//indices of fields in store presented after update method. These columns are always present. Other data is appended.
	var columnIndices = {
			date: 0,
			dayMet: 1,
			eta: 2
	};

	var addSeriesLabel = function (seriesClass, metadata) {
		/* we are doing union to only get Date once,
		 * basically we union the series so we need to union the labels
		 */
		var labels = self[seriesClass].metadata.seriesLabels;
		self[seriesClass].metadata.seriesLabels = labels.union(metadata.seriesLabels);
	};

	//these string helpers that are called 100's of times per time series
	//are faster than constructing a new date from the string and
	//using the resultant date object's instance methods
	var getDayIndexInString = function (stringDate) {
		return stringDate.lastIndexOf('/') + 1;
	};
	var getDayNumberFromDateString = function (stringDate) {
		var dayIndexInString = getDayIndexInString(stringDate);
		var dayString = stringDate.substr(dayIndexInString, 2);
		return Number(dayString);
	};

	//these string helpers that are called 100's of times per time series
	//are faster than constructing a new date from the string and
	//using the resultant date object's instance methods
	var getMonthIndexInString = function (stringDate) {
		return stringDate.indexOf('/') + 1;
	};
	var getMonthNumberFromDateString = function (stringDate) {
		var monthIndexInString = getMonthIndexInString(stringDate);
		var monthString = stringDate.substr(monthIndexInString, 2);
		return Number(monthString);
	};

	//minimize floating point error in accumulation
	var roundConstant = 9;
	var saferAdd = function (value1, value2) {
		return (value1 + value2).round(roundConstant);
	};

	/*	If we have a streamflow series, trim any entries that may be present
	 *	that precede the first dayMet series entry and follow the last dayMet
	 *	series entry. At some point, we may want to include all streamflow
	 *	on the plot.
	*/
	 var trimStreamFlowData = function (dataSeries) {
		var dateRange = self.dateRange();

		dataSeries.data = _.filter(dataSeries.data, function (entry) {
			var date = Date.create(entry[0]).utc();
			return ((date >= dateRange.start) &&
					(date <= dateRange.end));
		});
	};

	self.daily = NWC.util.DataSeries.newSeries();
	self.monthly = NWC.util.DataSeries.newSeries();
	self.yearly = NWC.util.DataSeries.newSeries();

	/*
	daymet comes in daily
	eta comes in monthly
	(optional) nwisStreamFlowData comes in daily
	(optional) modeledStreamflowData comes in daily
	Presume series' data arrays are sorted in order of ascending date.

	Every day-row of every month must have a daymet value as-is
	If a given month has a monthly eta value, you must divide the value
	by the number of days in the month and insert the result in
	every day-row for that month. If a given month has no eta value,
	insert NaN in every day-row for that month.

	@param {Object} nameToSeriesMap - properties for dayMet and eta which should both be dataSeries objects.
	*/
	self.updateDailyHucSeries = function (nameToSeriesMap) {
		var dailyTable = [];
		var etaIndex = 0;
		var nwisDataIndex = 0;
		var modeledDataIndex = 0;
		//set eta for daily
		var etaForCurrentMonth = NaN;
		var dayMetSeries = nameToSeriesMap.dayMet;
		var etaSeries = nameToSeriesMap.eta;
		var nwisStreamFlowDataSeries = nameToSeriesMap.nwisStreamFlowData;
		var modeledStreamflowSeries = nameToSeriesMap.modeledStreamflowData;

		dayMetSeries.data.each(function (dayMetRow) {
			var dayMetDateStr = dayMetRow[0];
			var dayMetValue = dayMetRow[1];
			var dayMetDay = getDayNumberFromDateString(dayMetDateStr);

			var nwisRow;
			var nwisDataValue = NaN;

			var modeledRow;
			var modeledDataValue = NaN;

			if (nwisStreamFlowDataSeries && (nwisStreamFlowDataSeries.data.length > nwisDataIndex)) {
				nwisRow = nwisStreamFlowDataSeries.data[nwisDataIndex];
				if (nwisRow[0] === dayMetDateStr) {
					nwisDataValue = nwisRow[1];
					nwisDataIndex++;
				}
			}

			if (modeledStreamflowSeries && (modeledStreamflowSeries.data.length > modeledDataIndex)) {
				modeledRow = modeledStreamflowSeries.data[modeledDataIndex];
				if (modeledRow[0] === dayMetDateStr) {
					modeledDataValue = modeledRow[1];
					modeledDataIndex++;
				}
			}

			//if looking at the first day of a month
			if (1 === dayMetDay) {
				var etaRow = etaSeries.data[etaIndex];
				//check to see if you've fallen off the end of the eta data
				if (etaRow) {
					var etaDateStr = etaRow[0];
					var etaValue = etaRow[1];
					//ensure that there is eta data for this month.
					if (etaDateStr === dayMetDateStr) {
						etaForCurrentMonth = etaValue;
						etaIndex++;
					}
				}//else we have fallen off the end of the eta array
				else {
					etaForCurrentMonth = NaN;
				}
			}
			var date = Date.create(dayMetDateStr).utc();
			var averageDailyEta = etaForCurrentMonth / date.daysInMonth();
			var rowToAdd = [];
			rowToAdd[columnIndices.date] = date;
			rowToAdd[columnIndices.dayMet] = dayMetValue;
			rowToAdd[columnIndices.eta] = averageDailyEta;
			var nextIndex = columnIndices.eta + 1;
			if (nwisStreamFlowDataSeries) {
				rowToAdd[nextIndex] = nwisDataValue;
				nextIndex++;
			}
			if (modeledStreamflowSeries) {
				rowToAdd[nextIndex] = modeledDataValue;
				nextIndex++;
			}
			dailyTable.push(rowToAdd);
		});
		self.daily.data = dailyTable;

		addSeriesLabel('daily', dayMetSeries.metadata);
		addSeriesLabel('daily', etaSeries.metadata);
		if (nwisStreamFlowDataSeries) {
			addSeriesLabel('daily', nwisStreamFlowDataSeries.metadata);
		}
		if (modeledStreamflowSeries) {
			addSeriesLabel('daily', modeledStreamflowSeries.metadata);
		}
	},

	/*
	daymet comes in daily
	eta comes in monthly
	(optional) nwisStreamFlowData comes in daily
	(optional) modeledStreamflowData comes in daily
	Presume series' data arrays are sorted in order of ascending date.

	Every month-row must have an eta value as-is

	If there are daily daymet records for that month, we must accumulate all of them
	and put them in the daymet value for that month-row. If there are no daily daymet records for that month,
	let the daymet value for that month-row be NaN. Same thing applies to nwisStreamFlowData and modeledStreamflowData

	If the first day of a month has daymet values, daymet values will be present for every day of a month,
	except if the month in question is the last month in the period of record, in which case it might not have daymet values
	for every day of the month. If there is not a complete set of daily values for the last month, omit the month.

	One exception to the previous rule is to ignore the case where only the last value of a month is not present.
	*/
	self.updateMonthlyHucSeries = function (nameToSeriesMap) {
		var monthlyTable = [];
		var etaIndex = 0;
		var nwisDataIndex = 0;
		var modeledDataIndex = 0;

		var etaForCurrentMonth = NaN;
		var monthlyAccumulation = 0;
		var nwisMonthlyAccumulation = 0;
		var modeledMonthlyAccumulation = 0;
		var nwisHasMonthly = false;
		var modeledHasMonthly = false;

		var monthDateStr = ''; //stored at the beginning of every month, used later once the totals have been accumulated for the month
		var endOfMonth; //stores the end of the current month of iteration

		var dayMetSeries = nameToSeriesMap.dayMet;
		var etaSeries = nameToSeriesMap.eta;
		var nwisStreamFlowDataSeries = nameToSeriesMap.nwisStreamFlowData;
		var modeledStreamflowSeries = nameToSeriesMap.modeledStreamflowData;

		dayMetSeries.data.each(function (dayMetRow) {
			var dayMetDateStr = dayMetRow[0],
			dayMetValue = dayMetRow[1],
			dayMetDay = getDayNumberFromDateString(dayMetDateStr);
			if (undefined === endOfMonth) {
				endOfMonth = Date.create(dayMetDateStr).utc().daysInMonth();
				monthDateStr = dayMetDateStr;
			}
			//this will have the effect of ignoring a missing value at the end of the month
			//because Dec 31 for leap years is "padded" with a NaN value
			if (dayMetValue) {
				monthlyAccumulation = saferAdd(monthlyAccumulation, dayMetValue);
			}

			if (nwisStreamFlowDataSeries && (nwisStreamFlowDataSeries.data.length > nwisDataIndex)) {
				var nwisRow = nwisStreamFlowDataSeries.data[nwisDataIndex];
				if (nwisRow[0] === dayMetDateStr) {
					if (nwisRow[1]) {
						nwisHasMonthly = true;
						nwisMonthlyAccumulation = saferAdd(nwisMonthlyAccumulation, nwisRow[1]);
					}
					nwisDataIndex++;
				}
			}

			if (modeledStreamflowSeries && (modeledStreamflowSeries.data.length > modeledDataIndex)) {
				var modeledRow = modeledStreamflowSeries.data[modeledDataIndex];
				if (modeledRow[0] === dayMetDateStr) {
					if (modeledRow[1]) {
						modeledHasMonthly = true;
						modeledMonthlyAccumulation = saferAdd(modeledMonthlyAccumulation, modeledRow[1]);
					}
					modeledDataIndex++;
				}
			}

			if (dayMetDay === endOfMonth) {
				//join the date, accumulation and the eta for last month
				var etaRow = etaSeries.data[etaIndex];
				if (etaRow) {
					var etaDateStr = etaRow[0];
					var etaValue = etaRow[1];
					if (etaDateStr === monthDateStr) {
						etaForCurrentMonth = etaValue;
						etaIndex++;
					}
				}
				//else we have fallen off the end of the eta array
				else {
					etaForCurrentMonth = NaN;
				}
				var date = Date.create(monthDateStr).utc();
				var rowToAdd = [];
				rowToAdd[columnIndices.date] = date;
				rowToAdd[columnIndices.dayMet] = monthlyAccumulation;
				rowToAdd[columnIndices.eta] = etaForCurrentMonth;
				var rowIndex = columnIndices.eta + 1;
				if (nwisStreamFlowDataSeries) {
					rowToAdd[rowIndex] = nwisHasMonthly ? nwisMonthlyAccumulation : NaN;
					rowIndex ++;
				}
				if (modeledStreamflowSeries) {
					rowToAdd[rowIndex] = modeledHasMonthly ? modeledMonthlyAccumulation : NaN;
					rowIndex++;
				}
				monthlyTable.push(rowToAdd);

				//reset for the next months
				monthlyAccumulation = 0;
				nwisMonthlyAccumulation = 0;
				modeledMonthlyAccumulation = 0;
				nwisHasMonthly = false;
				modeledHasMonthly = false;
				endOfMonth = undefined;
			}
		});
		self.monthly.data = monthlyTable;

		addSeriesLabel('monthly', dayMetSeries.metadata);
		addSeriesLabel('monthly', etaSeries.metadata);
		if (nwisStreamFlowDataSeries) {
			addSeriesLabel('monthly', nwisStreamFlowDataSeries.metadata);
		}
		if (modeledStreamflowSeries) {
			addSeriesLabel('monthly', modeledStreamflowSeries.metadata);
		}
	},

	/*
	daymet comes in daily
	eta comes in monthly
	(optional) nwisStreamFlowData comes in daily
	(optional) modeledStreamflowData comes in daily
	Presume series' data arrays are sorted in order of ascending date.

	Start accumulating dayMet, nwisStreamflow, and modeledStreamflow records at the first full year (i.e. 01-01-yyyy)
	On the last day of the month, see if there is a corresponding eta record.
	If there is an eta record, accumulate the value.
	If there are 12 months of dayMet values, put the accumulated value in the
	dayMet, nwisStreamflow, and modeledStreamflow values for that year-row and put the accumulated eta value in the eta value for that year-row.

	If the first day of a month has daymet values, daymet values will be present for every day of a month,
	except if the month in question is the last month in the period of record, in which case it might not have daymet values
	for every day of the month. If there is not a complete set of daily values for the last month, omit the month.

	One exception to the previous rule is to ignore the case where only the last value of a month is not present.
	*/
	self.updateYearlyHucSeries = function (nameToSeriesMap) {
		var yearlyTable = [];
		var etaIndex = 0;
		var nwisDataIndex = 0;
		var modeledDataIndex = 0;

		var dayMetSeries = nameToSeriesMap.dayMet;
		var etaSeries = nameToSeriesMap.eta;
		var nwisStreamFlowDataSeries = nameToSeriesMap.nwisStreamFlowData;
		var modeledStreamflowSeries = nameToSeriesMap.modeledStreamflowData;

		var etaMonths = 0;
		var etaForCurrentMonth = NaN;

		var dayMetYearlyAccumulation = 0;
		var etaYearlyAccumulation = 0;
		var nwisYearlyAccumulation = 0;
		var modeledYearlyAccumulation = 0;
		var nwisHasYearly = false;
		var modeledHasYearly = false;

		var monthDateStr = ''; //stored at the beginning of every month, used to join monthly values
		var yearDateStr = ''; //stored at the beginning of every year, used later once the totals have been accumulated for the year
		var endOfMonth; //stores the end of the current month of iteration

		dayMetSeries.data.each(function (dayMetRow) {
			var dayMetDateStr = dayMetRow[0];
			var dayMetValue = dayMetRow[1];
			var dayMetDay = getDayNumberFromDateString(dayMetDateStr);
			var dayMetMonth = getMonthNumberFromDateString(dayMetDateStr);

			//if first time through or new month is true
			if (undefined === endOfMonth) {
				endOfMonth = Date.create(dayMetDateStr).utc().daysInMonth();
				monthDateStr = dayMetDateStr;
				//start on a complete year
				if (1 === dayMetDay && 1 === dayMetMonth) {
					//use the first day of the year as the date for the year-row
					yearDateStr = dayMetDateStr;
				}
				//if first time through but not beginning of year is true
				else if (0 === etaMonths) {
					endOfMonth = undefined;
				}
			}
			//if first time through but not beginning of year is true skip until beginning of year
			if (undefined !== endOfMonth) {
				//this will have effect of ignoring a missing value at the end of the month
				if (dayMetValue) {
					//accumulate each daymet value for the entire year
					dayMetYearlyAccumulation = saferAdd(dayMetYearlyAccumulation, dayMetValue);
				}

				if (nwisStreamFlowDataSeries && (nwisStreamFlowDataSeries.data.length > nwisDataIndex)) {
					var nwisRow = nwisStreamFlowDataSeries.data[nwisDataIndex];
					if (nwisRow[0] === dayMetDateStr) {
						if (nwisRow[1]) {
							nwisHasYearly = true;
							nwisYearlyAccumulation = saferAdd(nwisYearlyAccumulation, nwisRow[1]);
						}
						nwisDataIndex++;
					}
				}

				if (modeledStreamflowSeries && (modeledStreamflowSeries.data.length > modeledDataIndex)) {
					var modeledRow = modeledStreamflowSeries.data[modeledDataIndex];
					if (modeledRow[0] === dayMetDateStr) {
						if (modeledRow[1]) {
							modeledHasYearly = true;
							modeledYearlyAccumulation = saferAdd(modeledYearlyAccumulation, modeledRow[1]);
						}
						modeledDataIndex++;
					}
				}

				//if you hit the end of the month of dayMet values is true
				if (dayMetDay === endOfMonth) {
					//add to counter to indicate when you have processed 12 months
					etaMonths++;
					//grab the eta row
					var etaRow = etaSeries.data[etaIndex];
					if (etaRow) {
						var etaDateStr = etaRow[0];
						var etaValue = etaRow[1];
						//if the eta row date is the same as the dayMet row date is true
						//otherwise skip until these dates are in sync
						if (etaDateStr === monthDateStr) {
							//put the monthly eta value in a variable
							etaForCurrentMonth = etaValue;
							etaIndex++;
						}
					}
					//else we have fallen off the end of the eta array
					else {
						etaForCurrentMonth = NaN;
					}
					//accumulate the monthly eta value
					etaYearlyAccumulation = saferAdd(etaYearlyAccumulation, etaForCurrentMonth);
					//reset the days in month indicator to start new month
					endOfMonth = undefined;

					//if 12 months of daymet values have been accumulated
					if (etaMonths === 12) {
						var date = Date.create(yearDateStr).utc();
						var rowToAdd = [];
						rowToAdd[columnIndices.date] = date;
						rowToAdd[columnIndices.dayMet] = dayMetYearlyAccumulation;
						rowToAdd[columnIndices.eta] = etaYearlyAccumulation;
						var rowIndex = columnIndices.eta + 1;
						if (nwisStreamFlowDataSeries) {
							rowToAdd[rowIndex] = nwisHasYearly ? nwisYearlyAccumulation : NaN;
							rowIndex++;
						}
						if (modeledStreamflowSeries) {
							rowToAdd[rowIndex] = modeledHasYearly ? modeledYearlyAccumulation : NaN;
							rowIndex++;
						}
						yearlyTable.push(rowToAdd);

						//reset for the next years
						etaMonths = 0;
						dayMetYearlyAccumulation = 0;
						nwisYearlyAccumulation = 0;
						modeledYearlyAccumulation = 0;
						etaYearlyAccumulation = 0;
						nwisHasYearly = false;
						modeledHasYearly = false;
					}
				}
			}
		});
		self.yearly.data = yearlyTable;

		addSeriesLabel('yearly', dayMetSeries.metadata);
		addSeriesLabel('yearly', etaSeries.metadata);
		if (nwisStreamFlowDataSeries) {
			addSeriesLabel('yearly', nwisStreamFlowDataSeries.metadata);
		}
		if (modeledStreamflowSeries) {
			addSeriesLabel('yearly', modeledStreamflowSeries.metadata);
		}
	},

	/*
	* @param {Map<String, DataSeries>} nameToSeriesMap A map of series id to
	* DataSeries objects
	*/
	self.updateHucSeries = function (nameToSeriesMap) {
		this.eta = nameToSeriesMap.eta;
		this.dayMet = nameToSeriesMap.dayMet;
		this.nwisStreamFlowData = nameToSeriesMap.nwisStreamFlowData;
		this.modeledStreamflowData = nameToSeriesMap.modeledStreamflowData;

		if (this.nwisStreamFlowData) {
			trimStreamFlowData(this.nwisStreamFlowData);
			if (this.nwisStreamFlowData.data.length === 0) {
				nameToSeriesMap.nwisStreamFlowData = null;
			}
		}

		if (this.modeledStreamflowData) {
			trimStreamFlowData(this.modeledStreamflowData);
			if (this.modeledStreamflowData.data.length === 0) {
				nameToSeriesMap.modeledStreamflowData = null;
			}
		}

		this.updateDailyHucSeries(nameToSeriesMap);
		this.updateMonthlyHucSeries(nameToSeriesMap);
		this.updateYearlyHucSeries(nameToSeriesMap);
	};

	/*
	 * @returns {Object} - start and end properties are Dates, representing the date range of the data series
	 */
	self.dateRange = function() {
		// This assumes that the daymet series represents the extent of the date range.
		var result = undefined;
		if (self.dayMet.data.length > 0) {
			result =  {
				start : Date.create(self.dayMet.data[0][0]).utc(),
				end : Date.create(self.dayMet.data[self.dayMet.data.length - 1][0]).utc()
			};
		}
		return result;
	};

};