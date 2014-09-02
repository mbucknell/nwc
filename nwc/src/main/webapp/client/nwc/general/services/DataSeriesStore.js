/*global angular*/
(function () {
    var dataSeriesStoreModule = angular.module('nwc.dataSeriesStore', ['nwc.sosSources', 'nwc.conversion']);

    dataSeriesStoreModule.service('DataSeries', ['SosSources', 'Units', 'Convert',
        function (SosSources, Units, Convert) {
            var createSeriesLabel = function (metadata) {
                var label = metadata.seriesName;
                if (metadata.seriesUnits.length !== 0) {
                    label += ' (' + metadata.seriesUnits + ')';
                }
                return label;
            };
            return {
                new : function () {
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
                                    csvHeader += "\"# " + line + "\"\n";
                                });
                            }
                            csvHeader += this.metadata.seriesLabels.map(function(label) {
                                return createSeriesLabel(label);
                            }).join(",") + "\n";
                            var csvValues = "";
                            this.data.each(function(row) {
                                csvValues += row.join(",") + "\n";
                            });
                            return encodeURIComponent(csvHeader + csvValues);
                        },
                        getDataAs: function(measurementSystem, measure, normalizationFn) {
                            var convert = Units[measurementSystem][measure].conversionFromBase;
                            var normalize = normalizationFn || Convert.noop;
                            return this.data.map(function(arr) {
                                // Assume All series have untouchable date
                                var date = arr[0];
                                return [date].concat(arr.from(1).map(normalize).map(convert));
                            });
                        },
                        getSeriesLabelsAs: function(measurementSystem, measure, timeGranularity) {
                            return this.metadata.seriesLabels.map(function(label) {
                                var seriesMetadata = Object.clone(label);
                                seriesMetadata.seriesUnits = Units[measurementSystem][measure][timeGranularity];
                                return createSeriesLabel(seriesMetadata);
                            });
                        }
                    };
                }
            };
        }
    ]);

    /**
     * Given mixed frequency data series metadata and data, converts it to 
     * monthly and daily series for Graph to consume.
     * @returns {undefined}
     */
    var DataSeriesStoreService = dataSeriesStoreModule.service('DataSeriesStore', ['SosSources', 'DataSeries',
        function (SosSources, DataSeries) {
            var self = this;
            //indices of fields in store presented after update method
            var columnIndices = {
                date: 0,
                dayMet: 1,
                eta: 2
            };
            self.getIndexOfColumnNamed = function(columnName){
              return columnIndices[columnName];  
            };
            self.daily = DataSeries.new();
            self.monthly = DataSeries.new();
            
            var addSeriesLabel = function (seriesClass, metadata) {
                /* we are doing union to only get Date once,
                 * basically we union the series so we need to union the labels
                 */
                var labels = self[seriesClass].metadata.seriesLabels;
                self[seriesClass].metadata.seriesLabels = labels.union(metadata.seriesLabels);
            };

            /*
                daymet comes in daily
                eta comes in monthly
                Presume both series' data arrays are sorted in order of ascending date.
            
                Every day-row of every month must have a daymet value as-is
                If a given month has a monthly eta value, you must divide the value 
                by the number of days in the month and insert the result in 
                every day-row for that month. If a given month has no eta value,
                insert NaN in every day-row for that month.
            */
            var updateDailyHucSeries = function (nameToSeriesMap) {
                var dailyTable = [],
                        etaIndex = 0,
                        //set eta for daily 
                        etaForCurrentMonth = NaN,
                        dayMetSeries = nameToSeriesMap.dayMet,
                        etaSeries = nameToSeriesMap.eta;

                dayMetSeries.data.each(function (dayMetRow) {
                    var dayMetDateStr = dayMetRow[0],
                            dayMetValue = dayMetRow[1],
                            dayMetDay = getDayNumberFromDateString(dayMetDateStr);
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
                    dailyTable.push(rowToAdd);
                });
                self.daily.data = dailyTable;

                addSeriesLabel('daily', dayMetSeries.metadata);
                addSeriesLabel('daily', etaSeries.metadata);
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

            //minimize floating point error in accumulation
            var roundConstant = 9;
            var saferAdd = function (value1, value2) {
                return (value1 + value2).round(roundConstant);
            };
            
            /*
                daymet comes in daily
                eta comes in monthly
                Presume both series' data arrays are sorted in order of ascending date.
                
                Every month-row must have an eta value as-is
            
                If there are daily daymet records for that month, we must accumulate all of them
                and put them in the daymet value for that month-row. If there are no daily daymet records for that month,
                let the daymet value for that month-row be NaN
            
                If the first day of a month has daymet values, daymet values will be present for every day of a month, 
                except if the month in question is the last month in the period of record, in which case it might not have daymet values
                for every day of the month. If there is not a complete set of daily values for the last month, omit the month.
            */
            var updateMonthlyHucSeries = function (nameToSeriesMap) {
                var monthlyTable = [],
                        etaIndex = 0,
                        etaForCurrentMonth = NaN,
                        dayMetSeries = nameToSeriesMap.dayMet,
                        monthlyAccumulation = 0,
                        monthDateStr = '', //stored at the beginning of every month, used later once the totals have been accumulated for the month
                        endOfMonth, //stores the end of the current month of iteration
                        etaSeries = nameToSeriesMap.eta;


                dayMetSeries.data.each(function (dayMetRow) {
                    var dayMetDateStr = dayMetRow[0],
                            dayMetValue = dayMetRow[1],
                            dayMetDay = getDayNumberFromDateString(dayMetDateStr);
                    if (undefined === endOfMonth) {
                        endOfMonth = Date.create(dayMetDateStr).utc().daysInMonth();
                        monthDateStr = dayMetDateStr;
                    }
                    monthlyAccumulation = saferAdd(monthlyAccumulation, dayMetValue);
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
                        monthlyTable.push(rowToAdd);
                        
                        //reset for the next months
                        monthlyAccumulation = 0;
                        endOfMonth = undefined;
                    }
                });
                self.monthly.data = monthlyTable;

                addSeriesLabel('monthly', dayMetSeries.metadata);
                addSeriesLabel('monthly', etaSeries.metadata);
            };
            
            /**
             * @param {Map<String, DataSeries>} nameToSeriesMap A map of series id to
             * DataSeries objects
             */
            self.updateHucSeries = function (nameToSeriesMap) {
                self.daily = DataSeries.new();
                self.monthly = DataSeries.new();
                
                updateDailyHucSeries(nameToSeriesMap);
                updateMonthlyHucSeries(nameToSeriesMap);
            };

        }]);

}());