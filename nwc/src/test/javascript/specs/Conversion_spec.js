describe('Convert', function() {
    var Convert = NWC.util.Convert;

    var incomingValue = 123.456;
    var decimalPlaces = 3;

    describe('mgdToMmAcresPerDay', function() {
        it('should be there', function() {
            expect(Convert.mgdToMmAcresPerDay).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = 115480.123;
            var actual = Convert.mgdToMmAcresPerDay(incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
    describe('squareMilesToAcres', function() {
        it('should be there', function() {
            expect(Convert.squareMilesToAcres).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = 79011.84;
            var actual = Convert.squareMilesToAcres(incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
    describe('acresToSquareKilometers', function() {
        it('should be there', function() {
            expect(Convert.acresToSquareKilometers).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = 0.5;
            var actual = Convert.acresToSquareKilometers(incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
    describe('squareMilesToSquareKilometers', function() {
        it('should convert units correctly', function() {
            var expected = 2000;
            var actual = Convert.acresToSquareKilometers(Convert.squareMilesToAcres(772.2));
            expect(actual).toBeCloseTo(expected, 1);
        });
    });
    describe('mmToInches', function() {
        it('should be there', function() {
            expect(Convert.mmToInches).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = 4.86046272;
            var actual = Convert.mmToInches(incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
    describe('mgdToMillionCubicMetersPerYear', function() {
        it('should be there', function() {
            expect(Convert.mgdToMillionCubicMetersPerYear).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = 170.576;
            var actual = Convert.mgdToMillionCubicMetersPerYear(incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
    describe('normalize', function() {
        it('should be there', function() {
            expect(Convert.normalize).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = 1.462;
            var actual = Convert.normalize(incomingValue, incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
    describe('noop', function() {
        it('should be there', function() {
            expect(Convert.noop).toBeDefined();
        });
        it('should convert units correctly', function() {
            var expected = incomingValue;
            var actual = Convert.noop(incomingValue);
            expect(actual).toBeCloseTo(expected, decimalPlaces);
        });
    });
});

describe('Units', function() {
    var Units = NWC.util.Units;

    describe('measurementSystem', function() {
        it('should have metric and us customary', function() {
            expect(Units.metric).toBeDefined();
            expect(Units.usCustomary).toBeDefined();
        });
    });

});