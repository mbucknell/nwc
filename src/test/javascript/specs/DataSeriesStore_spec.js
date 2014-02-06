describe('DataSeriesStore', function(){
    var $injector = angular.injector(['nwc.conversion']);
    var DataSeries = $injector.get('DataSeries');
    var DataSeriesStore = $injector.get('DataSeriesStore');
    var dateRangeStart = Date.create('March 1951');
    var dateRangeEnd = Date.create('July 1956').endOfMonth().beginningOfDay();
    var dateRange = Date.range(
        dateRangeStart,
        dateRangeEnd
    );
    var formatDate = function(date){
        return date.format('{yyyy}/{MM}/{dd}');
    };
    
    var dayMetData = [];
    dateRange.every('day', function(date){
        var dateStr = formatDate(date);
       dayMetData.push([dateStr, 1.0]);
    });
    
    var dayMetDataSeries = DataSeries.new();
    dayMetDataSeries.data = dayMetData;
    dayMetDataSeries.metadata.seriesLabels.push('mm ppt');

    var etaData = [
        [formatDate(dateRangeStart), 1.0]
    ];
    var etaDataSeries = DataSeries.new();
    etaDataSeries.data = etaData;
    etaDataSeries.metadata.seriesLabels.push('mm ppt');

    var dataSeries = {
        dayMet: dayMetDataSeries,
        eta: etaDataSeries
    };

    var dss = DataSeriesStore;
    dss.updateHucSeries(dataSeries);
    //give functions inside describe block access to the test data via closure
    beforeEach(function (){
        dss = dss;
        dataSeries=dataSeries;
        dateRangeStart = dateRangeStart;
        dateRangeEnd = dateRangeEnd;
    });    
    describe('DataSeriesStore#updateMonthlyHucSeries', function(){
        it('should handle the case that the period of record ends on the last day of a month', function(){
            var numMonths = dateRangeStart.monthsUntil(dateRangeEnd);
            expect(dss.monthly.data.length).toBe(numMonths);
        });
        it('should not include an incomplete final month in the aggregation', function(){
            var incompleteDaymetDataSeries = Object.clone(dataSeries, true);
            //remove the last entry of the month
            incompleteDaymetDataSeries.dayMet.data = incompleteDaymetDataSeries.dayMet.data.to(incompleteDaymetDataSeries.dayMet.data.length-1);
            var incompleteDss = new NWCUI.data.DataSeriesStore(incompleteDaymetDataSeries);
            expect(incompleteDss.monthly.data.length).toBe(0);
        });
    });
    
});