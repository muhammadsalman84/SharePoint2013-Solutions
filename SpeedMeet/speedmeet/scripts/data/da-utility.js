'use strict';

define(function () {
    function DAUtility() {

        this.SPLists = function (olModule) {
            var olSPLists = {
                SpeedMeet: {
                    Name: "SpeedMeetList",
                    Title: "SpeedMeetList",
                    fields: {
                        Title: {
                            id: "",
                            spName: "Title",
                            title: "Event Name",
                            value: ""
                        },
                        Location1: {
                            id: "",
                            spName: "Location1",
                            title: "Location",
                            value: ""
                        },
                        Description1: {
                            id: "",
                            spName: "Description1",
                            title: "Description",
                            value: ""
                        },
                        Participants1: {
                            spName: "Participants1",
                            title: "Participants"
                        },
                        GeoLocation: {
                            spName: "GeoLocation",
                            title: "Location"
                        },
                        MeetingDates: {
                            spName: "MeetingDates",
                            title: "Proposed Meeting Date(s)"
                        },
                        Feedback: {
                            spName: "Feedback",
                        }
                    }
                }
            }

            return olSPLists;

        }
    }

    DAUtility.prototype = {
        getHttpRequest: function (sMethod, sAccessPoint, webUrl, spObjectType) {
            var sHttpRequest = {
                url: "",
                type: sMethod,
                contentType: "application/json; odata=verbose",
                headers: {}
            }

            //isCrossSite ? sHttpRequest.url = "{0}/_api/sp.appcontextsite(@target)/web/" : sHttpRequest.url = "{0}/_api/web/";
            switch (sAccessPoint) {
                case "CROSSSITE":
                    sHttpRequest.url = "{0}/_api/sp.appcontextsite(@target)/web/";
                    break;
                case "USERPROFILE":
                    sHttpRequest.url = "{0}/_api/SP.UserProfiles.PeopleManager/";
                    break;
                case "EMAIL":
                    sHttpRequest.url = "{0}/_api/SP.Utilities.Utility.SendEmail";                    
                    break;
                default:
                    sHttpRequest.url = "{0}/_api/web/";
                    break;
            }

            sHttpRequest.url = String.format(sHttpRequest.url, webUrl);
            switch (sMethod) {
                case "GET":
                    sHttpRequest.headers = { "accept": "application/json; odata=verbose" };
                    break;
                case "POST":
                    sHttpRequest.headers = {
                        "accept": "application/json; odata=verbose",
                        "contentType": "application/json; odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()                        
                    };
                    sHttpRequest.data = { '__metadata': { 'type': spObjectType } };
                    break;
                case "PATCH":
                    sHttpRequest.headers = {
                        "accept": "application/json; odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "IF-MATCH": "*",
                        "X-Http-Method": "PATCH"
                    }
                    sHttpRequest.type = "POST";
                    break;
                default:
                    break;
            }

            return sHttpRequest;

        },
        getItemType: function GetItemTypeForListName(sListName) {
            return "SP.Data." + sListName.charAt(0).toUpperCase() + sListName.slice(1) + "ListItem";
        },
        getListStruct: function (olModule, olList) {
            var listStruct = olList,
                moduleId;
            olModule.subModules ? moduleId = olModule.subModules.id : moduleId = olModule.id;

            for (var i = 0; i < moduleId.length; i++) {
                for (var field in listStruct.fields) {
                    var htmlField = $(moduleId[i]).find("*[data-spfield='" + field + "']");
                    if (htmlField.length > 0) {
                        listStruct.fields[field].id = "#" + $(htmlField).prop('id');
                    }

                }
            }
            return listStruct;
        },
        setValuesToListStruct: function (listStruct) {
            for (var field in listStruct.fields) {
                if (listStruct.fields[field].hasOwnProperty("value")) {
                    listStruct.fields[field].value = $(listStruct.fields[field].id).val();
                }
            }
            return listStruct;
        }
    }

    return DAUtility;
});