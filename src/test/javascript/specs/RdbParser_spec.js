describe('RdbParser', function () {
    var firstTableHeaders = ['agency_cd', 'site_no', 'datetime', '02_00060_00003', '02_00060_00003_cd'];
    var secondTableHeaders = ['agency_cd', 'site_no', 'datetime', 'blah', 'blah'];
    var makeHeaderLine = function (headerArray) {
        return headerArray.join('\t') + '\n';
    };
    var firstTableRowCount = 5;
    var secondTableRowCount = 2;
    var rdbSample = '# ---------------------------------- WARNING ----------------------------------------\n'
            + '# Provisional data are subject to revision. Go to\n'
            + '# http://waterdata.usgs.gov/nwis/help/?provisional for more information.\n'
            + '#\n'
            + '# File-format description:  http://waterdata.usgs.gov/nwis/?tab_delimited_format_info\n'
            + '# Automated-retrieval info: http://waterdata.usgs.gov/nwis/?automated_retrieval_info\n'
            + '#\n'
            + '# Contact:   gs-w_support_nwisweb@usgs.gov\n'
            + '# retrieved: 2014-02-17 14:32:53 EST	(natwebcaas01)\n'
            + '#\n'
            + '# Data for the following 2 site(s) are contained in this file\n'
            + '#    USGS 01480000 RED CLAY CREEK AT WOODDALE, DE\n'
            + '#    USGS 01481500 BRANDYWINE CREEK AT WILMINGTON, DE\n'
            + '# -----------------------------------------------------------------------------------\n'
            + '#\n'
            + '# Data provided for site 01480000\n'
            + '#    DD parameter statistic   Description\n'
            + '#    02   00060     00003     Discharge, cubic feet per second (Mean)\n'
            + '#\n'
            + '# Data-value qualification codes included in this output:\n'
            + '#     A  Approved for publication -- Processing and review completed.\n'
            + '#     e  Value has been edited or estimated by USGS personnel and is write protected.\n'
            + '#     P  Provisional data subject to revision.\n'
            + '#\n'
            + makeHeaderLine(firstTableHeaders)
            + '5s	15s	20d	14n	10s\n'
            + 'USGS	01480000	1990-01-01	210	A:e\n'
            + 'USGS	01480000	1990-01-02	84	A\n'
            + 'USGS	01480000	1990-01-04	58	A\n'
            + 'USGS	01480000	1990-01-05	61	A\n'
            + 'USGS	01480000	2014-02-16	93	P\n'
            + '# Data provided for site 01481500\n'
            + '#    DD parameter statistic   Description\n'
            + '#    02   00060     00003     Discharge, cubic feet per second (Mean)\n'
            + '#\n'
            + '# Data-value qualification codes included in this output:\n'
            + '#     A  Approved for publication -- Processing and review completed.\n'
            + '#     e  Value has been edited or estimated by USGS personnel and is write protected.\n'
            + '#     P  Provisional data subject to revision.\n'
            + '#\n'
            + makeHeaderLine(secondTableHeaders)
            + '5s	15s	20d	14n	10s\n'
            + 'USGS	01481500	1990-01-01	1070	A:e\n'
            + 'USGS	01481500	1990-01-02	799	A\n';

    var $injector = angular.injector(['nwc.rdbParser']);
    var parser = $injector.get('rdbParser');
    var rdbTables = parser.parse(rdbSample);

    describe('RdbParser.parse', function () {
        it('should parse the correct number of headers', function () {
            expect(rdbTables[0].columnHeaders.length).toBe(firstTableHeaders.length);
            expect(rdbTables[1].columnHeaders.length).toBe(secondTableHeaders.length);
        });
        it('should parse the correct header values', function () {
            expect(rdbTables[0].columnHeaders).toEqual(firstTableHeaders);
            expect(rdbTables[1].columnHeaders).toEqual(secondTableHeaders);
        });
        it('should parse the correct number of rows', function () {
            expect(rdbTables[0].data.length).toBe(firstTableRowCount);
            expect(rdbTables[1].data.length).toBe(secondTableRowCount);
        });
        it('should parse the correct number of columns in every row', function () {
            rdbTables[0].data.each(function (row) {
                expect(row.length).toBe(firstTableHeaders.length);
            });
            rdbTables[1].data.each(function (row) {
                expect(row.length).toBe(secondTableHeaders.length);
            });
        });
    });
    describe('RdbTable', function () {
        describe('RdbTable.getColumnByName', function () {
            it('should correctly return requested columns of values', function () {
                var tbl = rdbTables[0];


                var column = tbl.getColumnByName('agency_cd');
                expect(column.length).toBe(firstTableRowCount);
                column.each(function (value) {
                    expect(value).toBe('USGS');
                });

                column = tbl.getColumnByName('site_no');
                expect(column.length).toBe(firstTableRowCount);
                column.each(function (value) {
                    expect(value).toBe('01480000');
                });
            });
        });
    });
});