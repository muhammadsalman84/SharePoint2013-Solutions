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
            /*
            function getFeedBack() {
                var olFeedBack = {}, iCounter = 1;
                $.each(olSpeedMeetFlds.MeetingDates.value, function (key, date) {
                    var sDateKey = "Date" + iCounter;
                    olFeedBack[sDateKey] = {};
                    olFeedBack[sDateKey].start = date.startDate;
                    olFeedBack[sDateKey].end = date.endDate;

                    olFeedBack[sDateKey].Participants = {};
                    $.each(olSpeedMeetFlds.Participants1.value, function (key, participant) {
                        olFeedBack[sDateKey].Participants[participant] = 0;
                    });
                    iCounter++;
                });
                return olFeedBack;
            }

            function setValuesToListObject(oHttpRequest, geoLocation) {
                var fld,
                    oNewSpeedMeetList = oDAUtility.SPLists(oMeetEventModule).SpeedMeet;
                // Set the Id in the SppedMeetList Fields
                oDAUtility.getListStruct(oMeetEventModule, oNewSpeedMeetList);
                // Set the value in the SppedMeetList Fields
                oDAUtility.setValuesToListStruct(oNewSpeedMeetList);
                for (var fld in olSpeedMeetFlds) {
                    var field = oNewSpeedMeetList.fields[fld];
                    if (field.hasOwnProperty("value")) {
                        oHttpRequest.data[field.spName] = oNewSpeedMeetList.fields[fld].value;
                    }
                }
                var olMeetingDates = oApplication.getAllSelectedDates(),
                    olGeoLocation = geoLocation;

                olSpeedMeetFlds.MeetingDates.value = olMeetingDates;
                olSpeedMeetFlds.GeoLocation.value = olGeoLocation;

                oHttpRequest.data[olSpeedMeetFlds.MeetingDates.spName] = JSON.stringify(olMeetingDates);
                oHttpRequest.data[olSpeedMeetFlds.GeoLocation.spName] = JSON.stringify(olGeoLocation);

                return oNewSpeedMeetList;
            }

            this.GeneratePool = function GeneratePool(listItem) {
                var oDeferred = $.Deferred();
                oPoolContainer.generatePool(listItem).done(function () {
                    setTimeout(function () {
                        oDeferred.resolve();
                    }, 2000);
                });

                return oDeferred.promise();
            }

            /*this.CreateMeetEvent = function (geoLocation) {

                var sItemType = oDAUtility.getItemType(oSpeedMeetList.Name),
                sMethodType = CONSTANTS.DB.HTTP.METHODS.POST,
                oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", oApplication.getSPAppWebUrl(), sItemType),
                oNewSpeedMeetList = setValuesToListObject(oHttpRequest, geoLocation),
                oDeferred = $.Deferred(),
                users, olFeedBack;
                //Incremnt 10 to progressbar
                oApplication.incrementProgressBar(10, "Getting participant(s)..");
                oHttpRequest.url += "lists/getbytitle('" + oNewSpeedMeetList.Title + "')/items";
                // get all the participants details
                users = getParticipantsKeys(oApplication.getParticipants());
                users.done(function (arrayUserKeys) {
                    //Increemnt 20
                    oApplication.incrementProgressBar(20, "Creating a new SpeedMeet..");
                    olSpeedMeetFlds.Participants1.value = arrayUserKeys;
                    // Add the Default (loggedin: creator/Author) user id to the array.
                    arrayUserKeys.push(_spPageContextInfo.userId);
                    olFeedBack = getFeedBack();
                    olSpeedMeetFlds.Feedback.value = olFeedBack;
                    // Set the FeedBack and Participants fields value
                    oHttpRequest.data[oNewSpeedMeetList.fields.Feedback.spName] = JSON.stringify(olFeedBack);
                    oHttpRequest.data[oNewSpeedMeetList.fields.Participants1.spName + "Id"] = { 'results': arrayUserKeys };
                    oHttpRequest.data = JSON.stringify(oHttpRequest.data);
                    var olistItem = oDALayer.SubmitWebMethod(oHttpRequest);
                    olistItem.done(function (listItem) {
                        //Increment 30
                        oApplication.incrementProgressBar(10, "SpeedMeet list item created..");
                        oDeferred.resolve(listItem.d);
                    });
                });
                return oDeferred.promise();
            }*/

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
                    //Increemnt 20
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
                        oApplication.incrementProgressBar(10, "SpeedMeet list item created..");
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