'use strict';
define(["controllers/my-meetevent-controller", "controllers/utility-controller", "data/data-meetevent-list", "plugin-modules/base-datatable"],
     function (MyMeetEventController, UtilityController, DAMeetEventList, BaseDataTable) {
         function MyMeetEventView(oApplication) {
             var oMyMeetEventController = new MyMeetEventController(oApplication);

             function showMeetEvent(itemId) {
                 oApplication.oShowMeetEventView.loadMeetEvent(itemId, _spPageContextInfo.userId);
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
                             for(user in usersDetailObject){    // create presence of the users
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

                 oMyMeetEventController.getMySpeedMeets().done(function (arrayDataSet) {
                     headers = arrayDataSet.splice(arrayDataSet.length - 2, 1);
                     arrayDataSet.join();
                     eventDetails = arrayDataSet.splice(arrayDataSet.length - 1, 1);
                     arrayDataSet.join();

                     oBaseDataTable = new BaseDataTable(tableName, arrayDataSet, headers[0]);
                     columnsDef =       // Set the buttons column width & hide the ID column (first column)
                         [{ "sWidth": "20%", "aTargets": [4] },     // Set the width of the Edit/Cancel buttons column
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
                              "targets": 1
                          }];

                     columnsOrder = [[2, "desc"]];      // Order by created date (descending)
                     oBaseDataTable.clearDataTable();
                     oBaseDataTable.bindDataTable(columnsDef, columnsOrder);

                     allAnchors = $(tableBody).find("a.myevent");

                     // Bind the click event with the Events Anchors
                     $.each(allAnchors, function (index, eventAnchor) {
                         $(eventAnchor).bind('click', function () {
                             var eventId = $(this).attr("data-eventId");
                             showMeetEvent(eventId);
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
                             detailHtml = showEventDetails(row.data(), eventDetails[0], row);
                             var html = '<tr>' + '<td>Full name:</td>' + '<td>Muhammad Salman Malik</td>' + '</tr>'
                             
                         }
                     });
                 });
             }
         }

         return MyMeetEventView;
     });