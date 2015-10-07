'use strict';

define(function () {

    function BaseDataTable(dtName, ds, columns) {
        this._dtName = dtName;
        this._dataSet = ds;
        this._columns = columns;
        this._dataTableObject = null;

        this.DataTable = function () {
            return this._dataTableObject;
        }
    }

    BaseDataTable.prototype.clearDataTable = function () {
        $(this._dtName).empty();
    };

    BaseDataTable.prototype.bindDataTable = function (columnsDef, columnsOrder) {
        this._dataTableObject = $(this._dtName).DataTable({
            "data": this._dataSet,
            "columns": this._columns,
            "columnDefs": columnsDef,
            "order": columnsOrder,
            destroy: true
        });
    };


    return BaseDataTable;
});