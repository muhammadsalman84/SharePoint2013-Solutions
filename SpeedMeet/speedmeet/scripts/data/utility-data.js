'use strict';

define(["data/da-utility"],
    function (DAUtility) {
        function UtilityData() {
        }

        UtilityData.prototype.sendEmails = function (emailObjects) {
            var oDAUtility = new DAUtility(),
                CONSTANTS = oApplication.getConstants(),
                sMethodType = CONSTANTS.DB.HTTP.METHODS.POST,
                oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "EMAIL", oApplication.getSPAppWebUrl(), "SP.Utilities.EmailProperties"),
                oDeferred = $.Deferred(),
                email, iCounter = 0;

            for (email in emailObjects) {
                oHttpRequest.data = JSON.stringify({
                    'properties': {
                        '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
                        'From': emailObjects[email].From,
                        'To': { 'results': [emailObjects[email].To] },
                        'Subject': emailObjects[email].Subject,
                        'Body': emailObjects[email].Body
                    }
                });
                oDALayer.SubmitWebMethod(oHttpRequest).done(function () {
                    iCounter += 1;
                    if (iCounter == emailObjects.length)
                        oDeferred.resolve();
                });
            }
            return oDeferred.promise();
        }
        return UtilityData;
    });