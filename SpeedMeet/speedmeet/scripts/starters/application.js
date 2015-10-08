'use strict';
define(["starters/utility", "starters/constants", "plugin-modules/progressbar", "plugin-modules/people-picker"
       , "plugin-modules/full-calendar"],
     function (Utility, Constants, ProgressbarModule, PeoplePicker, FullCalendar) {
         function loadApplication() {
             var self = this,
                 setModuleFields, configureModules;

             Utility.apply(self);
             PeoplePicker.apply(self);
             FullCalendar.apply(self);
             Constants.apply(self);
             ProgressbarModule.apply(self);
             

             setModuleFields = function (module, strFindQuery) {
                 var fields = {};

                 // Create collection of fields                 
                 $(module.id).each(function (index) {
                     $(this).find(strFindQuery).each(function (index) {
                         fields[this.id] = "#" + this.id;
                     });
                 });
                 return fields;
             }

             self.modules = {
                 meetEventModule: {
                     id: "#IMeetEvent",
                     hide: true,
                     subModules: {
                         id: ["#IMeetEventONE", "#IMeetEventTWO"]
                     },
                     getFields: function () {
                         return setModuleFields(this, "*[data-spfield]");
                     },
                     getButtons: function () {
                         return setModuleFields(this, '*[data-BSButton="true"]');
                     },
                     menuButton: "#btnNewSpeedMeet"
                 },
                 myMeetEventModule: {
                     id: "#IMyMeetEvent",
                     hide: true,
                     menuButton: "#btnMySpeedMeets"
                 },
                 joinMeetEventModule: {
                     id: "#IJoinMeetEvent",
                     hide: true                     
                 },
                 showMeetEventModule: {
                     id: "#IShowMeetEvent",
                     hide: true
                 },
                 finalMeetEventModule: {
                     id: "#IFinalMeetEvent",
                     hide: true
                 },
                 progressbar: {
                     id: "#IProgressbar",
                     hide: true
                 },
                 plugins: {
                     calendar: {
                         id: "#calendar"
                     },
                     google: {
                         id: ""
                     },
                     peoplepicker: {
                         id: ""
                     }
                 },
                 menubar: {
                     id: "#IMenubar",
                     getButtons: function () {
                         return setModuleFields(this, '*[data-BSButton="true"]');
                     }
                 }
             }

             ProgressbarModule.progressbarModuleId = self.modules.progressbar.id;
         }

         loadApplication.prototype = {
             showHideModule: function (moduleToShow) {
                 var allModules = this.modules;
                 for (var module in this.modules) {
                     if (allModules[module].hasOwnProperty("hide")) {
                         if (allModules[module].id == moduleToShow) {
                             $(moduleToShow).removeClass("hide");
                             if (allModules[module].hasOwnProperty("menuButton")) {
                                 $(allModules[module].menuButton).parent().addClass("active");
                             }
                             if (allModules[module].hasOwnProperty("subModules")) {

                                 $(allModules[module].subModules.id).each(function (i) {
                                     if (i == 0)
                                         $(allModules[module].subModules.id[0]).removeClass("hide");
                                     else
                                         $(allModules[module].subModules.id[i]).addClass("hide");
                                 });
                             }
                         }
                         else {
                             $(allModules[module].id).addClass("hide");
                             if (allModules[module].hasOwnProperty("menuButton")) {
                                 $(allModules[module].menuButton).parent().removeClass("active");
                             }
                         }
                     }
                 }

             },
             hideShowButtons: function (hideButtonsCollection, showButtonsCollection) {
                 $.each(hideButtonsCollection, function (key, value) {
                     $("#" + value).parent().addClass("hide");
                 });

                 $.each(showButtonsCollection, function (key, value) {
                     $("#" + value).parent().removeClass("hide");
                 });
             },
             clearFields: function (module) {
                 var olFields = module.getFields();
                 for (var field in olFields) {
                     var control = $(olFields[field]);
                     control.val("");
                 }
             }
             
         }

         return loadApplication;
     });