describe('DataSeriesStore', function(){
    var $injector = angular.injector(['nwc.dataSeriesStore']);
    var DataSeries = $injector.get('DataSeries');
    var DataSeriesStore = $injector.get('DataSeriesStore');
    var dateRangeStart = Date.create('March 1951').utc();
    var dateRangeEnd = Date.create('July 1956').utc().endOfMonth();
    var dateRange = Date.range(
        dateRangeStart,
        dateRangeEnd
    );
    var monthsInDateRange = dateRangeEnd.monthsSince(dateRangeStart);
    
    var formatDate = function(date){
        return date.format('{yyyy}/{MM}/{dd}');
    };
    //setup test data
    
    var dayMetData = [];
    var dayMetValue = 1.0;
    dateRange.every('day', function(date){
        // every removes utc
        date.utc(true);
        var dateStr = formatDate(date);
        dayMetData.push([dateStr, dayMetValue]);
    });
    
    var dayMetDataSeries = DataSeries.new();
    dayMetDataSeries.data = dayMetData;
    dayMetDataSeries.metadata.seriesLabels.push('mm ppt');
    //first month will have no eta data. Second month will.
    var etaDefaultValue = 1.0;
    var etaOffsetInMonths = 1;
    
    var etaDateRangeStart = Date.create(dateRangeStart).utc().addMonths(etaOffsetInMonths);
    //all tests currently presume only 1 month of eta values.
    var etaData = [
        [formatDate(etaDateRangeStart), etaDefaultValue]
    ];
    var etaDataSeries = DataSeries.new();
    etaDataSeries.data = etaData;
    etaDataSeries.metadata.seriesLabels.push('mm ppt');

    var nameToSeriesMap = {
        dayMet: dayMetDataSeries,
        eta: etaDataSeries
    };

    var dss = DataSeriesStore;
    dss.updateHucSeries(nameToSeriesMap);
    //give functions inside describe block access to the test data via closure
    var dayMetIndex = DataSeriesStore.getIndexOfColumnNamed('dayMet');
    var etaIndex = DataSeriesStore.getIndexOfColumnNamed('eta');
    var dateIndex = DataSeriesStore.getIndexOfColumnNamed('date');

    beforeEach(function (){
        dss = dss;  //TODO[Sibley] Weird Assignment. Why are we doing this?
        nameToSeriesMap=nameToSeriesMap;
        dateRangeStart = dateRangeStart;
        dateRangeEnd = dateRangeEnd;
    });
    describe('DataSeriesStore.updateMonthlyHucSeries', function(){
        it('should include the correct number of months', function(){
            expect(dss.monthly.data.length).toBe(monthsInDateRange);
        });
        it('should correctly sum all the daily daymet values in a month and place them in the daymet value for that month', function(){
            //presuming all days in the test data have the same value.
            var sum = dayMetValue * etaDateRangeStart.daysInMonth();
            var dayMetIndex = DataSeriesStore.getIndexOfColumnNamed('dayMet');
            var secondMonthsAccumulatedDaymet = dss.monthly.data[etaOffsetInMonths][dayMetIndex];
            expect(secondMonthsAccumulatedDaymet).toBe(sum);
        });
        it('should place NaN in the eta field for a month having no eta records', function(){
            //test before the daymet values start
            var firstMonthsAccumulatedEta = dss.monthly.data[etaOffsetInMonths - 1][etaIndex];
            expect(isNaN(firstMonthsAccumulatedEta)).toBe(true);
            //and test after the daymet values end
            var thirdMonthsAccumulatedEta = dss.monthly.data[etaOffsetInMonths + 1][etaIndex];
            expect(isNaN(thirdMonthsAccumulatedEta)).toBe(true);

        });
        it('should omit the final month from the series if there are not daymet values for every day of the final month', function(){
            var incompleteNameToSeriesMap = Object.clone(nameToSeriesMap, true);
            //remove the last day entry of the last month
            incompleteNameToSeriesMap.dayMet.data.pop();
            dss.updateHucSeries(incompleteNameToSeriesMap);
            expect(dss.monthly.data.length).toBe(monthsInDateRange - 1);
        });
    });
    describe('DataSeriesStore.updateDailyHucSeries', function(){
        it('should place NaNs in every day-row of a month if no eta data is present for that month', function(){
            var daysInFirstMonth = dateRangeStart.daysInMonth();
            var firstMonthsDays = dss.daily.data.to(daysInFirstMonth);
            etaForADayIsNaN = function(dayRow){
                var etaForDay = dayRow[etaIndex];
                return isNaN(etaForDay);
            };
            firstMonthsDays.each(function(dayRow, index){
               expect(etaForADayIsNaN(dayRow)).toBe(true); 
            });
        });
        var numDaysInFirstMonthWithEtaData = etaDateRangeStart.daysInMonth();
        var numDaysBetweenStartOfDataAndStartOfEtaData = etaDateRangeStart.daysSince(dateRangeStart);

        it('if eta data is present for a month, it should divide the monthly eta value ' + 
            'by the number of days in the month and place that value in each day-row of the month', function(){
          
           var expectedDailyEtaValue = etaDefaultValue / numDaysInFirstMonthWithEtaData;
           var firstMonthOfEtaData = dss.daily.data.from(numDaysBetweenStartOfDataAndStartOfEtaData).to(numDaysInFirstMonthWithEtaData);
           firstMonthOfEtaData.each(function(dayRow, index){
              expect(dayRow[etaIndex]).toBe(expectedDailyEtaValue);
           });
        });
        it('if eta data is not present for a month, it should place NaN in the eta field for all of the day-rows of the month', function(){
            
            var assertNanEta = function(dayRow, index){
                expect(isNaN(dayRow[etaIndex])).toBe(true);
            };
            
            //test before the daymet values start
            var numDaysInMonthBeforeEtaData = dateRangeStart.daysInMonth();
            var monthBeforeEtaData = dss.daily.data.from(0).to(numDaysInMonthBeforeEtaData);
            
            monthBeforeEtaData.each(assertNanEta);
            //and test after the daymet values end
            var numDaysInMonthAfterEtaData = Date.create(etaDateRangeStart).utc().addMonths(1).daysInMonth();
            var numDaysBetweenStartOfDataAndStartOfMonthAfterEtaData = numDaysBetweenStartOfDataAndStartOfEtaData + numDaysInFirstMonthWithEtaData;
            var monthAfterEtaData = dss.daily.data.from(numDaysBetweenStartOfDataAndStartOfMonthAfterEtaData).to(numDaysInMonthAfterEtaData);
            monthAfterEtaData.each(assertNanEta);
            
        });
    });
    
});