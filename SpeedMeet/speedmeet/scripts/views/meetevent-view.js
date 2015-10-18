'use strict';
define(["controllers/meetevent-controller", "controllers/utility-controller", "plugin-modules/pool-datatable", "plugin-modules/google-api", "data/data-meetevent-list"],
     function (MeetEventController, UtilityController, PoolDataTable, GoogleApi, DAMeetEventList) {
         function MeetEventView(oApplication) {
             var oMeetEventModule = oApplication.modules.meetEventModule,
                 oGoogleApi,
                 oMeetEventController = new MeetEventController(oApplication),
                 oUtilityController = new UtilityController(oApplication),
                 oPoolDataTable = new PoolDataTable(oApplication, "#tblPool"),
             buttons = oMeetEventModule.getButtons(),
             oGoogleApi1, olLocation, headrCollection;

             /*
              *  Private Methods
             */
             function initializeGoogleMap(geoLocation) {
                 if (geoLocation) {
                     oGoogleApi = new GoogleApi("map-canvas", geoLocation, true);
                 }
                 else {
                     oGoogleApi = new GoogleApi("map-canvas");
                 }
                 oGoogleApi.initialzeMap();
                 olLocation = oGoogleApi.getGeoLocation();
                 $("#txt-location-meetevent").val(olLocation.locationName);
             }

             function bindView(oListItem) {
                 var participant, userKeys = "", event = {}, allEvents = [],
                     eventData, eventsData, location;

                 $("#txt-title-meetevent").val(oListItem.Title);
                 $("#txt-location-meetevent").val(oListItem.Location1);
                 $("#txt-description-meetevent").val(oListItem.Description1);
                 location = JSON.parse(oListItem.GeoLocation);

                 oApplication.clearPeoplePicker();                                            // Clear the PeoplePicker.                         
                 for (participant in oListItem.Participants1.results) {
                     userKeys += oListItem.Participants1.results[participant].Name + ";";
                 }

                 userKeys = userKeys.substr(0, userKeys.length - 1);
                 oApplication.setPeoplePicker(userKeys);                                      // Set user keys in PeoplePicker 
                 oApplication.clearFullCalendar();
                 eventsData = JSON.parse(oListItem.MeetingDates);
                 for (eventData in eventsData) {
                     event = {};
                     event.title = "";
                     event.start = eventsData[eventData].startDate;
                     event.end = eventsData[eventData].endDate;
                     allEvents.push(event);
                 }
                 oApplication.AddEventsToCalander(allEvents);

                 oApplication.hideShowButtons(["btnCreateEvent"], ["btnUpdateEvent"]);
                 oApplication.showHideModule(oMeetEventModule.id);
                 initializeGoogleMap(location);
             }

             // Register Events for the New SpeedMeet.            
             $("#btnSearchLocation").bind("click", function () {
                 var sAddress = $("#txt-location-meetevent").val();
                 oGoogleApi.searchLocation(sAddress);
             });

             $("#txt-location-meetevent").on('keyup', function (event) {
                 if (event.keyCode == 13) {
                     $("#btnSearchLocation").click();
                 }
             });

             $(buttons.btnNextToCalendar).bind("click", function () {
                 $(oMeetEventModule.subModules.id[1]).removeClass("hide");
                 $(oMeetEventModule.subModules.id[0]).addClass("hide");
                 $(oApplication.modules.plugins.calendar.id).fullCalendar('render');
                 $(oApplication.modules.plugins.calendar.id).fullCalendar('option', 'height', 550);

             });

             $(buttons.btnBackToMap).bind("click", function () {
                 $(oMeetEventModule.subModules.id[0]).removeClass("hide");
                 $(oMeetEventModule.subModules.id[1]).addClass("hide");
             });

             $(buttons.btnCreateEvent).bind("click", function () {
                 var geoLocation, usrEmailObjects,
                     status = {};

                 status["Status"] = oApplication.getConstants().ListFields.Status.InProgress;
                 oApplication.startProgressbar();
                 oApplication.showHideModule(oApplication.modules.progressbar.id);       // show progress bar
                 geoLocation = oGoogleApi.getGeoLocation();

                 oMeetEventController.CreateMeetEvent(geoLocation).done(     // Create a new List item (Progressbar=30)
                     function (oListItem) {
                         oApplication.incrementProgressBar(30, "Getting Participant(s) information from SharePoint..");
                         oUtilityController.getUsersInfo(oListItem).done(function (usersObject) {
                             oApplication.incrementProgressBar(10, "Sending Email(s) to Participant(s)..");
                             usrEmailObjects = oMeetEventController.getEmailObjectsByUsers("JOINMEET", usersObject, oListItem);       // Create email objects and push in an Array                             
                             oUtilityController.sendEmails(usrEmailObjects)       // Send Emails to the participants
                                                        .done(function () {
                                                            oDAMeetEventList.updateListItemByItemId(oListItem.ID, status, true);
                                                        });
                             oApplication.stopProgressBar();
                             oApplication.oShowMeetEventView.loadMeetEvent(oListItem, usersObject);



                         });
                     });
             });

             $(buttons.btnUpdateEvent).bind('click', function () {
                 var location, itemId, usrEmailObjects, usrEmailObjects1,
                     oDAMeetEventList = new DAMeetEventList(oApplication);

                 itemId = oApplication.ActiveListItem.ID;
                 oApplication.startProgressbar();
                 oApplication.showHideModule(oApplication.modules.progressbar.id);      // show progress bar
                 location = oGoogleApi.getGeoLocation();
                 oApplication.incrementProgressBar(10, "Updating your event..");
                 oMeetEventController.UpdateMeetEvent(location).done(function (changesRecorder) {      // Update the MeetEvent
                     oApplication.incrementProgressBar(30, "SpeedMeet event is updated successfully..");
                     oDAMeetEventList.getListItemByItemId(itemId)       // Get the updated list item object
                                    .done(function (oListItem) {
                                        oApplication.incrementProgressBar(30, "collecting updated event data..");
                                        oUtilityController.getUsersInfo(oListItem).done(function (usersObject) {        // get the Users Info to be used in DataTable.                                                                                                                                        
                                            oApplication.incrementProgressBar(20, "Sending Email(s) to Participant(s)..");
                                            usrEmailObjects = oMeetEventController.getEmailObjectsByUsers("JOINMEET", usersObject, oListItem, changesRecorder[0]);       // Create email objects for new users

                                            if (changesRecorder[1] == true) {     // Second index tells whether location is updated or not.
                                                usrEmailObjects1 = oMeetEventController.getEmailObjectsByUsers("NEWLOCATION", usersObject, oListItem, changesRecorder[0]);       // Create emaail objects for all the old users
                                                usrEmailObjects = $.merge(usrEmailObjects, usrEmailObjects1);       // Merge the email objects
                                            }

                                            oUtilityController.sendEmails(usrEmailObjects)        // Send Emails to the new participants                                                                                           

                                            delete oApplication.ActiveListItem;
                                            oApplication.stopProgressBar();
                                            oApplication.oShowMeetEventView.loadMeetEvent(oListItem, usersObject);
                                        });
                                    });
                 });
             });

             /*
              *  Public Methods
             */

             this.editEvent = function (itemId) {
                 if (typeof (itemId) != "object") {     // if ItemId is not the ListItem Object
                     var oDAMeetEventList = new DAMeetEventList(oApplication);
                     oDAMeetEventList.getListItemByItemId(itemId, true).
                       done(function (oListItem) {
                           bindView(oListItem);

                       });
                 }
                 else {
                     bindView(itemId);
                 }

             }

             this.ShowNewMeet = function () {
                 oApplication.showHideModule(oMeetEventModule.id);
                 oApplication.clearFields(oMeetEventModule);
                 oApplication.clearPeoplePicker();
                 oApplication.clearFullCalendar();
                 oGoogleApi.refreshMap();
                 olLocation = oGoogleApi.getGeoLocation();
                 $("#txt-location-meetevent").val(olLocation.locationName);
                 oApplication.hideShowButtons(["btnUpdateEvent"], ["btnCreateEvent"]);
                 $("#txt-title-meetevent").focus();
             }

             /*
              *  Initializations
             */
             $("#txt-title-meetevent").focus();
             initializeGoogleMap();

         }

         return MeetEventView;
     });