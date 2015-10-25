'use strict';
define([],
     function () {
         function ValidateControls(oApplication) {
             var self = this;
             self.oApplication = oApplication;

             var getErrorHtml = function (element, errorElementHtml) {
                 var elementId,
                 errorHtml = errorElementHtml || "<span class='help-block' id='{0}'>This field is required.</span>";

                 elementId = $(element).attr('id') + "-error";
                 $("#" + elementId).remove();
                 errorHtml = String.format(errorHtml, elementId);

                 return errorHtml;
             }

             self.showError = function (element, errorHtml) {
                 var errorHtml = getErrorHtml(element, errorHtml);
                 $(element).closest('.form-group').addClass('has-error');
                 if ($(element).parent('.input-group').length) {
                     $(errorHtml).insertAfter($(element).parent());
                 } else {
                     $(errorHtml).insertAfter($(element));
                 }
             }

             self.removeError = function (element) {
                 getErrorHtml(element);
                 $(element).closest('.form-group').removeClass('has-error');
             }

             self.validateRequiredField = function (element) {
                 if ($(element).val()) {
                     self.removeError(element);
                 }
                 else {
                     self.showError(element);
                     return false;
                 }
             }

             self.validatePP = function (peoplePicker) {
                 var self = this,
                     participants = self.oApplication.getParticipants();

                 if (participants.length == 0) {
                     self.showError($(peoplePicker));
                     return false;
                 }
                 else {
                     self.removeError(peoplePicker);
                 }

                 return true;
             }

         }

         ValidateControls.prototype.validate = function (moduleId) {
             var isValid = true, hasRequiredAttr,
                  self = this;

             $(moduleId).find("*").each(function (index) {
                 hasRequiredAttr = $(this).attr("required");
                 if (hasRequiredAttr) {
                     if (self.validateRequiredField(this) === false)
                         isValid = false;
                 }
             });

             return isValid;
         }

         ValidateControls.prototype.bindEvents = function (moduleId) {
             var hasRequired, elementType, elementId,
                 self = this;
             $(moduleId).find("*").each(function (index) {
                 // Bind the Keyup event element 
                 hasRequired = $(this).attr("required");
                 if (hasRequired) {
                     $(this).bind("keyup", function () {
                         self.validateRequiredField(this);
                     });
                 }

                 // Bind the Keyup event element based on Type attribute
                 elementType = $(this).data("type");
                 elementId = $(this).attr('id');
                 if (elementType == "peoplepicker") {
                     /*$(".ms-usereditor div").bind('input propertychange', function () {
                         self.validatePP("#" + elementId);
                     });*/
                 }
             });
         }

         ValidateControls.prototype.validatePeoplePicker = function () {
             var self = this,
                 participants = self.oApplication.getParticipants();

             if (participants.length == 0) {
                 self.showError($("#peoplePickerDiv"));
                 return false;
             }
             else {
                 self.removeError("#peoplePickerDiv");
             }

             return true;
         }

         ValidateControls.prototype.validatePeoplePicker = function () {
             var self = this,
                 participants = self.oApplication.getParticipants();

             if (participants.length == 0) {
                 self.showError($("#peoplePickerDiv"));
                 return false;
             }
             else {
                 self.removeError("#peoplePickerDiv");
             }

             return true;
         }

         ValidateControls.prototype.validateCalendar = function () {
             var self = this,
                 errorElementHtml = "<strong><span class='help-block' id='{0}'>Please select atleast one time slot in order to proceed further.</span></strong></strong>",
                 calendarDates = self.oApplication.getAllSelectedDates();
                
             if (calendarDates.length == 0) {
                 self.showError($("#calendar"), errorElementHtml);
                 return false;
             }
             else {
                 self.removeError($("#calendar"));
             }

             return true;
         }

         return ValidateControls;
     });