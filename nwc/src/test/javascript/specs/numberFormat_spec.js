describe('NWC.util.numberFormat', function() {
	describe ('NWC.util.numberFormat.roundToInteger', function() {
		it('Expects that real numbers greater than 0.5 are rounded to the nearest integer', function() {
			expect(NWC.util.numberFormat.roundToInteger(10.2)).toEqual('10');
			expect(NWC.util.numberFormat.roundToInteger(10.56)).toEqual('11');
			expect(NWC.util.numberFormat.roundToInteger(0.56)).toEqual('1');
		});

		it('Expects that real positive numbers less than 0.5 will show that', function() {
			expect(NWC.util.numberFormat.roundToInteger(0.45)).toEqual('< 0.5');
		});
	});
});