'use strict';
define(["data/da-utility", "data/da-layer", "controllers/pool", "controllers/meetevent-list-controller"],
    function (DAUtility, DALayer, PoolContainer, MeetEventListController) {
        function MeetEventController(oApplication) {
            var self = this,
            oDAUtility = new DAUtility(),
            oDALayer = new DALayer,
            oMeetEventModule = oApplication.modules.meetEventModule,
            oSpeedMeetList = oDAUtility.SPLists().SpeedMeet,
            olSpeedMeetFlds = oSpeedMeetList.fields,
            oPoolContainer = new PoolContainer(oApplication),
            CONSTANTS = oApplication.getConstants();
            oDAUtility.getListStruct(oMeetEventModule, oSpeedMeetList);

            function getParticipantsKeys(userKeys) {
                var deferred = $.Deferred(),
                 arrayParticipants = [], defCounter = 0;

                $(userKeys).each(function (index) {
                    var user = oDALayer.getUserByLoginName(this);
                    user.done(function (userInfo) {
                        arrayParticipants.push(userInfo.get_id());
                        defCounter += 1;
                        if (userKeys.length - defCounter == 0) {
                            deferred.resolve(arrayParticipants);
                        }
                    });
                });

                return deferred.promise();
            }

            function createHttpRequestObject() {
                var sItemType = oDAUtility.getItemType(oSpeedMeetList.Name),
                sMethodType = CONSTANTS.DB.HTTP.METHODS.POST,
                oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", oApplication.getSPAppWebUrl(), sItemType);

                return oHttpRequest;
            }

            function setDataInListObject(geoLocation) {
                var fld, listObject = {},
                    oList = oDAUtility.SPLists(oMeetEventModule).SpeedMeet;

                oDAUtility.getListStruct(oMeetEventModule, oList);                  // Set the Id in the List Fields                
                oDAUtility.setValuesToListStruct(oList);                            // Set the values in the List Fields
                for (var fld in olSpeedMeetFlds) {
                    var field = oList.fields[fld];
                    if (field.hasOwnProperty("value")) {
                        listObject[field.spName] = oList.fields[fld].value;
                    }
                }

                listObject[olSpeedMeetFlds.MeetingDates.spName] = oApplication.getAllSelectedDates();
                listObject[olSpeedMeetFlds.GeoLocation.spName] = geoLocation;

                return listObject;
            }

            function createFeedBackData(listObject) {
                var olFeedBack = {}, iCounter = 1, dateKey;
                $.each(listObject.MeetingDates, function (key, date) {
                    dateKey = "Date" + iCounter;
                    olFeedBack[dateKey] = {};
                    olFeedBack[dateKey].start = date.startDate;
                    olFeedBack[dateKey].end = date.endDate;

                    olFeedBack[dateKey].Participants = {};
                    $.each(listObject.Participants1, function (key, participant) {
                        olFeedBack[dateKey].Participants[participant] = 0;
                    });
                    iCounter++;
                });
                return olFeedBack;
            }

            function fixFeedBackData(oldFeedBack, newFeedBack) {
                var oldDate, newDate, participant;

                oldFeedBack = JSON.parse(oldFeedBack);
                for (oldDate in oldFeedBack) {
                    for (newDate in newFeedBack) {
                        if ((oldFeedBack[oldDate].start == newFeedBack[newDate].start) &&
                            (oldFeedBack[oldDate].end == newFeedBack[newDate].end)) {
                            for (participant in newFeedBack[newDate].Participants) {
                                if (oldFeedBack[oldDate].Participants[participant] != null) {
                                    participant;
                                    var value = oldFeedBack[oldDate].Participants[participant];
                                    newFeedBack[newDate].Participants[participant] = oldFeedBack[oldDate].Participants[participant];
                                }
                            }
                        }
                    }
                }

                return newFeedBack;
            }

            function doesLocationChanged(oldLocation, newLocation) {
                oldLocation = JSON.parse(oldLocation);

                if ((oldLocation.latitude != newLocation.latitude) || (oldLocation.longitude != newLocation.longitude))
                    return true;

                return false;
            }

            function getNewUsers(oldUserIds, newUsersIds) {
                var newUsers = [], found;
                $.each(newUsersIds, function (key, value) {
                    found = $.inArray(value, oldUserIds);
                    if (found == -1)
                        newUsers.push(value);
                });

                return newUsers;
            }

            this.UpdateMeetEvent = function (geoLocation) {
                var oMeetEventListController = new MeetEventListController(oApplication),
                    changesRecorder = [], newUsers = [],
                    newFeedBack, foundAuthorId, isNewLocation,
                    itemId = oApplication.ActiveListItem.ID,
                    oDeferred = $.Deferred(),
                    listObject = setDataInListObject(geoLocation);                          // Set the values to the list object

                oMeetEventListController.getListItemByItemId(itemId)                        // Get the latest values of the list item from Sharepoint list.
                                        .done(function (oListItem) {

                                            getParticipantsKeys(oApplication.getParticipants()).done(function (arrayUserKeys) {

                                                foundAuthorId = $.inArray(_spPageContextInfo.userId, arrayUserKeys);
                                                if (foundAuthorId == -1)
                                                    arrayUserKeys.push(_spPageContextInfo.userId);                      // Add the current user in the collection.  

                                                listObject.Participants1 = arrayUserKeys;                               // Set the Particpant array to the list object
                                                newFeedBack = createFeedBackData(listObject);
                                                listObject["Feedback"] = fixFeedBackData(oListItem.Feedback, newFeedBack);      // Set the old calendar dates values

                                                // Push the changes in the array.
                                                newUsers = getNewUsers(oListItem.Participants1Id.results, arrayUserKeys);
                                                isNewLocation = doesLocationChanged(oListItem.GeoLocation, listObject["GeoLocation"]);
                                                changesRecorder.push(newUsers);
                                                changesRecorder.push(isNewLocation);
                                                delete listObject.Participants1;

                                                // Set the new values in the EventMeet Object
                                                listObject["Participants1Id"] = { 'results': arrayUserKeys };
                                                listObject["Feedback"] = JSON.stringify(listObject["Feedback"]);
                                                listObject["MeetingDates"] = JSON.stringify(listObject["MeetingDates"]);
                                                listObject["GeoLocation"] = JSON.stringify(listObject["GeoLocation"]);

                                                oMeetEventListController.
                                                    updateListItemByItemId(itemId, listObject, false)
                                                        .done(function () {
                                                            oDeferred.resolve(changesRecorder);
                                                        });
                                            });
                                        });

                return oDeferred.promise();
            }

            this.CreateMeetEvent = function (geoLocation) {

                var oMeetEventListController = new MeetEventListController(oApplication),
                   updatedObject = {}, users, removedUsers = [], newFeedBack,
                   oDeferred = $.Deferred(),
                   listObject = setDataInListObject(geoLocation);                          // Set the values to the list object

                //Increment 10 to progressbar
                oApplication.incrementProgressBar(10, "Getting participant(s)..");
                users = getParticipantsKeys(oApplication.getParticipants());
                users.done(function (arrayUserKeys) {
                    //Increment 20
                    oApplication.incrementProgressBar(20, "Creating a new SpeedMeet..");
                    olSpeedMeetFlds.Participants1.value = arrayUserKeys;
                    var foundCreatorId = $.inArray(_spPageContextInfo.userId, arrayUserKeys);
                    if (foundCreatorId == -1)
                        arrayUserKeys.push(_spPageContextInfo.userId);                      // Add the current user in the collection.                                                
                    listObject.Participants1 = arrayUserKeys;                               // Set the Particpant array to the list object
                    newFeedBack = createFeedBackData(listObject);
                    listObject["Feedback"] = newFeedBack;
                    delete listObject.Participants1;
                    listObject["Participants1Id"] = { 'results': arrayUserKeys };

                    listObject["Feedback"] = JSON.stringify(listObject["Feedback"]);
                    listObject["MeetingDates"] = JSON.stringify(listObject["MeetingDates"]);
                    listObject["GeoLocation"] = JSON.stringify(listObject["GeoLocation"]);

                    var olistItem = oMeetEventListController.createListitem(listObject, false);
                    olistItem.done(function (listItem) {
                        //Increment 30
                        oApplication.incrementProgressBar(20, "SpeedMeet list item created..");
                        oDeferred.resolve(listItem);
                    });
                });
                return oDeferred.promise();
            }

            this.getEmailObjectsByUsers = function (emailType, olUsers, oListitem, newUsers) {
                var sEmailConstants,
                sBaseUrl = oApplication.updateQueryStringParameter(oApplication.getSPAppBaseUrl(), "smItemId", oListitem.Id),
                oEmail = {},
                arrayEmails = [],
                userId, url, sBody, foundUser,
                description = oListitem.Description1 || "",
                location = JSON.parse(oListitem.GeoLocation);

                switch (emailType) {
                    case "NEWLOCATION":
                        sEmailConstants = CONSTANTS.EMAIL.NewLocation;
                        break;
                    default:
                        sEmailConstants = CONSTANTS.EMAIL.NewMeet;
                        break;
                }
                oEmail.From = sEmailConstants.FROM;
                oEmail.Subject = String.format(sEmailConstants.SUBJECT, oListitem.Title);

                for (userId in olUsers) {
                    if (olUsers[userId].Email) {
                        url = oApplication.updateQueryStringParameter(sBaseUrl, "smUserId", userId);
                        oEmail.To = olUsers[userId].Email;

                        if (newUsers != null) {     // Send invitation to the users invited later in the event.
                            foundUser = $.inArray(userId, newUsers);        // Does new Users collection has the user id.
                            if ((emailType == "NEWLOCATION") && (foundUser == -1)) {        // Send location changed notification to old users.
                                oEmail.Body = String.format(sEmailConstants.BODY_TEXT(), olUsers[userId].DisplayName, oListitem.Title, location.locationName, url);

                                arrayEmails.push(oEmail);
                            }
                            else if (foundUser != -1)
                                arrayEmails.push(oEmail);
                        }
                        else {      // Send invitation to the new users.
                            oEmail.Body = String.format(sEmailConstants.BODY_TEXT(), olUsers[userId].DisplayName, oListitem.Title, description, location.locationName, url);
                            arrayEmails.push(oEmail);
                        }
                    }
                }

                return arrayEmails;
            }

           
        }

        return MeetEventController;
    });