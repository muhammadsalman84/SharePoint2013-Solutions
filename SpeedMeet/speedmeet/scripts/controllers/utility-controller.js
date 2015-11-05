'use strict';
define(["data/da-utility", "data/da-layer", "data/data-meetevent-list"],
    function (DAUtility, DALayer, DAMeetList) {
        function UtilityController(oApplication, presenceSettings) {

            var self = this,
                oDAUtility = new DAUtility(oApplication),
                oDALayer = new DALayer,
                isFeedBackChanged = false,
                CONSTANTS = oApplication.getConstants(),
                olFeedBack,
                iItemID,
                CONSTANTS,
                dtTable;

            this.presenceSettings = presenceSettings;

            /* 
             * Get the Participant's internal id and login name  from SharePoint          
             * @return: Javascript Object Literal
            */
            this.getUserLoginById = function (allUsers) {
                var oSpeedMeetList = oDAUtility.SPLists().SpeedMeet,
                    sItemType = oDAUtility.getItemType(oSpeedMeetList.Name),
                    sMethodType = CONSTANTS.DB.HTTP.METHODS.GET,
                    oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", oApplication.getSPAppWebUrl(), sItemType),
                    olUserInfo = {},
                    oDeferred = $.Deferred(),
                    sUrl = oHttpRequest.url,
                    participants = allUsers,
                    iTotalCount = $.map(participants, function (n, i) { return i; }).length,
                    iCounter = 0;

                $.each(allUsers, function (i, participant) {
                    oHttpRequest.url = sUrl + "GetUserById(" + participant + ")"; //GetUserById REST endpoint

                    var ajaxRequest = oDALayer.SubmitWebMethod(oHttpRequest);
                    ajaxRequest.done(function (userDetails) {
                        var oUser = userDetails.d;
                        olUserInfo[oUser.Id] = {};
                        olUserInfo[participant].LoginName = oUser.LoginName;
                        iCounter += 1;

                        //Resolve deferred object when all the user information is fetched.
                        if (iTotalCount == iCounter) {
                            oDeferred.resolve(olUserInfo);
                        }
                    });
                });

                return oDeferred.promise();
            }

            /* 
             * Get the Participant's DisplayName,Email, Picture from user Profile service application
            */
            this.getUsers = function (allUsers) {
                var oDeferred = $.Deferred(),
                    sMethodType = CONSTANTS.DB.HTTP.METHODS.GET,
                    oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "USERPROFILE", oApplication.getSPAppWebUrl()),
                    olUser,
                    users = this.getUserLoginById(allUsers); // Send request to user profile              

                users.done(function (olUsers) {
                    var iTotalCount = $.map(olUsers, function (n, i) { return i; }).length,
                        sUrl = oHttpRequest.url,
                        iCounter = 0;

                    $.each(olUsers, function (i, user) {
                        var sUserName = user.LoginName.replace('i:0#.w|', '');
                        oHttpRequest.url = sUrl + "GetPropertiesFor(accountName=@v)?@v='" + encodeURIComponent(sUserName) + "'"; //GetProperpertiesFor REST endpoint.
                        var ajaxRequest = oDALayer.SubmitWebMethod(oHttpRequest);

                        ajaxRequest.done(function (userProfile) {

                            if (userProfile.d.AccountName) {
                                var oUserProfile = userProfile.d;
                                for (olUser in olUsers) {
                                    var sAccountName = olUsers[olUser].LoginName.replace('i:0#.w|', '');
                                    if (sAccountName.toLowerCase() == oUserProfile.AccountName.toLowerCase()) {
                                        olUsers[olUser].AccountName = oUserProfile.AccountName;
                                        olUsers[olUser].DisplayName = oUserProfile.DisplayName;
                                        olUsers[olUser].Email = oUserProfile.Email;
                                        olUsers[olUser].PictureUrl = oUserProfile.PictureUrl;
                                        olUsers[olUser].PicturePresence = self.getPresence(sAccountName, oUserProfile);
                                        break;
                                    }
                                }
                            }
                            iCounter++;
                            if (iTotalCount == iCounter) {
                                oDeferred.resolve(olUsers);
                            }
                        });
                    });
                });

                return oDeferred.promise();
            };

            /* 
            * generate the Pool in a tabular format
            */
            this.getUsersInfo = function (oListItem) {
                var oDeferred = $.Deferred(),
                    oSpeedMeetList = oDAUtility.SPLists().SpeedMeet,
                    participants = [];

                olFeedBack = JSON.parse(oListItem.Feedback);
                iItemID = oListItem.ID;

                $.each(olFeedBack.Date1.Participants, function (participant, value) {
                    participants.push(participant);
                });

                // Get all the participants details
                this.getUsers(participants).done(function (olUsers) {

                    oDeferred.resolve(olUsers);
                });

                return oDeferred.promise();
            }

            this.sendEmails = function (emailObjects) {
                var oDeferred = $.Deferred();
                oDAUtility.sendEmails(emailObjects).done(function () {
                    oDeferred.resolve();
                });

                return oDeferred.promise();
            }

            this.getHeadersInfo = function (oListItem) {

                var resultsCollection = {}, headerSequence = {}, allDates = [],
                    oDates = {}, date, time, count, headerCounter, firstHdrHtml, startDT, endDT,
                    secondHdrHtml, listItemHtml, startTime, endTime, dataAttrHtml,

                    feedBackObject = JSON.parse(oListItem.Feedback);        // get the feedback from the Item object

                // listItemHtml = "data-ItemId='" + oListItem.ID + "'";

                $.each(feedBackObject, function (index, dateTimeObject) {       // interate on each date and create a new object literal.
                    var dateStart = moment(dateTimeObject.start).format("MMMM Do YYYY");
                    var i, isFound = false;
                    for (date in oDates) {
                        if (date === dateStart) {
                            isFound = true;
                            break;
                        }
                    }

                    startTime = new Date(dateTimeObject.start);
                    startTime = new Date(startTime.getTime() + (startTime.getTimezoneOffset() * 60000));

                    endTime = new Date(dateTimeObject.end);
                    endTime = new Date(endTime.getTime() + (endTime.getTimezoneOffset() * 60000));

                    if (isFound == false) {
                        oDates[dateStart] = {};
                        oDates[dateStart]["time1"] = {};

                        oDates[dateStart]["time1"]["start"] = moment(startTime).format("h:mm a");
                        oDates[dateStart]["time1"]["startDT"] = dateTimeObject.start;
                        oDates[dateStart]["time1"]["end"] = moment(endTime).format("h:mm a");
                        oDates[dateStart]["time1"]["endDT"] = dateTimeObject.end;
                    }
                    else {
                        count = $.map(oDates[dateStart], function (n, i) { return i; }).length;
                        count++;
                        oDates[dateStart]["time" + count] = {};
                        oDates[dateStart]["time" + count]["start"] = moment(startTime).format("h:mm a");
                        oDates[dateStart]["time" + count]["startDT"] = dateTimeObject.start;
                        oDates[dateStart]["time" + count]["end"] = moment(endTime).format("h:mm a");
                        oDates[dateStart]["time" + count]["endDT"] = dateTimeObject.end;
                        isFound = false;
                    }

                });

                startTime = null;
                endTime = null;
                firstHdrHtml = "<thead>", secondHdrHtml = "<tr>";
                firstHdrHtml += "<tr> <th rowspan='2'>Participant(s)</th>";
                headerCounter = 1;

                var allDatesTitle = [], allTimes, dateTitle;
                $.each(oDates, function (date, AllTimes) {
                    allDatesTitle.push(date);
                });
                allDatesTitle.sort();

                $.each(allDatesTitle, function (date, AllTimes) {
                    dateTitle = allDatesTitle[date];
                    count = $.map(oDates[dateTitle], function (n, i) { return i; }).length;
                    firstHdrHtml += "<th colspan='" + count + "'>" + dateTitle + "</th>";

                    allTimes = oDates[dateTitle];
                    for (time in allTimes) {
                        startTime = allTimes[time]["start"];
                        endTime = allTimes[time]["end"];
                        startDT = allTimes[time]["startDT"];
                        endDT = allTimes[time]["endDT"];

                        headerSequence["time" + headerCounter] = {};
                        headerSequence["time" + headerCounter]["startDT"] = startDT;
                        headerSequence["time" + headerCounter]["endDT"] = endDT;
                        dataAttrHtml = "data-HdrDate='" + dateTitle + "' data-HdrStartTime='" + startTime + "' data-HdrEndTime='" + endTime + "'";
                        dataAttrHtml += "data-HdrStartDT='" + startDT + "' data-HdrEndDT='" + endDT + "'";
                        //dataAttrHtml += listItemHtml;
                        secondHdrHtml += "<th " + dataAttrHtml + ">" + startTime + " - " + endTime + "</th>";

                        headerCounter++;
                    }
                });

                firstHdrHtml += "</tr>" + secondHdrHtml + "</tr>" + "</thead>";

                resultsCollection["headrHtml"] = firstHdrHtml;
                resultsCollection["headrSequence"] = headerSequence;
                return resultsCollection;
            }

            this.getItemStatus = function (itemId) {
                var oDAMeetList = new DAMeetList(oApplication),
                    itemStatus,
                    oDeferred = $.Deferred();

                oDAMeetList.getListItemByItemId(itemId)
                              .done(function (oListItem) {
                                  if (oListItem) {
                                      try {
                                          itemStatus = $.parseJSON(oListItem.Status);
                                      } catch (e) {
                                          itemStatus = oListItem.Status;   // Not a JSON value
                                      }

                                      oDeferred.resolve(itemStatus);
                                  }
                              })
                             .fail(function (error) {
                                 oDeferred.resolve(error);
                             });

                return oDeferred.promise();
            }

            this.getLoginUserId = function () {
                var oDeferred = $.Deferred(),
                    loginName,
                    getCurrentUser = oDALayer.getCurrentUser();

                getCurrentUser.done(function (oUser) {
                    loginName = oUser.get_loginName();
                    loginName = loginName.replace("i:0#.w|", "");
                    var user = oDALayer.getUserByLoginName(loginName);
                    user.done(function (userInfo) {
                        oDeferred.resolve(userInfo.get_id());
                    });
                });

                return oDeferred.promise();
            }

            this.updateParticipantInfo = function (announcementValue, oListItem) {
                var oDAMeetList = new DAMeetList(oApplication),
                 particicipantsInfo = JSON.parse(oListItem["ParticipantsInfo"]),
                 userId = oApplication.CurrentUserId;

                // Update the Annocuncement Value for the current user against the item
                particicipantsInfo[userId]["announcement"] = announcementValue;

                var fieldsObject = {};
                fieldsObject["ParticipantsInfo"] = particicipantsInfo;

                oDAMeetList.updateListItemByItemId(oListItem.ID, fieldsObject, true).done(function () {                    
                });
            }

            this.getPresence = function (accountName, data) {
                RegisterSod("Strings.js", "/_layouts/15/Strings.js");
                var options;
                if (this.presenceSettings)
                    options = this.presenceSettings;
                else
                    options = { type: "withpicture", redirectToProfile: true }


                var settings = $.extend({
                    type: "default",
                    redirectToProfile: true
                }, options);

                var name, sip, personalUrl, pictureUrl, title, department = "" | "";
                personalUrl = "#";


                /*var url = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@accountName)?@accountName='" + encodeURIComponent(accountName) + "'";
                var data = oDALayer.SubmitWebMethodSynchronise(url);*/
                name = data.DisplayName;
                if (data.Title)
                    title = data.Title;
                else
                    title = "";

                try {
                    sip = $.grep(data.UserProfileProperties.results, function (e) { return e.Key == "SPS-SipAddress"; })[0].Value;
                }
                catch (e) {
                    sip = data.Email;
                }
                if (settings.redirectToProfile) {
                    personalUrl = data.PersonalUrl;
                }
                if (settings.type == "withpicture") {
                    try {
                        department = $.grep(data.UserProfileProperties.results, function (e) { return e.Key == "Department"; })[0].Value;
                    }
                    catch (e) {
                        department = '';
                    }
                }


                pictureUrl = _spPageContextInfo.webAbsoluteUrl + "/_layouts/15/userphoto.aspx?accountname=" + accountName;
                var uniqueID = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                var html = '';
                if (settings.type == "default") {
                    html = "<span class='ms-imnSpan'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' target='_blank' href='" + personalUrl + "' class='ms-imnlink ms-spimn-presenceLink' ><span class='ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10'><img name='imnmark' title='' ShowOfflinePawn='1' class='ms-spimn-img ms-spimn-presence-offline-10x10x32' src='/_layouts/15/images/spimn.png?rev=23' alt='User Presence' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span>" + name + "</a></span>"
                }
                else if (settings.type == "withpicturesmall") {
                    pictureUrl += "&size=S";
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-5x36'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-5x36x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 36px; height: 36px;'><img class='userIMG' style='width: 36px; height: 36px; clip: rect(0px, 36px, 36px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span><div class='ms-tableCell ms-verticalAlignTop' style='padding-left: 10px;'><span><a href='" + personalUrl + "'>" + name + "</a></span><span style='font-size: 0.9em; display: block;'>" + title + "</span></div>";
                }
                else if (settings.type == "withpicture") {
                    html = "<span class='ms-imnSpan ms-tableCell'><a href='#' onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-8x72'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-8x72x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 72px; height: 72px;'><img class='userIMG' style='width: 72px; height: 72px; clip: rect(0px, 72px, 72px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span><div class='ms-tableCell ms-verticalAlignTop' style='padding-left: 10px;'><span><a href='" + personalUrl + "' target='_blank'>" + name + "</a></span><span style='font-size: 0.9em; display: block;'>" + title + "</span><span style='font-size: 0.9em; display: block;'>" + department + "</span></div>";
                }
                else if (settings.type == "pictureonlysmall") {
                    pictureUrl += "&size=S";
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-5x36'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-5x36x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 36px; height: 36px;'><img class='userIMG' style='width: 36px; height: 36px; clip: rect(0px, 36px, 36px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span>";
                }
                else if (settings.type == "pictureonly") {
                    html = "<span class='ms-imnSpan ms-tableCell'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()' style='padding: 0px;'><div class='ms-tableCell'><span class='ms-imnlink ms-spimn-presenceLink'><span class='ms-spimn-presenceWrapper ms-spimn-imgSize-8x72'><img name='imnmark' title='' showofflinepawn='1' class='ms-spimn-img ms-spimn-presence-offline-8x72x32' src='/_layouts/15/images/spimn.png' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></span></div><div class='ms-tableCell ms-verticalAlignTop'><div class='ms-peopleux-userImgDiv'><span><img title='' showofflinepawn='1' class='ms-hide' src='/_layouts/15/images/spimn.png' alt='Offline' sip='" + sip + "' /><span class='ms-peopleux-imgUserLink'><span class='ms-peopleux-userImgWrapper' style='width: 72px; height: 72px;'><img class='userIMG' style='width: 72px; height: 72px; clip: rect(0px, 72px, 72px, 0px);' src='" + pictureUrl + "' alt='" + name + "' /></span></span></span></div></div></a></span>";
                }
                else if (settings.type == "presenceonly") {
                    html = "<span class='ms-imnSpan'><a onmouseover='IMNShowOOUI();' onmouseout='IMNHideOOUI()'  href='" + personalUrl + "' class='ms-imnlink ms-spimn-presenceLink' ><span class='ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10'><img name='imnmark' title='' ShowOfflinePawn='1' class='ms-spimn-img ms-spimn-presence-offline-10x10x32' src='/_layouts/15/images/spimn.png?rev=23' alt='User Presence' sip='" + sip + "' id='imn_" + uniqueID + ",type=sip' /></span></a></span>"
                }

                return html;
            };

            this.showAdminView = function (authorId, htmlElement) {
                if (authorId == _spPageContextInfo.userId) {
                    $(".adminFunctions").removeClass("hide");
                }
                else {
                    $(".adminFunctions").addClass("hide");
                }
            }

        }

        return UtilityController;
    });