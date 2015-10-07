'use strict';

define(["controllers/pool"], function (PoolController) {

    function DataTables(oApplication) {
        this._dtName = "#tblPool";

        var CONSTANTS = oApplication.getConstants(),
            isFeedBackChanged = false,
            dtTable,
            oPoolController = new PoolController(oApplication),
            buildFooter = function () {

            },
        updateFeedBack = function (row, oListItem) {
            //Check if the user clicked and changed value
            if (isFeedBackChanged == true) {
                var olRowCells = {},
                    sItemType;

                // Collect all the values of the cell in a object literal
                $.each(row.cells, function (index, cell) {
                    var sCellHtml = $(cell).html();
                    if (index > 0) {
                        var sCellName = "Cell" + index;
                        olRowCells[sCellName] = {};
                        olRowCells[sCellName].startDate = $(sCellHtml).attr('data-startdate'),
                        olRowCells[sCellName].endDate = $(sCellHtml).attr('data-enddate'),
                        olRowCells[sCellName].Feedback = $(sCellHtml).attr('data-feedback')
                    }
                });

                // Get the lastest value of the feedback.
                oPoolController.getFeedBackByItemId(oListItem.Id).done(function (oListItem) {
                    if (oListItem.d) {
                        var olFeedBack = JSON.parse(oListItem.d.Feedback);
                        // Loop object literal from List
                        for (var oDate in olFeedBack) {
                            // Loop object literal from Row
                            for (var oCellValue in olRowCells) {
                                if ((olRowCells[oCellValue].startDate == olFeedBack[oDate].start) &&
                                    (olRowCells[oCellValue].endDate == olFeedBack[oDate].end))
                                    olFeedBack[oDate].Participants[_spPageContextInfo.userId] = olRowCells[oCellValue].Feedback;
                            }
                        }

                        // Update the FeedBack in the List Item.
                        oPoolController.updateFeedBackByItemId(oListItem.d.Id, olFeedBack).done(function () {
                            alert('updated');
                            isFeedBackChanged = false;
                        });
                    }

                });
            }
        },
        bindClickOnRowCells = function (data, row) {
            $(data).each(function (i) {
                // Loop each cells of the row and bind click event dynamically
                $('td', row).eq(i).bind('click', function () {

                    var td = $('td', row).eq(i).html(),
                             dateStart = $(td).attr('data-startdate'),
                             dateEnd = $(td).attr('data-enddate'),
                             oldFeedback = $(td).attr('data-feedback'),
                             cellHtml = "";

                    if (oldFeedback == 0) {
                        cellHtml = String.format(CONSTANTS.HTML.divFeedBackYES, dateStart, dateEnd);
                        $('td', row).eq(i).html(cellHtml);
                    }
                    else {
                        cellHtml = String.format(CONSTANTS.HTML.divFeedBackNO, dateStart, dateEnd);
                        $('td', row).eq(i).html(cellHtml);
                    }
                    isFeedBackChanged = true; // User changed his feedback
                });
            });
        },
        getDataSet = function (users, oListItem) {
            var aData = [];
            $.each(users, function (id, user) {
                var aRow = [],
                    olFeedBack = JSON.parse(oListItem.Feedback),
                    sName = user.DisplayName,
                    sPicUrl = user.PictureUrl || CONSTANTS.URL.userImagePath;

                aRow.push("<div id='User" + id + "'><img src='" + sPicUrl + "' /><span>" + sName + "</span></div>");
                $.each(olFeedBack, function (j, date) {
                    var cellHtml = "";
                    if (date.Participants[id] == 0) {
                        cellHtml = String.format(CONSTANTS.HTML.divFeedBackNO, date.start, date.end);
                    }
                    else {
                        cellHtml = String.format(CONSTANTS.HTML.divFeedBackYES, date.start, date.end);
                    }
                    aRow.push(cellHtml);
                });
                aData.push(aRow);
            });
            return aData;
        },
    clearDataTable = function (sDataTable) {
        //if (dtTable) {
         //   dtTable.destroy();
            $(sDataTable).empty();
        //}
    };

        this.bindPoolDT = function (columns, users, oListItem) {
            var sDataTable = "#tblPool";

            clearDataTable(sDataTable);
            dtTable = $(sDataTable).DataTable({
                "paging": false,
                "ordering": false,
                "info": false,
                "bFilter": false,
                data: getDataSet(users, oListItem),
                columns: columns,
                destroy: true,
                "createdRow": function (row, data, index) {
                    var userId = $(data[0]).attr("id").split("User")[1];
                    if (_spPageContextInfo.userId != userId) {
                        $(row).addClass('readonly-rows');
                    }
                    else {
                        bindClickOnRowCells(data, row);
                        $(row).mouseleave(function () {
                            updateFeedBack(row, oListItem);
                        });
                    }
                },
                "footerCallback": function (row, data, start, end, display) {

                    var GetFeedBackTotal = function (sHtml) {
                        var sVal = 0;
                        if ($(sHtml).length > 0) {
                            var sVal = $(sHtml)[0].innerText;

                            sVal === "NO" ? sVal = 0 : sVal = 1;

                            return sVal;
                        }
                        else {
                            return sVal;
                        }

                    }

                    var api = this.api(), data, total, columnIndex, sHtml;
                    api.columns().every(function () {
                        //sHtml = api.column(columnIndex).data();
                        columnIndex = this.index();
                        if (columnIndex > 0) {
                            var sum = this.data()
                                        .reduce(function (a, b) {
                                            return GetFeedBackTotal(a) + GetFeedBackTotal(b);
                                        });

                            /*$(api.column(columnIndex).footer()).html(
                                "Total: " + sum
                                );*/
                            $("#tfooterrow").append("<td>" + sum + "</td");
                        }
                    });
                }
            });
        }
    }
    return DataTables;

});