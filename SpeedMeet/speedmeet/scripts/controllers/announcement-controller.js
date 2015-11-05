'use strict';
define(["data/da-utility", "data/da-layer"],
    function (DAUtility, DALayer) {
        function AnnouncementController(oApplication) {
            var self = this;
            self.oApplication = oApplication;

            this.getMyAnnouncements = function () {

                var oDAUtility = new DAUtility(),
                    oDALayer = new DALayer(),
                    sMethodType = this.oApplication.getConstants().DB.HTTP.METHODS.GET,
                    oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", this.oApplication.getSPAppWebUrl()),
                    oSpeedMeetList = oDAUtility.SPLists().SpeedMeet,
                    olMeetItems, listHtml = "",
                    arrayAnnoucements = [], announcementValue, oAnnouncement, announcementCounter = 0,
                    oDeferred = $.Deferred();

                //oHttpRequest.url += "lists/getbytitle('" + oSpeedMeetList.Title + "')/items?$select=ID,Title,Created,Status,Participants1/Id,Author/ID,Author/Title&$expand=Participants1/Id,Author/ID,Author/Title&$filter=Participants1/Id eq " + oApplication.CurrentUserId + " and Author/ID ne " + _spPageContextInfo.userId + " &$orderby=Created desc";
                oHttpRequest.url += "lists/getbytitle('" + oSpeedMeetList.Title + "')/items?$select=ID,Title,Created,Status,ParticipantsInfo,Participants1/Id,Author/ID,Author/Title&$expand=Participants1/Id,Author/ID,Author/Title&$filter=Participants1/Id eq " + oApplication.CurrentUserId + " &$orderby=Created desc";
                oDALayer.SubmitWebMethod(oHttpRequest).done(function (oListItems) {
                    if (oListItems.d.results) {
                        olMeetItems = oListItems.d.results;

                        $.each(olMeetItems, function (index, meetItem) {
                            oAnnouncement = JSON.parse(meetItem["ParticipantsInfo"]);
                            announcementValue = oAnnouncement[oApplication.CurrentUserId]["announcement"];
                            if (announcementValue == 0) {
                                var itemHtml = "<li><a href='#' id='announcement-'" + meetItem.ID + "' data-eventId='" + meetItem.ID + "'>";
                                itemHtml += meetItem.Title;
                                itemHtml += "</a></li><li class='divider'></li>";

                                listHtml += itemHtml;
                                announcementCounter += 1;
                            }
                        });

                        arrayAnnoucements.push(announcementCounter);
                        arrayAnnoucements.push(listHtml);
                        oDeferred.resolve(arrayAnnoucements);
                    }
                });

                return oDeferred.promise();
            }

        }
        return AnnouncementController;
    });