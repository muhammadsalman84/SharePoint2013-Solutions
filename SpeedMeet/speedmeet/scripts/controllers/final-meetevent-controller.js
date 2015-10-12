'use strict';
define(["data/da-layer"], function (DALayer) {
    function FinalSpeedMeetController(oApplication) {
        var self = this;
        self.oApplication = oApplication;
    }

    FinalSpeedMeetController.prototype.getEmailObjects = function (UserObjects, oListitem) {

        var CONSTANTS = this.oApplication.getConstants(),
            baseUrl = this.oApplication.updateQueryStringParameter(this.oApplication.getSPAppBaseUrl(), "smItemId", oListitem.Id),
            emailConstants,
            oEmail = {},
            arrayEmails = [],
            userId, url, finalDateObject, date,
            description = oListitem.Description1 || "",
            location = JSON.parse(oListitem.GeoLocation),
            emailTemplate = CONSTANTS.EMAIL.FinalizeEvent;

        oEmail.From = emailTemplate.FROM;
        oEmail.Subject = emailTemplate.SUBJECT;

        for (userId in UserObjects) {
            if (UserObjects[userId].Email) {
                url = this.oApplication.updateQueryStringParameter(baseUrl, "smUserId", userId);
                finalDateObject = JSON.parse(oListitem.FinalEventDate);
                date = finalDateObject.FinalDate + " (" + finalDateObject.FinalStartTime + " - "+finalDateObject.FinalStartTime + ")";
                oEmail.To = UserObjects[userId].Email;
                oEmail.Body = String.format(emailTemplate.BODY_TEXT(), UserObjects[userId].DisplayName, oListitem.Title, oListitem.Title, description, location.locationName, date, url);
                arrayEmails.push(oEmail);
            }
        }

        return arrayEmails;
    }

    return FinalSpeedMeetController;
});