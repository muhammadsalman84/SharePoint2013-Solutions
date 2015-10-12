'use strict';

define(["data/da-utility", "data/da-layer"], function (DAUtility, DALayer) {
    function DAMeetEventList(oApplication) {
        var self = this;
        self.oApplication = oApplication;
    }

    DAMeetEventList.prototype.createListitem = function (fieldsCollection, doJsonStringify) {
        var field,
            oDeferred = $.Deferred(),
            oDAUtility = new DAUtility(),
            oDALayer = new DALayer,
            CONSTANTS = this.oApplication.getConstants(),
            sMethodType = CONSTANTS.DB.HTTP.METHODS.POST,
            oList = oDAUtility.SPLists().SpeedMeet,
            sItemType = oDAUtility.getItemType(oList.Name),
            oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", this.oApplication.getSPAppWebUrl(), sItemType);

        oHttpRequest.url += "lists/getbytitle('" + oList.Title + "')/items";
        if (doJsonStringify) {
            for (field in fieldsCollection) {
                oHttpRequest.data[field] = JSON.stringify(fieldsCollection[field]);
            }
        }
        else {
            for (field in fieldsCollection) {
                oHttpRequest.data[field] = fieldsCollection[field];
            }
        }

        oHttpRequest.data = JSON.stringify(oHttpRequest.data);
        oDALayer.SubmitWebMethod(oHttpRequest).done(function (listItem) {
            oDeferred.resolve(listItem.d);
        });

        return oDeferred.promise();
    }

    DAMeetEventList.prototype.updateListItemByItemId = function (itemId, fieldsCollection, doJsonStringify) {

        var oDeferred = $.Deferred(),
            oDALayer = new DALayer,
            oDAUtility = new DAUtility(),
            CONSTANTS = this.oApplication.getConstants(),
            methodType = CONSTANTS.DB.HTTP.METHODS.PATCH,
            oHttpRequest, dataObject = {}, field, oSpeedMeetList, itemType;

        oSpeedMeetList = oDAUtility.SPLists().SpeedMeet;
        itemType = oDAUtility.getItemType(oSpeedMeetList.Name);
        oHttpRequest = oDAUtility.getHttpRequest();
        oHttpRequest = oDAUtility.getHttpRequest(methodType, "default", this.oApplication.getSPAppWebUrl(), itemType);
        
        oHttpRequest.url += "lists/GetByTitle('" + oSpeedMeetList.Title + "')/getItemByStringId('" + itemId + "')";

        dataObject['__metadata'] = {};
        dataObject['__metadata']['type'] = itemType;

        if (doJsonStringify) {
            for (field in fieldsCollection) {
                dataObject[field] = JSON.stringify(fieldsCollection[field]);
            }
        }
        else {
            for (field in fieldsCollection) {
                dataObject[field] = fieldsCollection[field];
            }
        }


        oHttpRequest.data = JSON.stringify(dataObject);
        oDALayer.SubmitWebMethod(oHttpRequest).done(function () {
            oDeferred.resolve();
        });

        return oDeferred.promise();
    };

    DAMeetEventList.prototype.getListItemByItemId = function (itemId, doGetDetail) {
        var itemType,
            oDeferred = $.Deferred(),
            oDALayer = new DALayer,
            oDAUtility = new DAUtility(),
            CONSTANTS = this.oApplication.getConstants(),
            methodType, oHttpRequest,
            oSpeedMeetList = oDAUtility.SPLists().SpeedMeet;

        // Get the recent value of feedback from Sharepoint List.
        itemType = oDAUtility.getItemType(oSpeedMeetList.Name),
        methodType = CONSTANTS.DB.HTTP.METHODS.GET,
        oHttpRequest = oDAUtility.getHttpRequest(methodType, "default", this.oApplication.getSPAppWebUrl(), itemType);
        oHttpRequest.url += "lists/GetByTitle('" + oSpeedMeetList.Title + "')/items(" + itemId + ")";
        if (doGetDetail == true)
            oHttpRequest.url += "?$select=Participants1/Title,Participants1/Name,*&$expand=Participants1/Id";

        oDALayer.SubmitWebMethod(oHttpRequest).done(function (oListItem) {
            if (oListItem.d) {
                oDeferred.resolve(oListItem.d);
            }
        });

        return oDeferred.promise();
    }

    return DAMeetEventList;
});