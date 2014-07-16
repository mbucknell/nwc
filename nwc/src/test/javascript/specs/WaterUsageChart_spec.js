describe('WaterUsageChart', function() {
    var $injector = angular.injector(['nwc.waterUsageChart', 'nwc.waterBudgetServices']);
    var WaterUsageChart = $injector.get('WaterUsageChart');
    var CountyWaterUseProperties = $injector.get('CountyWaterUseProperties');
    
    describe('Data Combination', function() {
        it('should have the right number of columns', function() {
            var expected = oneSplit[0].values.length;
            var actual = CountyWaterUseProperties.getObservedProperties().length;
            expect(actual).toBe(expected);
        })
        
        it('should match labels ordering', function() {
            var expected = labels.map(function(el) {
                return el.slice(0, (-1 * unitsPart.length));
            });
            var actual = CountyWaterUseProperties.getPropertyLongNames();
            expect(actual).toEqual(expected);
        })
        
        it('should split like a banananana', function() {
            var expected = oneSplit[0];
            var actual = WaterUsageChart.splitRow(oneData[0]);
            expect(actual).toEqual(expected);
        })
        
        it('should combine a rows values', function() {
            var expected = oneCombined;
            var actual = WaterUsageChart.combineDataRow(
                oneSplit[0].values,
                CountyWaterUseProperties.getObservedProperties(),
                CountyWaterUseProperties.getPropertyLongNames(),
                CountyWaterUseProperties.propertyLongNameLookup());
            expect(actual).toEqual(expected);
        })
        
        it('should do something', function() {
            var expected = oneResult;
            var actual = WaterUsageChart.combineData(oneData);
            expect(actual).toEqual(expected);
        })
    });
    
    var unitsPart = ' (mgd)';
    var labels = [
        "Public Supply (mgd)",
        "Domestic (mgd)",
        "Irrigation (mgd)",
        "Thermoelectric Power (mgd)",
        "Livestock and Aquaculture (mgd)",
        "Industrial (mgd)",
        "Mining (mgd)"
    ];
    
    var oneData = [
        ["1985/01/01",0.25,null,0,null,0.85,null,0,null,20.27,null,0,null,0,null,0,0,0,0,null,null,0,null,0,0,null,null,null,null,null,null,null,null,0.54,null,0.02,null,null,null,null,null,null,null,null,null,null,null,0,0,3.44,0,0,0,0,0]
    ];
    var oneSplit = [
        {dates : ["1985/01/01"], values : [0.25,null,0,null,0.85,null,0,null,20.27,null,0,null,0,null,0,0,0,0,null,null,0,null,0,0,null,null,null,null,null,null,null,null,0.54,null,0.02,null,null,null,null,null,null,null,null,null,null,null,0,0,3.44,0,0,0,0,0]}
    ];
    var oneCombined = [0.25, 0.85, 20.27, 0, 0.56, 3.44, 0];
    var oneResult = [
        [ "1985/01/01", 0.25, 0.85, 20.27, 0, 0.56, 3.44, 0 ]
    ];
    var someData = [
        ["1985/01/01",0.25,null,0,null,0.85,null,0,null,20.27,null,0,null,0,null,0,0,0,0,null,null,0,null,0,0,null,null,null,null,null,null,null,null,0.54,null,0.02,null,null,null,null,null,null,null,null,null,null,null,0,0,3.44,0,0,0,0,0],
        ["1986/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1987/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1988/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1989/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1990/01/01",0.39,null,0,null,0.83,null,0,null,24.68,null,0,null,0,null,0,0,0,0,null,null,0,null,0,0,null,null,null,null,null,null,null,null,0.29,null,0.03,null,null,null,0,null,0,null,null,null,null,null,0.05,0,0,0,0,0,0,0],
        ["1991/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1992/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1993/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1994/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1995/01/01",0.35,0,0,0,0.86,0,0,0,24.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0.27,0,0.03,0,null,null,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0],
        ["1996/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1997/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1998/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["1999/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["2000/01/01",0.6,null,0,null,1,null,0,null,27.13,null,0,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,0.24,0.02,null,null,null,null,2.8,null,0,null,0,0,0,0,null,null,null,null],
        ["2001/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["2002/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["2003/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["2004/01/01",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ["2005/01/01",0.69,0,0,0,0.77,null,0,null,48.81,null,0.27,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,0.29,0.03,null,null,null,null,0.89,null,0,null,0.23,0,0,0,0.01,0,0.01,0]
    ];
})