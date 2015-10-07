﻿'use strict';

define([], function () {
    function SpeedMeetUtility() {
        var self = this,
            sSPAppWebUrl, sSPHostWebUrl,
            sSPAppBaseUrl;

        self.getQueryStringParameters = function (qsPara) {
            var paramArray = document.URL.split("?")[1].split("&");

            for (var i = 0; i < paramArray.length; i++) {
                var paraName = paramArray[i].split("=");
                if (paraName[0] === qsPara) {
                    return paraName[1];
                }
            }
        }

        self.updateQueryStringParameter = function (uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            }
            else {
                return uri + separator + key + "=" + value;
            }
        }

        self.getSPAppWebUrl = function () {
            if (!sSPAppWebUrl)
                sSPAppWebUrl = decodeURIComponent(this.getQueryStringParameters("SPAppWebUrl"));
            return sSPAppWebUrl;
        }

        self.getSPHostWebUrl = function () {
            if (!sSPHostWebUrl)
                sSPHostWebUrl = decodeURIComponent(this.getQueryStringParameters("SPHostUrl"));

            return sSPHostWebUrl;
        }

        self.getSPAppBaseUrl = function () {
            if (!sSPAppBaseUrl)
                sSPAppBaseUrl = document.URL;

            return sSPAppBaseUrl;
        }

    }

    return SpeedMeetUtility;
});