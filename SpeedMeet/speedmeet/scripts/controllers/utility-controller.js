'use strict';
define(["data/da-utility", "data/utility-data", "data/da-layer"], function (DAUtility, UtilityDA, DALayer) {
    function UtilityController(oApplication) {

        var oDAUtility = new DAUtility(oApplication),
            oDALayer = new DALayer,
            isFeedBackChanged = false,
            CONSTANTS = oApplication.getConstants(),
            olFeedBack,
            iItemID,
            CONSTANTS,
            oSpeedMeetList,
            dtTable,


        /* 
         * Get the Participant's internal id and login name  from SharePoint          
         * @return: Javascript Object Literal
        */
        getUserLoginById = function () {
            var sItemType = oDAUtility.getItemType(oSpeedMeetList.Name),
             sMethodType = CONSTANTS.DB.HTTP.METHODS.GET,
             oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", oApplication.getSPAppWebUrl(), sItemType),
             olUserInfo = {},
             oDeferred = $.Deferred(),
             sUrl = oHttpRequest.url,
             participants = olFeedBack.Date1.Participants,
             iTotalCount = $.map(participants, function (n, i) { return i; }).length,
             iCounter = 0;

            $.each(olFeedBack.Date1.Participants, function (i, participant) {
                oHttpRequest.url = sUrl + "GetUserById(" + i + ")"; //GetUserById REST endpoint

                var ajaxRequest = oDALayer.SubmitWebMethod(oHttpRequest);
                ajaxRequest.done(function (userDetails) {
                    var oUser = userDetails.d;
                    olUserInfo[oUser.Id] = {};
                    olUserInfo[i].LoginName = oUser.LoginName;
                    iCounter += 1;

                    //Resolve deferred object when all the user information is fetched.
                    if (iTotalCount == iCounter) {
                        oDeferred.resolve(olUserInfo);
                    }
                });
            });

            return oDeferred.promise();
        },

        /* 
         * Get the Participant's DisplayName,Email, Picture from user Profile service application
        */
        getUsers = function () {
            var oDeferred = $.Deferred(),
                sMethodType = CONSTANTS.DB.HTTP.METHODS.GET,
                oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "USERPROFILE", oApplication.getSPAppWebUrl()),
                olUser,
                users = getUserLoginById(); // Send request to user profile

            users.done(function (olUsers) {
                var iTotalCount = $.map(olUsers, function (n, i) { return i; }).length,
                    sUrl = oHttpRequest.url,
                    iCounter = 0,
                    iProgress = 20 / iTotalCount; // Increment 50


                oApplication.incrementProgressBar(10, "Getting Participant(s) information from SharePoint..");

                $.each(olUsers, function (i, user) {
                    var sUserName = user.LoginName.replace('i:0#.w|', '');
                    oHttpRequest.url = sUrl + "GetPropertiesFor(accountName=@v)?@v='" + encodeURIComponent(sUserName) + "'"; //GetProperpertiesFor REST endpoint.
                    var ajaxRequest = oDALayer.SubmitWebMethod(oHttpRequest);


                    ajaxRequest.done(function (userProfile) {
                        // Increment 50
                        oApplication.incrementProgressBar(iProgress, "Processing Participant(s) information ..");
                        if (userProfile.d.AccountName) {
                            var oUserProfile = userProfile.d;
                            for (olUser in olUsers) {
                                var sAccountName = olUsers[olUser].LoginName.replace('i:0#.w|', '');
                                if (sAccountName.toLowerCase() == oUserProfile.AccountName.toLowerCase()) {
                                    olUsers[olUser].AccountName = oUserProfile.AccountName;
                                    olUsers[olUser].DisplayName = oUserProfile.DisplayName;
                                    olUsers[olUser].Email = oUserProfile.Email;
                                    olUsers[olUser].PictureUrl = oUserProfile.PictureUrl;
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
            var oDeferred = $.Deferred();
            olFeedBack = JSON.parse(oListItem.Feedback);
            iItemID = oListItem.ID;
            oSpeedMeetList = oDAUtility.SPLists().SpeedMeet;

            // Get all the participants
            getUsers().done(function (olUsers) {

                oDeferred.resolve(olUsers);
            });

            return oDeferred.promise();
        }

        this.sendEmails = function (emailObjects) {            
            oDAUtility.sendEmails(emailObjects);
        }

        this.getHeadersInfo = function (oListItem) {

            var resultsCollection = {}, headerSequence = {}, allDates = [],
                dates = {}, date, time, count, headerCounter, firstHdrHtml, startDT, endDT,
                secondHdrHtml, listItemHtml, startTime, endTime, dataAttrHtml,

                feedBackObject = JSON.parse(oListItem.Feedback);        // get the feedback from the Item object

            // listItemHtml = "data-ItemId='" + oListItem.ID + "'";

            $.each(feedBackObject, function (index, dateTimeObject) {       // interate on each date and create a new object literal.
                var dateStart = moment(dateTimeObject.start).format("MMMM Do YYYY");
                var i, isFound = false;
                for (date in dates) {
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
                    dates[dateStart] = {};
                    dates[dateStart]["time1"] = {};

                    dates[dateStart]["time1"]["start"] = moment(startTime).format("h:mm a");
                    dates[dateStart]["time1"]["startDT"] = dateTimeObject.start;
                    dates[dateStart]["time1"]["end"] = moment(endTime).format("h:mm a");
                    dates[dateStart]["time1"]["endDT"] = dateTimeObject.end;
                }
                else {
                    count = $.map(dates[dateStart], function (n, i) { return i; }).length;
                    count++;
                    dates[dateStart]["time" + count] = {};
                    dates[dateStart]["time" + count]["start"] = moment(startTime).format("h:mm a");
                    dates[dateStart]["time" + count]["startDT"] = dateTimeObject.start;
                    dates[dateStart]["time" + count]["end"] = moment(endTime).format("h:mm a");
                    dates[dateStart]["time" + count]["endDT"] = dateTimeObject.end;
                    isFound = false;
                }

            });

            startTime = null;
            endTime = null;
            firstHdrHtml = "<thead>", secondHdrHtml = "<tr>";
            firstHdrHtml += "<tr> <th rowspan='2'>Participant(s)</th>";
            headerCounter = 1;

            $.each(dates, function (date, AllTimes) {
                count = $.map(dates[date], function (n, i) { return i; }).length;
                firstHdrHtml += "<th colspan='" + count + "'>" + date + "</th>";

                for (time in AllTimes) {
                    startTime = AllTimes[time]["start"];
                    endTime = AllTimes[time]["end"];
                    startDT = AllTimes[time]["startDT"];
                    endDT = AllTimes[time]["endDT"];

                    headerSequence["time" + headerCounter] = {};
                    headerSequence["time" + headerCounter]["startDT"] = startDT;
                    headerSequence["time" + headerCounter]["endDT"] = endDT;
                    dataAttrHtml = "data-HdrDate='" + date + "' data-HdrStartTime='" + startTime + "' data-HdrEndTime='" + endTime + "'";
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