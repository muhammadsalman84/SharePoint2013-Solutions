'use strict';
define(["controllers/meetevent-list-controller", "controllers/utility-controller", "controllers/pool", "plugin-modules/pool-datatable", "plugin-modules/google-api"],
     function (MeetEventListController, UtilityController, PoolController, PoolDataTable, GoogleApi) {
         function ShowMeetEventView(oApplication) {

             var oMeetEventListController = new MeetEventListController(oApplication),
                 oPoolController = new PoolController(oApplication),
                 oPoolDataTable = new PoolDataTable(oApplication, "#tblPool", oApplication.oFinalSpeedMeet),
                 headerHtml, oGoogleApi;

             function redirectToFinalView(oListItem) {
                 var finalEventData;

                 finalEventData = JSON.parse(oListItem.FinalEventDate);
                 if (finalEventData)
                     oApplication.oFinalSpeedMeetView.bindFinalSpeedMeetView(oListItem.ID);
             }

             function bindView(oListItem) {
                 var oUtilityController = new UtilityController(),
                 showMeetEventModuleId = oApplication.modules.showMeetEventModule.id;

                 oApplication.showHideModule(showMeetEventModuleId);
                 oUtilityController.showAdminView(oListItem.AuthorId);      // Hide or Show the admin functionalities

                 $("#txt-title-pool").text("SpeedMeet Event: " + oListItem.Title);
                 $("#txt-description-pool").text(oListItem.Description1);
                 $("#txt-location-pool").text(oListItem.Location1);
                 var geoLocation = JSON.parse(oListItem.GeoLocation);
                 oGoogleApi = new GoogleApi("map-canvas-showevent", geoLocation, true);
                 oGoogleApi.initialzeMap();
                 oApplication.ActiveListItem = oListItem;       // Set Active List Item Object for Edit purpose
                 redirectToFinalView(oListItem);        // If the date is finalized then redirect to Finalize view
             }


             this.loadMeetEvent = function (itemId, sUserId) {

                 if (typeof (itemId) == "object") {     // If it is an object then Listitem object is passed.
                     bindView(itemId);
                 }
                 else {
                     oMeetEventListController.getListItemByItemId(itemId).
                         done(function (oListItem) {
                             oPoolController.getUsersInfo(oListItem).done(function (olUsers) {
                                 // Create Headers for the DataTable
                                 headerHtml = oPoolController.getHeadersInfo();
                                 oPoolDataTable.clearDataTable();
                                 // Bind DataTable with header html and data.                                                  
                                 oPoolDataTable.bindDataTable(headerHtml, olUsers, oListItem);
                                 bindView(oListItem);
                             });

                         });
                 }
             }

             $("#btnShowStreetView").bind('click', function () {
                 oGoogleApi.showStreetView();
             });

             $("#btnEditMeet-show").bind('click', function () {
                 oApplication.oMeetEventView.editEvent(oApplication.ActiveListItem.ID);
             });

         }

         return ShowMeetEventView;

     });