'use strict';
define(["controllers/meetevent-list-controller", "plugin-modules/google-api"],
     function (MeetEventListController, GoogleApi) {
         function FinalizeMeetEventView(oApplication) {
             var self = this;
             var oMeetEventListController = new MeetEventListController(oApplication),
                 oGoogleApi, finalEventData, geoLocation;

             function sendEmail() {

             }

             this.bindFinalSpeedMeetView = function (itemId) {
                 oMeetEventListController.getListItemByItemId(itemId)
                        .done(function (oListItem) {
                            if (oListItem) {
                                geoLocation = JSON.parse(oListItem.GeoLocation);
                                finalEventData = JSON.parse(oListItem.FinalEventDate);
                                oApplication.showHideModule(oApplication.modules.finalMeetEventModule.id);                    // Show the final module view
                                $("#txt-location-finalize").text(oListItem.Location1);
                                $("#txt-title-finalize").text("SpeedMeet Event: " + oListItem.Title);
                                $("#txt-date-finalize").text(finalEventData.FinalDate);
                                $("#txt-time-finalize").text(finalEventData.FinalStartTime + " - " + finalEventData.FinalEndTime);

                                oApplication.ActiveListItem = oListItem;        // Set the Active list item

                                oGoogleApi = new GoogleApi("map-canvas-finalevent", geoLocation, true);
                                oGoogleApi.initialzeMap();
                            }
                        });
             }


             this.updateFinalDate = function (itemId, finalDateObject) {
                 oMeetEventListController.updateListItemByItemId(itemId, finalDateObject, true).done(function () {
                     self.bindFinalSpeedMeetView(itemId);
                 });

             }

             $("#btnStreetViewFinalize").click(function () {
                 oGoogleApi.showStreetView();
             });

             $("#btnBackFinalize").click(function () {
                 oApplication.showHideModule(oApplication.modules.showMeetEventModule.id);
             });

             $("#btnEditMeet-final").bind('click', function () {
                 oApplication.oMeetEventView.editEvent(oApplication.ActiveListItem.ID);
             });
         }

         return FinalizeMeetEventView;

     });