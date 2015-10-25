'use strict';
define(["data/data-meetevent-list", "controllers/utility-controller", "controllers/final-meetevent-controller", "plugin-modules/google-api"],
     function (DAMeetEventList, UtilityController, FinalController, GoogleApi) {
         function FinalizeMeetEventView(oApplication) {
             var self = this;
             var oDAMeetEventList = new DAMeetEventList(oApplication),
                 oGoogleApi, geoLocation;

             function setFinalView(oListItem) {
                 var finalEventData = JSON.parse(oListItem.FinalEventDate);
                 $("#txt-location-final-success").text(oListItem.Location1);
                 $("#txt-title-final-success").text("SpeedMeet Event: " + oListItem.Title);
                 $("#txt-date-final-success").text(finalEventData.FinalDate);
                 $("#txt-time-final-success").text(finalEventData.FinalStartTime + " - " + finalEventData.FinalEndTime);
             }

             function setCancelledView(oListItem) {
                 var finalEventData = JSON.parse(oListItem.FinalEventDate);
                 $("#txt-location-final-cancel").text(oListItem.Location1);
                 $("#txt-title-final-cancel").text("SpeedMeet Event: " + oListItem.Title);
                 $("#txt-date-final-cancel").text(finalEventData.FinalDate);
                 $("#txt-time-final-cancel").text(finalEventData.FinalStartTime + " - " + finalEventData.FinalEndTime);
             }

             this.bindFinalSpeedMeetView = function (itemId, doEmail) {
                 var oUtilityController = new UtilityController(oApplication),
                     oFinalController = new FinalController(oApplication),
                     emailObjects, itemStatus,
                     statuses = oApplication.getConstants().DB.ListFields.Status,
                     finalModuleId = oApplication.modules.finalMeetEventModule.id;

                 oDAMeetEventList.getListItemByItemId(itemId)
                        .done(function (oListItem) {
                            if (oListItem) {
                                geoLocation = JSON.parse(oListItem.GeoLocation);
                                
                                itemStatus = JSON.parse(oListItem.Status);
                                oApplication.ActiveListItem = oListItem;        // Set the Active list item

                                if (itemStatus == statuses.Finalized) {                         
                                    setFinalView(oListItem);
                                    oApplication.showHideModule(finalModuleId, 0);
                                    oGoogleApi = new GoogleApi("map-canvas-finalevent", geoLocation, true);
                                    oGoogleApi.initialzeMap();
                                }
                                else if (itemStatus == statuses.Cancelled) {
                                    setCancelledView(oListItem);
                                    oApplication.showHideModule(finalModuleId, 1);
                                }                                                         

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

             this.cancelEvent = function (itemId) {
                 var status = {};
                 status["Status"] = oApplication.getConstants().DB.ListFields.Status.Cancelled;
                 oDAMeetEventList.updateListItemByItemId(itemId, status, false).done(function () {
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