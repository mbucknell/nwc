/*global angular*/
(function () {
    var dataSeriesStoreModule = angular.module('nwc.dataSeriesStore', ['nwc.sosSources']);

    var DataSeriesMaker = function () {
        return{
            new : function () {
                return {
                    metadata: {
                        seriesLabels: ['Date']
                    },
                    data: []
                };
            }
        };
    };
    dataSeriesStoreModule.service('DataSeries', ['SosSources',
        DataSeriesMaker
    ]);

    /**
     * Given mixed frequency data series metadata and data, converts it to 
     * monthly and daily series for Graph to consume.
     * @returns {undefined}
     */
    var DataSeriesStoreService = dataSeriesStoreModule.service('DataSeriesStore', ['SosSources', 'DataSeries',
        function (SosSources, DataSeries) {
            var self = this;
            self.daily = DataSeries.new();
            self.monthly = new DataSeries.new();
            var addSeriesLabel = function (seriesClass, metadata) {
                self[seriesClass].metadata.seriesLabels.push(
                        metadata.seriesName + ' (' + metadata.seriesUnits + ')'
                        );
            };
            /*
                daymet comes in daily
                eta comes in monthly
                Presume both series' data arrays are sorted in order of ascending date.
            
                Every day-row of every month must have daymet value as-is
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
                             //extract day-of-month number from the date string
                            dayIndexInString = dayMetDateStr.lastIndexOf('/') + 1,
                            dayMetDay = dayMetDateStr.substr(dayIndexInString, 2);
                    //if looking at the first day of a month
                    if ('01' === dayMetDay) {
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
// do we need something like this?:
//                        else {
//                            etaForCurrentMonth = NaN;
//                        }
                    }
                    var date = new Date(dayMetDateStr);
                    var averageDailyEta = etaForCurrentMonth / date.daysInMonth();
                    dailyTable.push([date, dayMetValue, averageDailyEta]);
                });
                self.daily.data = dailyTable;

                addSeriesLabel('daily', dayMetSeries.metadata);
                addSeriesLabel('daily', etaSeries.metadata);
            };
            var updateMonthlyHucSeries = function (nameToSeriesMap) {
                var monthlyTable = [],
                        etaIndex = 0,
                        etaForCurrentMonth = NaN,
                        dayMetSeries = nameToSeriesMap.dayMet,
                        monthlyAccumulation = 0,
                        firstMonthOfPeriodOfRecord = true,
                        monthDateStr = '', //stored at the beginning of every month, used later once the totals have been accumulated for the month
                        endOfMonth, //stores the end of the current month of iteration
                        etaSeries = nameToSeriesMap.eta;


                dayMetSeries.data.each(function (dayMetRow) {
                    var dayMetDateStr = dayMetRow[0],
                            dayMetValue = dayMetRow[1],
                            dayIndexInString = dayMetDateStr.lastIndexOf('/') + 1,
                            dayMetDay = Number(dayMetDateStr.substr(dayIndexInString, 2));
                    if (undefined === endOfMonth) {
                        endOfMonth = Date.create(dayMetDateStr).daysInMonth();
                        monthDateStr = dayMetDateStr;
                    }
                    monthlyAccumulation = (monthlyAccumulation + dayMetValue).round(9);//minimize floating-point errors from accumulating
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
                        }//else we have fallen off the end of the eta array
                        var date = new Date(monthDateStr);
                        monthlyTable.push([date, monthlyAccumulation, etaForCurrentMonth]);
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