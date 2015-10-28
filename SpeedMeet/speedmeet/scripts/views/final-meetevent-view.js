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
                 $("#txt-title-final-cancel").text("SpeedMeet Event: " + oListItem.Title);
                 $("#txt-Location-final-cancel").text("Location: " + oListItem.Location1);
             }

             this.bindFinalView = function (itemId, doEmail) {
                 var oUtilityController = new UtilityController(oApplication),
                     oFinalController = new FinalController(oApplication),
                     emailObjects, itemStatus,
                     statuses = oApplication.getConstants().DB.ListFields.Status,
                     emailTemplates = oApplication.getConstants().EMAIL,
                     finalModuleId = oApplication.modules.finalMeetEventModule.id;

                 oDAMeetEventList.getListItemByItemId(itemId)
                        .done(function (oListItem) {
                            if (oListItem) {
                                geoLocation = JSON.parse(oListItem.GeoLocation);
                                oApplication.ActiveListItem = oListItem;        // Set the Active list item

                                try {
                                    itemStatus = $.parseJSON(oListItem.Status);
                                } catch (e) {
                                    itemStatus = oListItem.Status;   // Not a JSON value
                                }

                                if (itemStatus == statuses.Finalized) {
                                    setFinalView(oListItem);
                                    oApplication.showHideModule(finalModuleId, 0);   // Show the Finalized view
                                    oGoogleApi = new GoogleApi("map-canvas-finalevent", geoLocation, true);
                                    oGoogleApi.initialzeMap();
                                }
                                else if (itemStatus == statuses.Cancelled) {
                                    setCancelledView(oListItem);
                                    oApplication.showHideModule(finalModuleId, 1);   // Show the Cancel View                                   
                                }

                                if (doEmail) {
                                    oUtilityController.getUsersInfo(oListItem).done(function (usersObject) {
                                        
                                        if (itemStatus == statuses.Finalized) {
                                            emailObjects = oFinalController.getEmailObjects(usersObject, oListItem, "FinalizeEvent");
                                        }
                                        else 
                                        {
                                            emailObjects = oFinalController.getEmailObjects(usersObject, oListItem, "CancelEvent");
                                        }
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
                     self.bindFinalView(itemId, true);
                 });

             }

             this.cancelEvent = function (itemId) {
                 var status = {};
                 status["Status"] = oApplication.getConstants().DB.ListFields.Status.Cancelled;
                 oDAMeetEventList.updateListItemByItemId(itemId, status, false).done(function () {
                     self.bindFinalView(itemId, true);
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

             $("#btnCancelMeet-final").bind('click', function () {
                 oApplication.oFinalSpeedMeetView.cancelEvent(oApplication.ActiveListItem.ID);
             });
         }

         return FinalizeMeetEventView;

     });