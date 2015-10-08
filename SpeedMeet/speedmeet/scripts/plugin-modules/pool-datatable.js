'use strict';

define(["datatables", "plugin-modules/base-datatable", "controllers/pool", "controllers/meetevent-list-controller", "controllers/utility-controller"],
    function (DataTable, BaseDataTable, PoolController, MeetEventListController, UtilityController) {

        function PoolDataTable(oApplication, dtName) {
            var self = this,
                oPoolController = new PoolController(oApplication);

            self.CONSTANTS = oApplication.getConstants(),
            self._dtName = dtName,
            self._isFeedBackChanged = false;
            self.activeRow = null;

            function renderFooterCell(columnIndex, columnTotal, itemId) {
                var footerCellHtml, footerButtonId, finalDateObject = {};

                footerButtonId = "footerButton" + columnIndex;
                footerCellHtml = String.format(self.CONSTANTS.HTML.footerCell, columnTotal, footerButtonId);
                footerButtonId = "#" + footerButtonId;
                if ($(footerButtonId).length > 0) {
                    $(footerButtonId).remove();
                }

                $("#tfooterrow").append("<td>" + footerCellHtml + "</td>");

                $(footerButtonId).click(function () {             // on Finalize button click Event
                    var hdrCell = $(self._dtName + " thead tr:nth-child(2) th:nth-child(" + columnIndex + ")");
                    finalDateObject = {};
                    finalDateObject['FinalEventDate'] = {};
                    finalDateObject['FinalEventDate']['FinalDate'] = $(hdrCell).attr('data-HdrDate');
                    finalDateObject['FinalEventDate']['FinalStartTime'] = $(hdrCell).attr('data-HdrStartTime');
                    finalDateObject['FinalEventDate']['FinalEndTime'] = $(hdrCell).attr('data-HdrEndTime');
                    oApplication.oFinalSpeedMeetView.updateFinalDate(itemId, finalDateObject);
                });
            }

            /* 
             * Update choices of the user on row leave event.
            */
            function onRowMouseLeave(row, oListItem) {

                $(row).mouseleave(function () {     //Check if the user clicked and changed value  

                    if (self._isFeedBackChanged == true) {
                        var olRowCells = {},
                            sItemType;

                        //PoolDataTable.dtTable.row(row).data()
                        $.each(row.cells, function (index, cell) {      // Collect all the values of the cell in a object literal
                            var sCellHtml = $(cell).html();
                            if (index > 0) {
                                var sCellName = "Cell" + index;
                                olRowCells[sCellName] = {};
                                olRowCells[sCellName].startDate =
                                    $(sCellHtml).attr('data-startdate'),
                                olRowCells[sCellName].endDate =
                                    $(sCellHtml).attr('data-enddate'),
                                olRowCells[sCellName].Feedback =
                                    $(sCellHtml).attr('data-feedback')
                            }
                        });

                        var oMeetEventListController = new MeetEventListController(oApplication);
                        oMeetEventListController.getListItemByItemId(oListItem.Id).done  // Get the list item object from Sharepoint list.
                            (function (oListItem) {
                                if (oListItem) {
                                    var olFeedBack = JSON.parse(oListItem.Feedback);
                                    // Loop object literal from List
                                    for (var oDate in olFeedBack) {
                                        // Loop object literal from Row
                                        for (var oCellValue in olRowCells) {
                                            if ((olRowCells[oCellValue].startDate == olFeedBack[oDate].start) &&
                                                (olRowCells[oCellValue].endDate == olFeedBack[oDate].end))
                                                olFeedBack[oDate].Participants[_spPageContextInfo.userId] = olRowCells[oCellValue].Feedback;
                                        }
                                    }


                                    var feedBackObject = {};
                                    feedBackObject['Feedback'] = olFeedBack;
                                    oMeetEventListController.
                                        updateListItemByItemId(oListItem.Id, feedBackObject, true).         // Update the FeedBack field value in the List Item.
                                        done(function () {
                                            self._isFeedBackChanged = false;
                                        });
                                }

                            });
                    }
                });
            }

            this.saveUserChoices = function () {
                var itemId = 1;
                var olRowCells = {},
                    sItemType;

                //PoolDataTable.dtTable.row(row).data()
                $.each(self.activeRow.cells, function (index, cell) {      // Collect all the values of the cell in a object literal
                    var sCellHtml = $(cell).html();
                    if (index > 0) {
                        var sCellName = "Cell" + index;
                        olRowCells[sCellName] = {};
                        olRowCells[sCellName].startDate =
                            $(sCellHtml).attr('data-startdate'),
                        olRowCells[sCellName].endDate =
                            $(sCellHtml).attr('data-enddate'),
                        olRowCells[sCellName].Feedback =
                            $(sCellHtml).attr('data-feedback')
                    }
                });

                var oMeetEventListController = new MeetEventListController(oApplication);
                oMeetEventListController.getListItemByItemId(itemId).done  // Get the list item object from Sharepoint list.
                    (function (oListItem) {
                        if (oListItem) {
                            var olFeedBack = JSON.parse(oListItem.Feedback);
                            // Loop object literal from List
                            for (var oDate in olFeedBack) {
                                // Loop object literal from Row
                                for (var oCellValue in olRowCells) {
                                    if ((olRowCells[oCellValue].startDate == olFeedBack[oDate].start) &&
                                        (olRowCells[oCellValue].endDate == olFeedBack[oDate].end))
                                        olFeedBack[oDate].Participants[_spPageContextInfo.userId] = olRowCells[oCellValue].Feedback;
                                }
                            }


                            var feedBackObject = {};
                            feedBackObject['Feedback'] = olFeedBack;
                            oMeetEventListController.
                                updateListItemByItemId(oListItem.Id, feedBackObject, true).         // Update the FeedBack field value in the List Item.
                                done(function () {
                                    self._isFeedBackChanged = false;
                                });
                        }

                    });

            }

            function getFeedBackTotal(sHtml) {
                var isCrossValue = false;
                if ($(sHtml).length > 0) {
                    var isCrossValue = $(sHtml).find("i").hasClass("glyphicon-remove");

                    isCrossValue === true ? isCrossValue = 0 : isCrossValue = 1;

                    return isCrossValue;
                }
                return isCrossValue;
            }

            function refreshFooter(columnIndex, isYes, itemId) {
                var columnTotal, footerCellHtml, footerButtonId, hdrCell, finalDateObject,
                    cell = $("#tfooterrow td:eq(" + columnIndex + ")");

                if (cell.length > 0) {
                    columnTotal = $(cell.html()).find("span").text();       // Get value of column total wrapped in span element
                    columnTotal = parseInt(columnTotal);

                    if (isYes) {
                        columnTotal++;      //Add to FeedBack total
                    }
                    else {
                        columnTotal--;      //Subtract from FeedBack total
                    }

                    footerButtonId = "footerButton" + columnIndex;
                    footerCellHtml = String.format(self.CONSTANTS.HTML.footerCell, columnTotal, footerButtonId);

                    footerButtonId = "#" + footerButtonId;
                    if ($(footerButtonId).length > 0)
                        $(footerButtonId).empty();

                    cell.html(footerCellHtml);

                    $(footerButtonId).click(function () {
                        hdrCell = $(self._dtName + " thead tr:nth-child(2) th:nth-child(" + columnIndex + ")");
                        finalDateObject = {};
                        finalDateObject['FinalEventDate'] = {};
                        finalDateObject['FinalEventDate']['FinalDate'] = $(hdrCell).attr('data-HdrDate');
                        finalDateObject['FinalEventDate']['FinalStartTime'] = $(hdrCell).attr('data-HdrStartTime');
                        finalDateObject['FinalEventDate']['FinalEndTime'] = $(hdrCell).attr('data-HdrEndTime');
                        oApplication.oFinalSpeedMeetView.updateFinalDate(itemId, finalDateObject);
                    });

                }
            }

            function bindEventOnDTCells(data, row, oListItem) {
                var oUtilityController = new UtilityController(),
                    td, dateStart, dateEnd, oldFeedback, cellHtml;

                $(data).each(function (i) {
                    $('td', row).eq(i).bind('click', function () {      // Loop each cells of the row and bind click event dynamically

                        td = $('td', row).eq(i).html();
                        dateStart = $(td).attr('data-startdate');
                        dateEnd = $(td).attr('data-enddate');
                        oldFeedback = $(td).attr('data-feedback');
                        cellHtml = "";

                        if (oldFeedback == 0) {
                            cellHtml = String.format(self.CONSTANTS.HTML.divFeedBackYES, dateStart, dateEnd);
                            $('td', row).eq(i).html(cellHtml);
                            refreshFooter(i, true, oListItem.ID);
                        }
                        else {
                            cellHtml = String.format(self.CONSTANTS.HTML.divFeedBackNO, dateStart, dateEnd);
                            $('td', row).eq(i).html(cellHtml);
                            refreshFooter(i, false, oListItem.ID);
                        }

                        oUtilityController.showAdminView(oListItem.AuthorId);       // Hide the Finalize button if the user is not the Author of the Item
                        self._isFeedBackChanged = true;       // set user feedback
                    });
                });
            }

            function findIndexInHeader(startDate, endDate, headerSequence) {
                var index = 1;
                $.each(headerSequence, function (i, time) {
                    if ((time["startDT"] == startDate) && (time["endDT"] == endDate)) {
                        return false;
                    }
                    index++;
                });

                return index;
            }

            function getDataSet(users, oListItem, headerSequence) {
                var aData = [], index;
                $.each(users, function (id, user) {
                    var aRow = [],
                        olFeedBack = JSON.parse(oListItem.Feedback),
                        sName = user.DisplayName,
                        sPicUrl = user.PictureUrl || self.CONSTANTS.URL.userImagePath;

                    aRow.push("<div id='User" + id + "' ><img class='personimage-resize' src='" + sPicUrl + "' /><span>" + sName + "</span></div>");
                    $.each(olFeedBack, function (j, date) {
                        var cellHtml = "";
                        if (date.Participants[id] == 0) {
                            cellHtml = String.format(self.CONSTANTS.HTML.divFeedBackNO, date.start, date.end);
                        }
                        else {
                            cellHtml = String.format(self.CONSTANTS.HTML.divFeedBackYES, date.start, date.end);
                        }
                        index = findIndexInHeader(date.start, date.end, headerSequence);
                        aRow[index] = cellHtml;
                        //aRow.push(cellHtml);
                    });
                    aData.push(aRow);
                });
                return aData;
            }

            this.clearDataTable = function () {

                if (PoolDataTable.dtTable != null) {
                    PoolDataTable.dtTable.destroy();
                    $(this._dtName).empty();
                }
            }

            this.bindDataTable = function (headerCollection, users, oListItem) {

                $(this._dtName).append(headerCollection["headrHtml"]);                         // Append Header row to the DataTable
                $(this._dtName).append(self.CONSTANTS.HTML.footerRow);      // Append Footer row to the DataTable

                PoolDataTable.dtTable = $(self._dtName).DataTable({
                    "paging": false,
                    "ordering": false,
                    "info": false,
                    "bFilter": false,
                    data: getDataSet(users, oListItem, headerCollection["headrSequence"]),
                    "aoColumnDefs": [
                        { "sWidth": "200px", "aTargets": [0] }              // set Participant column width
                    ],
                    //columns: columns,
                    destroy: true,
                    /* "scrollY": 400,
                     "scrollCollapse": true,*/
                    //"scrollX": true,
                    "createdRow": function (row, data, index) {             // On each Row, set css class and event
                        var userId = $(data[0]).attr("id").split("User")[1];
                        if (_spPageContextInfo.userId != userId) {
                            $(row).addClass('readonly-rows');
                        }
                        else {
                            $(row).addClass('active-rows');
                            bindEventOnDTCells(data, row, oListItem);
                            onRowMouseLeave(row, oListItem);
                            self.activeRow = row;
                        }
                    },
                    "footerCallback":
                        function (row, data, start, end, display) {
                            var api = this.api(), data, total,
                                columnIndex, sHtml, cellValue;

                            api.columns().every(function () {
                                columnIndex = this.index();
                                if (columnIndex > 0) {
                                    var columnTotal =
                                        this.data()
                                                .reduce(function (a, b) {
                                                    return getFeedBackTotal(a) + getFeedBackTotal(b);
                                                });

                                    if (isNaN(parseInt(columnTotal)))
                                        columnTotal = getFeedBackTotal();


                                    renderFooterCell(columnIndex, columnTotal, oListItem.ID);
                                }
                            });
                            //}
                        }
                });
            }
        }

        PoolDataTable.dtTable = null;
        PoolDataTable.prototype = new BaseDataTable();

        return PoolDataTable;

    });