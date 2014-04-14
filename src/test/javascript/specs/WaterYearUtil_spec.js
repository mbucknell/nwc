describe('WaterYear', function () {
    
    var $injector = angular.injector(['nwc.waterYear']);
    var util = $injector.get('waterYearUtil');

    describe('WaterYear.dateToWaterYear', function () {
        it('should convert date to correct water year', function () {
            expect(util.dateToWaterYear("1999/01/01")).toBe(1999);
            expect(util.dateToWaterYear("1999/09/30")).toBe(1999);
            expect(util.dateToWaterYear("1999/10/01")).toBe(2000);
            expect(util.dateToWaterYear("1999/11/11")).toBe(2000);
            expect(util.dateToWaterYear("1999/12/31")).toBe(2000);
        });
    });
    describe('WaterYear.waterYearStart', function() {
        it('should be October 1', function () {
            expect(util.waterYearStart(2000).is("1999/10/01")).toBe(true);
        });
    });
});