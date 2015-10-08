'use strict';
define(["controllers/join-meetevent-controller", "controllers/meetevent-list-controller", "plugin-modules/base-datatable"],
     function (JoinMeetEventController, MeetEventListController, BaseDataTable) {
         function JoinMeetEventView(oApplication) {
             var oJoinMeetEventController = new JoinMeetEventController(oApplication),
                 dtTable, arrayColumns;

             function showMeetEvent(itemId) {
                 oApplication.oShowMeetEventView.loadMeetEvent(itemId, _spPageContextInfo.userId);
             }

             this.getMeetInvitations = function () {
                 var oBaseDataTable, columnsDef, columnsOrder, data, eventHtml, allAnchors;

                 oJoinMeetEventController.getMeetInvitations().done(function (arrayDataSet) {
                     arrayColumns = arrayDataSet.splice(arrayDataSet.length - 1, 1);
                     arrayDataSet.join();

                     oBaseDataTable = new BaseDataTable('#tblJoinMeetEvents', arrayDataSet, arrayColumns[0]);
                     columnsDef =       // Set the buttons column width & hide the ID column (first column)
                         [
                          {     // Hide the ID column
                              "targets": [0], "visible": false, "searchable": false
                          },
                           {     // Hide the Created column
                               "targets": [2], "visible": false, "searchable": false
                           },
                          {
                              "render": function (data, type, full, meta) {                                                                    
                                  eventHtml = '<a href="#" id="event' + full[0] + '" data-eventId="' + full[0] + '">' + data + '</a>';
                                  return eventHtml;
                              },
                              "targets": 1
                          }];
                     
                     columnsOrder = [[2, "desc"]];      // Order by created date (descending)
                     oBaseDataTable.clearDataTable();
                     oBaseDataTable.bindDataTable(columnsDef, columnsOrder);

                     allAnchors = $('#tblJoinMeetEvents tbody').find("a");

                     // Bind the click event with the Events Anchors
                     $.each(allAnchors, function (index, eventAnchor) {
                         $(eventAnchor).bind('click', function () {
                             var eventId = $(this).attr("data-eventId");
                             showMeetEvent(eventId);
                         });
                     });
                  
                 });
             }
         }

         return JoinMeetEventView;
     });