'use strict';
define(["controllers/my-meetevent-controller", "controllers/meetevent-list-controller", "plugin-modules/base-datatable"],
     function (MyMeetEventController, MeetEventListController, BaseDataTable) {
         function MyMeetEventView(oApplication) {
             var oMyMeetEventController = new MyMeetEventController(oApplication),
                 dtTable, arrayColumns;

             function showMeetEvent(itemId) {
                 oApplication.oShowMeetEventView.loadMeetEvent(itemId, _spPageContextInfo.userId);
             }

             this.getMySpeedMeets = function () {
                 var oMeetEventListController = new MeetEventListController(oApplication),
                     oBaseDataTable, columnsDef, columnsOrder, data, eventHtml, allAnchors;

                 oMyMeetEventController.getMySpeedMeets().done(function (arrayDataSet) {
                     arrayColumns = arrayDataSet.splice(arrayDataSet.length - 1, 1);
                     arrayDataSet.join();

                     oBaseDataTable = new BaseDataTable('#tblMyMeetEvents', arrayDataSet, arrayColumns[0]);
                     columnsDef =       // Set the buttons column width & hide the ID column (first column)
                         [{ "sWidth": "15%", "aTargets": [5] },     // Set the width of the Edit/Cancel buttons column
                          {     // Hide the ID column
                              "targets": [0], "visible": false, "searchable": false
                          },
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

                     allAnchors = $('#tblMyMeetEvents tbody').find("a.myevent");

                     // Bind the click event with the Events Anchors
                     $.each(allAnchors, function (index, eventAnchor) {
                         $(eventAnchor).bind('click', function () {
                             var eventId = $(this).attr("data-eventId");
                             showMeetEvent(eventId);
                         });
                     });

                     $('#tblMyMeetEvents tbody tr').on('click', '#btnEditMeet-mymeet', function () {
                         data = oBaseDataTable.DataTable().row($(this).parents('tr')).data();
                         oMeetEventListController.getListItemByItemId(data[0])
                                        .done(function (oListItem) {
                                            oApplication.ActiveListItem = oListItem;        // Set the Active list item
                                            oApplication.oMeetEventView.editEvent(oApplication.ActiveListItem.ID);
                                        });
                     });
                 });
             }
         }

         return MyMeetEventView;
     });