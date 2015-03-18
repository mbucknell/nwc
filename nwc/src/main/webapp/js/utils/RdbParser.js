var NWC = NWC || {};

NWC.util = NWC.util || {};

(function () {
	/*
	 * @constructor
	 * @returns {undefined}
	 */
    NWC.util.RdbTable = function () {
        var self = this === window ? {} : this;
        //a map of column name to row number
        self.columnHeaders = [];
        self.data = [];//row-oriented
        self.getColumnByIndex = function (index) {
            var columns = self.subsetTableByColumnIndices([index]);
            return columns[0];
        };
        self.subsetRow = function (row, rowIndices) {
            var subsettedRow = rowIndices.map(
                    function (rowIndex) {
                        return row[rowIndex];
                    }
            );
            return subsettedRow;
        };
        self.subsetTableByColumnIndices = function (indices) {
            var subsettedTable = [];
            (indices.length).times(function () {
                subsettedTable.push([]);
            });
            self.data.each(function (row) {
                var columns = self.subsetRow(row, indices);
                columns.each(function (value, key) {
                    subsettedTable[key].push(value);
                });
            });
            return subsettedTable;
        };
        self.getIndexOfColumnName = function (columnName) {
            return self.columnHeaders.indexOf(columnName);
        };
        self.getColumnByName = function (columnName) {
            var columnIndex = self.getIndexOfColumnName(columnName);
            var column = self.getColumnByIndex(columnIndex);
            return column;
        };

    };

	NWC.util.RdbParser = function() {
		var RowType = {
			COMMENTS: 0,
			COLUMN_NAMES: 1,
			COLUMN_DEFINITION: 2,
			DATA: 3
		};

		var commentPrefix = '#';
		var lineDelimeter = '\n';
		var columnDelimeter = '\t';
		var isComment = function (line) {
			return commentPrefix === line[0];
		};
		return {
			/**
			 * Given an rdb csv string, returns an array of parsed RdbTable objects.
			 * The parser returns an array because a single rdb csv string may contain multiple tables.
			 * @param {String} text an rdb-style csv
			 * @returns {Array<RdbTable>}
			 */
			parse: function (text) {
				var state = RowType.COMMENTS;
				var lines = text.split(lineDelimeter);

				var tables = [];
				var currentTable = new NWC.util.RdbTable();

				lines.each(function (line) {
					if (line.length) {
						if (isComment(line)) {
							if (state === RowType.DATA) {
								tables.push(currentTable);
								currentTable = new NWC.util.RdbTable();
							}
							state = RowType.COMMENTS;
						}
						else {
							if (state === RowType.COMMENTS) {
								state = RowType.COLUMN_NAMES;
								var columnNames = line.split(columnDelimeter);
								currentTable.columnHeaders = columnNames;
							}
							else if (state === RowType.COLUMN_NAMES) {
								state = RowType.COLUMN_DEFINITION;
								//nothing else
							}
							else if (state === RowType.COLUMN_DEFINITION) {
								state = RowType.DATA;
								var data = line.split(columnDelimeter);
								currentTable.data.push(data);
							}
							else if (state === RowType.DATA) {
								var data = line.split(columnDelimeter);
								currentTable.data.push(data);
							}
							else {
								throw Error('Undefined Parser State');
							}
						}
					}
				});
				tables.push(currentTable);
				return tables;
			}
		};
	}();
}());


