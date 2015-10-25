'use strict';
define(["data/data-meetevent-list", "controllers/utility-controller", "plugin-modules/pool-datatable", "plugin-modules/google-api"],
     function (DAMeetEventList, UtilityController, PoolDataTable, GoogleApi) {
         function ShowMeetEventView(oApplication) {

             var oDAMeetEventList = new DAMeetEventList(oApplication),
                 //oPoolController = new PoolController(oApplication),
                 oPoolDataTable = new PoolDataTable(oApplication, "#tblPool", oApplication.oFinalSpeedMeet),
                 headerHtml, oGoogleApi;

             function redirectToFinalView(oListItem) {
                 var finalEventData;

                 finalEventData = JSON.parse(oListItem.FinalEventDate);
                 if (finalEventData)
                     oApplication.oFinalSpeedMeetView.bindFinalSpeedMeetView(oListItem.ID);
             }

             function bindView(oListItem) {
                 var oUtilityController = new UtilityController(oApplication),
                 showMeetEventModuleId = oApplication.modules.showMeetEventModule.id;

                 oApplication.showHideModule(showMeetEventModuleId);
                 oUtilityController.showAdminView(oListItem.AuthorId);      // Hide or Show the admin functionalities

                 $("#txt-title-pool").text("SpeedMeet Event: " + oListItem.Title);
                 $("#txt-description-pool").text(oListItem.Description1);
                 $("#txt-location-pool").text(oListItem.Location1);
                 $("#txt-organizer-pool").text(oListItem.Author.Title);
                 var geoLocation = JSON.parse(oListItem.GeoLocation);
                 oGoogleApi = new GoogleApi("map-canvas-showevent", geoLocation, true);
                 oGoogleApi.initialzeMap();
                 oApplication.ActiveListItem = oListItem;       // Set Active List Item Object for Edit purpose
                 //redirectToFinalView(oListItem);        // If the date is finalized then redirect to Finalize view
             }


             this.loadMeetEvent = function (itemId, usersObject) {
                 var oUtilityController = new UtilityController(oApplication),
                 oDeferred = $.Deferred();
                 /*if (typeof (oListItem) == "object") {     // If it is an object then Listitem object is passed.

                     headerHtml = oUtilityController.getHeadersInfo(oListItem);       // Create Headers for the DataTable                                                                          
                     oPoolDataTable.clearDataTable();
                     oPoolDataTable.bindDataTable(headerHtml, usersObject, oListItem);

                     bindView(oListItem);
                 }
                 else {*/

                 oDAMeetEventList.getListItemByItemId(itemId, true).
                     done(function (oListItem) {
                         oUtilityController.getUsersInfo(oListItem).done(function (usersObject) {
                             // Create Headers for the DataTable
                             headerHtml = oUtilityController.getHeadersInfo(oListItem);
                             oPoolDataTable.clearDataTable();
                             // Bind DataTable with header html and data.                                                  
                             oPoolDataTable.bindDataTable(headerHtml, usersObject, oListItem);
                             bindView(oListItem);
                             oDeferred.resolve();
                         });

                     });
                 return oDeferred.promise();
             }

             $("#btnShowStreetView").bind('click', function () {
                 oGoogleApi.showStreetView();
             });

             $("#btnEditMeet-show").bind('click', function () {
                 oApplication.oMeetEventView.editEvent(oApplication.ActiveListItem.ID);
             });

             $("#btnCancelMeet-show").bind('click', function () {
                 oApplication.oFinalSpeedMeetView.cancelEvent(oApplication.ActiveListItem.ID);
             });

             $("#btnSaveChoices-show").bind('click', function () {
                 oPoolDataTable.saveUserChoices(oApplication.ActiveListItem.ID)
                    .done(function (success) {
                        if (success === true) {
                            oApplication.showAlert("#alertChoicesSaved-show");
                        }
                    })
             });

         }

         return ShowMeetEventView;

     });