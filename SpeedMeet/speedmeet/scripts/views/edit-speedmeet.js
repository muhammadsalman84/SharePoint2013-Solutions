'use strict';
define(["controllers/meetevent-list-controller", "plugin-modules/google-api"],
     function (SpeedMeetListController, GoogleApi) {
         function EditSpeedMeetView(oApplication, oFinalSpeedMeet) {
             var self = this,
                 oSpeedMeetListController = new SpeedMeetListController(oApplication),
                  oGoogleApi = new GoogleApi("map-canvas"),
                  geoLocation;

             $("#btn-edit-pool").bind('click', function () {
                 self.editEvent(oApplication.ActiveListItem.ID);                 
             });

             $("#btnUpdateEvent").bind('click', function () {
                 geoLocation = oGoogleApi.getGeoLocation();
             });

             this.editEvent = function (itemId) {
                 oSpeedMeetListController.getListItemByItemId(itemId, true).
                       done(function (oListItem) {
                           var participant, userKeys = "", event = {}, allEvents = [], eventData, eventsData;

                           $("#txt-title-newevent").val(oListItem.Title);
                           $("#txt-location-newevent").val(oListItem.Location1);
                           $("#txt-description-newevent").val(oListItem.Description1);
                           geoLocation = JSON.parse(oListItem.GeoLocation);

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
                           oApplication.showHideModule(oApplication.modules.MeetEventModule.id);
                       });
             }

         }

         return EditSpeedMeetView;

     });