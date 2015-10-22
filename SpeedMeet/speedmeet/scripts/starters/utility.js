'use strict';

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

        self.showAlert = function (element) {
            $(element).removeClass("hide");
            window.setTimeout(function () {
                $(element).addClass("hide");
            }, 2000);
        }

        self.validateRequiredControls = function (moduleId) {
            var element, isValid = true, elementId,
                errorHtml = "<span class='help-block' id='{0}'>This field is required.</span>";

            $(moduleId).find("*").each(function (index) {
                element = $(this).attr("required");               
                if (element) {
                    elementId = $(this).attr('id') + "-error";
                    $("#" + elementId).remove();
                    errorHtml = String.format(errorHtml, elementId);
                    if ($(this).val()) {
                        $(this).closest('.form-group').removeClass('has-error').addClass('has-success');                                                
                    }
                    else {                        
                        $(this).closest('.form-group').removeClass('has-success').addClass('has-error');                        
                        if ($(this).parent('.input-group').length) {
                            $(errorHtml).insertAfter($(this).parent());
                        } else {
                            $(errorHtml).insertAfter($(this));
                        }

                        isValid = false;
                    }
                }
            });

            return isValid;
        }

        self.bindValidationEvents = function (moduleId) {
            var hasRequired;
            $(moduleId).find("*").each(function (index) {
                hasRequired = $(this).attr("required");
                if (hasRequired) {
                    $(this).bind("blur", function () {

                    });
                }
            });
        }

    }

    return SpeedMeetUtility;
});