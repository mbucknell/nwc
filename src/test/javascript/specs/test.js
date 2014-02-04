//trivial test, just for show:
describe('Conversion', function(){
        var $injector = angular.injector(['nwc.conversion']);
        var Convert = $injector.get('Convert');
        it('should convert square miles to acres', function(){
            expect(Convert.squareMilesToAcres(1)).toBe(640.0);
        });

});
