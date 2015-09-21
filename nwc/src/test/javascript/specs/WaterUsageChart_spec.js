/* global NWC */
/* global expect */

describe('Tests for WaterUsageChart', function() {
    var WaterUsageChart;

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
	var waterUseConfig;

    describe('Data Combination', function() {
		beforeEach (function() {
			waterUseConfig = new NWC.model.WaterUseCollection([{
					name : 'Public Supply',
					observedProperties : ["PS-WGWFr", "PS-WGWSa", "PS-WSWFr", "PS-WSWSa"],
					color : '#67609e'
				},{
					name : 'Domestic',
					observedProperties : ["DO-WGWFr", "DO-WGWSa", "DO-WSWFr", "DO-WSWSa"],
					color : '#ed1c24'
				},{
					name : 'Irrigation',
					observedProperties : ["IT-WGWFr", "IT-WGWSa", "IT-WSWFr", "IT-WSWSa"],
					color : '#009c88'
				},{
					name : 'Thermoelectric Power',
					observedProperties : ["PF-WGWFr", "PF-WGWSa", "PF-WSWFr", "PF-WSWSa", "PG-WGWFr", "PG-WGWSa", "PG-WSWFr", "PG-WSWSa", "PN-WGWFr", "PN-WGWSa", "PN-WSWFr", "PN-WSWSa", "PO-WGWFr", "PO-WGWSa", "PO-WSWFr", "PO-WSWSa", "PC-WGWFr", "PC-WGWSa", "PC-WSWFr", "PC-WSWSa"],
					color : '#f1b650'
				},{
					name : 'Livestock and Aquaculture',
					observedProperties : ["LS-WGWFr", "LS-WGWSa", "LS-WSWFr", "LS-WSWSa", "LI-WGWFr", "LI-WSWFr", "LA-WGWFr", "LA-WGWSa", "LA-WSWFr", "LA-WSWSa", "AQ-WGWFr", "AQ-WGWSa", "AQ-WSWFr", "AQ-WSWSa"],
					color : '#b9cfe6'
				},{
					name: 'Industrial',
					observedProperties : ["IN-WGWFr", "IN-WGWSa", "IN-WSWFr", "IN-WSWSa"],
					color : '#0080b7'
				},{
					name : 'Mining',
					observedProperties : ["MI-WGWFr", "MI-WGWSa", "MI-WSWFr", "MI-WSWSa"],
					color : '#f5833c'
				}
			]);
			WaterUsageChart = NWC.util.WaterUsageChart(waterUseConfig);
		});


        it('should split a row into an object with date and values', function() {
            var expected = oneSplit[0];
            var actual = WaterUsageChart.splitRow(oneData[0]);
            expect(actual).toEqual(expected);
        });

        it('should combine a rows values', function() {
            var expected = oneCombined;
            var actual = WaterUsageChart.combineDataRow(oneSplit[0].values);
            expect(actual).toEqual(expected);
        });

        it('should do something', function() {
            var expected = oneResult;
            var actual = WaterUsageChart.combineData(oneData);
            expect(actual).toEqual(expected);
        });
    });
});