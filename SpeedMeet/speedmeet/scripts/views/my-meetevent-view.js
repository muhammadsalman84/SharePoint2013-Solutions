'use strict';
define(["controllers/my-meetevent-controller", "data/data-meetevent-list", "plugin-modules/base-datatable"],
     function (MyMeetEventController, DAMeetEventList, BaseDataTable) {
         function MyMeetEventView(oApplication) {
             var oMyMeetEventController = new MyMeetEventController(oApplication),
                 dtTable, arrayColumns;

             function showMeetEvent(itemId) {
                 oApplication.oShowMeetEventView.loadMeetEvent(itemId, _spPageContextInfo.userId);
             }

             this.getMySpeedMeets = function () {
                 var oDAMeetEventList = new DAMeetEventList(oApplication),
                     oBaseDataTable, columnsDef, columnsOrder, data, eventHtml, allAnchors;

                 oMyMeetEventController.getMySpeedMeets().done(function (arrayDataSet) {
                     arrayColumns = arrayDataSet.splice(arrayDataSet.length - 1, 1);
                     arrayDataSet.join();

                     oBaseDataTable = new BaseDataTable('#tblMyMeetEvents', arrayDataSet, arrayColumns[0]);
                     columnsDef =       // Set the buttons column width & hide the ID column (first column)
                         [{ "sWidth": "15%", "aTargets": [6] },     // Set the width of the Edit/Cancel buttons column
                          {     // Hide the ID column
                              "targets": [1], "visible": false, "searchable": false
                          },
                           {     // Hide the Created column
                               "targets": [3], "visible": false, "searchable": false
                           },
                          {
                              "render": function (data, type, full, meta) {                                                                    
                                  eventHtml = '<a href="#" class="myevent" id="event' + full[1] + '" data-eventId="' + full[1] + '">' + data + '</a>';
                                  return eventHtml;
                              },
                              "targets": 1
                          }];
                     
                     columnsOrder = [[3, "desc"]];      // Order by created date (descending)
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
                         oDAMeetEventList.getListItemByItemId(data[0])
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