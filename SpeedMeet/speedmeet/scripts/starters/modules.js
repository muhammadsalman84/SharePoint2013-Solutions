'use strict';
define(function () {
         function Modules() {
             var self = this;          

             self.modules = {
                 moduleNewMeet: {
                     id: "#INewSpeedMeet",
                     hide: true,
                     subModules: {
                         id: ["#INewSpeedMeetONE", "#INewSpeedMeetTWO"]
                     },
                     getFields: function () {
                         return setModuleFields(this, "*[data-spfield]");
                     },
                     getButtons: function () {
                         return setModuleFields(this, '*[data-BSButton="true"]');
                     },
                     menuButton: "#btnNewSpeedMeet"
                 },
                 moduleFeedBack: {
                     id: "#IFeedback",
                     hide: true
                 },
                 moduleMyMeet: {
                     id: "#IMySpeedMeets",
                     hide: true,
                     menuButton: "#btnMySpeedMeets"
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
         }

         Modules.prototype = {
             showHideModule: function (moduleToShow) {
                 var allModules = this.modules;
                 for (var module in this.modules) {
                     if (allModules[module].hasOwnProperty("hide")) {
                         if (allModules[module].id == moduleToShow) {
                             $(moduleToShow).removeClass("hide");
                             if (allModules[module].hasOwnProperty("menuButton")) {
                                 $(allModules[module].menuItem).parent().addClass("active");
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
                                 $(allModules[module].menuItem).parent().removeClass("active");
                             }
                         }
                     }
                 }

             },
             clearFields: function (module) {
                 var olFields = module.getFields();
                 for (var field in olFields) {
                     var control = $(olFields[field]);
                     control.val("");
                 }
             }
         }

         return Modules;
     });