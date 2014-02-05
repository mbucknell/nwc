/*global angular*/
(function () {
    var rdbParser = angular.module('nwc.rdpParser', []);
    var RdbTable = function(){
        var self = this === window ? {} : this;
        //a map of column name to row number
        self.columnHeaders = {}; 
        self.data = [];//row-oriented
        self.getColumnByIndex = function(index){
            return subsetTableByColumnIndices([index]);
        };
        self.subsetRow = function(row, rowIndices){
            var subsettedRow = rowIndices.map(
                function(rowIndex){
                    return row[rowIndex];
                }
            );
            return subsettedRow;
        };
        self.subsetTableByColumnIndices= function(indices){
            var subsettedTable = this.data.map(function(row){
               return subsetRow(row, indices); 
            });
            return subsettedTable;
        };
        self.getIndexOfColumnName = function(columnName){
            return self.columnHeaders[columnName];
        };
        self.getColumnByName = function(columnName){
            var columnIndex = self.getIndexOfColumnName(columnName);
        };
        
    };
    
    
}());
