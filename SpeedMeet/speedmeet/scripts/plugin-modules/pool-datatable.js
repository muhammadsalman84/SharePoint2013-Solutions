'use strict';

define(["datatables", "plugin-modules/base-datatable", "data/data-meetevent-list", "controllers/utility-controller"],
    function (DataTable, BaseDataTable, DAMeetEventList, UtilityController) {

        function PoolDataTable(oApplication, dtName) {
            var self = this;

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

            function getFeedBackTotal(cellHtml) {
                var feedBackValue = 0;

                if ($.isNumeric(cellHtml))
                    return cellHtml;

                if ($(cellHtml).length > 0) {
                    var feedBackValue = $(cellHtml).find("i").hasClass("glyphicon-remove");

                    feedBackValue === true ? feedBackValue = 0 : feedBackValue = 1;

                    return parseInt(feedBackValue);
                }
                return parseInt(feedBackValue);
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
                var oUtilityController = new UtilityController(oApplication),
                    td, dateStart, dateEnd, oldFeedback, cellHtml;

                $(data).each(function (i) {
                    if (i > 0) {
                        $('td', row).eq(i).bind('click', function () {      // Loop each cells of the row and bind click event dynamically
                            
                            td = $('td', row).eq(i).html();
                            dateStart = $(td).attr('data-startdate');
                            dateEnd = $(td).attr('data-enddate');
                            oldFeedback = $(td).attr('data-feedback');
                            cellHtml = "";

                            if ((dateStart)) {
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
                            }
                        });
                    }
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

                    //aRow.push("<div id='User" + id + "' ><img class='personimage-resize' src='" + sPicUrl + "' /><span>" + sName + "</span></div>");
                    aRow.push("<div id='User" + id + "' >" + user.PicturePresence + "</div>");
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

            this.saveUserChoices = function (itemId) {
                var oDeferred = $.Deferred(),
                    olRowCells = {},
                    feedBackObject = {},
                    sItemType, olFeedBack, oDate, cellHtml, cellName, oCellValue,
                    oDAMeetEventList = new DAMeetEventList(oApplication);


                $.each(self.activeRow.cells, function (index, cell) {      // Collect all the values of the cell in a object literal
                    cellHtml = $(cell).html();
                    if (index > 0) {
                        cellName = "Cell" + index;
                        olRowCells[cellName] = {};
                        olRowCells[cellName].startDate =
                            $(cellHtml).attr('data-startdate'),
                        olRowCells[cellName].endDate =
                            $(cellHtml).attr('data-enddate'),
                        olRowCells[cellName].Feedback =
                            $(cellHtml).attr('data-feedback')
                    }
                });

                oDAMeetEventList.getListItemByItemId(itemId)        // Get the list item object from Sharepoint list.
                    .done(function (oListItem) {
                        if (oListItem) {
                            olFeedBack = JSON.parse(oListItem.Feedback);

                            for (oDate in olFeedBack) {      // Loop object literal from List                                
                                for (oCellValue in olRowCells) {        // Loop object literal from Row
                                    if ((olRowCells[oCellValue].startDate == olFeedBack[oDate].start) &&
                                        (olRowCells[oCellValue].endDate == olFeedBack[oDate].end))
                                        olFeedBack[oDate].Participants[_spPageContextInfo.userId] = olRowCells[oCellValue].Feedback;
                                }
                            }

                            feedBackObject['Feedback'] = olFeedBack;
                            oDAMeetEventList.
                                updateListItemByItemId
                                    (oListItem.Id, feedBackObject, true)      // Update the FeedBack field value in the List Item.
                                        .done(function () {
                                            oDeferred.resolve(true);
                                        }).
                                        fail(function () {
                                            oDeferred.resolve(false);
                                        });
                        }

                    });

                return oDeferred.promise();
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
                    /*"scrollY": 400,
                    "scrollCollapse": true,*/
                    "bAutoWidth": false,
                    //"scrollX": true,
                    "createdRow": function (row, data, index) {             // On each Row, set css class and event
                        var userId = $(data[0]).attr("id").split("User")[1];
                        if (_spPageContextInfo.userId != userId) {
                            $(row).addClass('readonly-rows');
                        }
                        else {
                            $(row).addClass('active-rows');
                            bindEventOnDTCells(data, row, oListItem);
                            self.activeRow = row;       // Set the active row to be later use by saveChoices() Method
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
                                                    return (getFeedBackTotal(a)) + (getFeedBackTotal(b));
                                                }, 0);

                                    if (isNaN(parseInt(columnTotal)))
                                        columnTotal = getFeedBackTotal();


                                    renderFooterCell(columnIndex, columnTotal, oListItem.ID);
                                }
                            });
                            //}
                        }
                });

                /*$(window).resize(function () {
                    PoolDataTable.dtTable.columns.adjust();
                });*/

            }
        }

        PoolDataTable.dtTable = null;
        PoolDataTable.prototype = new BaseDataTable();

        return PoolDataTable;

    });