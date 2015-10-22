'use strict';
define(["data/data-meetevent-list", "controllers/utility-controller", "controllers/final-meetevent-controller", "plugin-modules/google-api"],
     function (DAMeetEventList, UtilityController, FinalController, GoogleApi) {
         function FinalizeMeetEventView(oApplication) {
             var self = this;
             var oDAMeetEventList = new DAMeetEventList(oApplication),
                 oGoogleApi, finalEventData, geoLocation;


             this.bindFinalSpeedMeetView = function (itemId, doEmail) {
                 var oUtilityController = new UtilityController(oApplication),
                     oFinalController = new FinalController(oApplication),
                     emailObjects;

                 oDAMeetEventList.getListItemByItemId(itemId)
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

                                if (doEmail) {
                                    oUtilityController.getUsersInfo(oListItem).done(function (usersObject) {
                                        emailObjects = oFinalController.getEmailObjects(usersObject, oListItem);
                                        oUtilityController.sendEmails(emailObjects);
                                    });
                                }
                            }

                        });
             }


             this.updateFinalDate = function (itemId, finalDateObject) {
                 var listObject = {};
                 listObject = finalDateObject;
                 listObject["Status"] = oApplication.getConstants().DB.ListFields.Status.Finalized;
                 
                 oDAMeetEventList.updateListItemByItemId(itemId, finalDateObject, true).done(function () {
                     self.bindFinalSpeedMeetView(itemId, true);
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