'use strict';
define(["controllers/my-meetevent-controller", "controllers/utility-controller", "data/data-meetevent-list", "plugin-modules/base-datatable"],
     function (MyMeetEventController, UtilityController, DAMeetEventList, BaseDataTable) {
         function MyMeetEventView(oApplication) {
             var oMyMeetEventController = new MyMeetEventController(oApplication);

             function showMeetEvent(itemId, dsArray) {
                 var itemStatus = oApplication.getConstants().DB.ListFields.Status,
                     status;

                 $.each(dsArray, function (index, itemArray) {
                     if (itemId == itemArray[0]) {
                         status = itemArray[4];   // Status value in the array
                         return false;
                     }
                 });

                 switch (status) {
                     case itemStatus.Finalized:
                         oApplication.oFinalSpeedMeetView.bindFinalView(itemId);
                         break;
                     case itemStatus.Cancelled:
                         oApplication.oFinalSpeedMeetView.bindFinalView(itemId);
                         break;
                     default:
                         oApplication.oShowMeetEventView.loadMeetEvent(itemId, _spPageContextInfo.userId);
                 }

             }

             function showEventDetails(data, eventDetails, row) {
                 var presenceSettings = { type: "default", redirectToProfile: true };
                 var oUtilityController = new UtilityController(oApplication, presenceSettings);
                 var eventId = data[0];
                 var users = eventDetails[eventId]["participants"];
                 var detailHtml = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';

                 oUtilityController.getUsers(users).done(   // get the participants details
                        function (usersDetailObject) {
                            var user, participantHtml = "";
                            for (user in usersDetailObject) {    // create presence of the users
                                participantHtml += "&nbsp;&nbsp;&nbsp;" + usersDetailObject[user]["PicturePresence"];
                            }

                            detailHtml += '<tr>' + '<td><strong>Participants:</strong></td>' +
                                           '<td>' + participantHtml + '</td>' + '</tr>';
                            detailHtml += '<tr>' + '<td><strong>Description:</strong></td>' +
                                          '<td>' + eventDetails[eventId]["description"] + '</td>' + '</tr>'

                            detailHtml += '</table>';

                            row.child(detailHtml).show();
                        });


                 //return detailHtml;

             }

             this.getMySpeedMeets = function () {
                 var oDAMeetEventList = new DAMeetEventList(oApplication),
                      tableName = "#tblMyMeetEvents",
                      tableBody = tableName + " tbody",
                      dtTable, headers, eventDetails,
                      oBaseDataTable, columnsDef, columnsOrder, data, eventHtml, allAnchors;


                 oMyMeetEventController.getMySpeedMeets().done(function (dsArray) {
                     headers = dsArray.splice(dsArray.length - 2, 1);
                     dsArray.join();
                     eventDetails = dsArray.splice(dsArray.length - 1, 1);
                     dsArray.join();

                     oBaseDataTable = new BaseDataTable(tableName, dsArray, headers[0]);
                     columnsDef =       // Set the buttons column width & hide the ID column (first column)
                         [{ "sWidth": "20%", "aTargets": [5] },     // Set the width of the Edit/Cancel buttons column
                          { "sWidth": "5%", "aTargets": [0] },
                          /*{     // Hide the ID column
                              "targets": [1], "visible": false, "searchable": false
                          },*/
                           {     // Hide the Created column
                               "targets": [2], "visible": false, "searchable": false
                           },
                           {
                               "render": function (data, type, full, meta) {
                                   eventHtml = '<a href="#" class="myevent" id="event' + full[0] + '" data-eventId="' + full[0] + '">' + data + '</a>';
                                   return eventHtml;
                               },
                               "targets": [1]
                           },
                           {
                               "render": function (data, type, full, meta) {
                                   var statusHtml, itemStatus;
                                   statusHtml = "<strong><span class='{0}'>" + data + "</span></strong></strong>";
                                   itemStatus = oApplication.getConstants().DB.ListFields.Status;

                                   switch (data) {
                                       case itemStatus.InProgress:
                                           statusHtml = String.format(statusHtml, "status-InProgress");
                                           break;
                                       case itemStatus.Finalized:
                                           statusHtml = String.format(statusHtml, "status-Finalized");
                                           break;
                                       case itemStatus.Cancelled:
                                           statusHtml = String.format(statusHtml, "status-Cancelled");
                                           break;
                                   }

                                   return statusHtml;
                               },
                               "targets": [4]
                           }];

                     columnsOrder = [[2, "desc"]];      // Order by created date (descending)
                     var createdRow = function (row, data, index) {
                         if (data[4] == "Cancelled") {
                             $(row).find(".my-btns").each(function (index, element) {
                                 $(this).attr("disabled", true);
                             });

                         }
                     }

                     oBaseDataTable.clearDataTable();
                     oBaseDataTable.bindDataTable(columnsDef, columnsOrder, createdRow);

                     allAnchors = $(tableBody).find("a.myevent");

                     // Bind the click event with the Events Anchors
                     $.each(allAnchors, function (index, eventAnchor) {
                         $(eventAnchor).bind('click', function () {
                             var eventId = $(this).attr("data-eventId");
                             showMeetEvent(eventId, dsArray);
                         });
                     });

                     // Edit button Click event.
                     $(tableBody + ' tr').on('click', '#btnEditMeet-mymeet', function () {
                         data = oBaseDataTable.DataTable().row($(this).parents('tr')).data();
                         oDAMeetEventList.getListItemByItemId(data[0])
                                        .done(function (oListItem) {
                                            oApplication.ActiveListItem = oListItem;        // Set the Active list item
                                            oApplication.oMeetEventView.editEvent(oApplication.ActiveListItem.ID);
                                        });
                     });

                     // Cancel button Click event.
                     $(tableBody + ' tr').on('click', '#btnCancelMeet-mymeet', function () {
                         data = oBaseDataTable.DataTable().row($(this).parents('tr')).data();
                         oDAMeetEventList.getListItemByItemId(data[0])
                                        .done(function (oListItem) {
                                            oApplication.ActiveListItem = oListItem;        // Set the Active list item
                                            oApplication.oFinalSpeedMeetView.cancelEvent(oApplication.ActiveListItem.ID);
                                        });
                     });



                     // Show details of the event.
                     $(tableBody).on('click', 'td.details-control', function () {

                         var tr = $(this).closest('tr');
                         var row = oBaseDataTable.DataTable().row(tr);
                         var detailHtml = "";

                         if (row.child.isShown()) {
                             tr.removeClass('details');
                             row.child.hide();

                         }
                         else {
                             tr.addClass('details');
                             showEventDetails(row.data(), eventDetails[0], row);                             

                         }
                     });
                 });
             }
         }

         return MyMeetEventView;
     });