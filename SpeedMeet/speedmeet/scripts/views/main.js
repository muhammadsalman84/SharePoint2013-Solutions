'use strict';
define(["views/meetevent-view", "views/my-meetevent-view", "views/show-meetevent-view", "views/final-meetevent-view"],
     function (MeetEventView, MyMeetEventView, ShowMeetEventView, FinalSpeedMeetView) {
         function MainView(oApplication) {
             var headerButtons = oApplication.modules.menubar.getButtons(),
                 olLocation, itemId, sUserId;

             // Get Query String
             itemId = oApplication.getQueryStringParameters("smItemId");
             sUserId = oApplication.getQueryStringParameters("smUserId");

             // Set Objects in the Application Object
             oApplication.oMyMeetEventView = new MyMeetEventView(oApplication);
             oApplication.oFinalSpeedMeetView = new FinalSpeedMeetView(oApplication);
             oApplication.oShowMeetEventView = new ShowMeetEventView(oApplication);
            

             if ((itemId) && (sUserId == _spPageContextInfo.userId)) {
                 oApplication.oMeetEventView = new MeetEventView(oApplication);
                 oApplication.oShowMeetEventView.loadMeetEvent(itemId, sUserId);
             }
             else {
                 oApplication.showHideModule(oApplication.modules.meetEventModule.id);
                 oApplication.oMeetEventView = new MeetEventView(oApplication);
             }


             // Menu Button Events
             $(headerButtons.btnNewSpeedMeet).bind("click", function () {
                 oApplication.oMeetEventView.ShowNewMeet();
             });

             $(headerButtons.btnMySpeedMeets).bind("click", function () {
                 var module = oApplication.modules.myMeetEventModule;
                 oApplication.showHideModule(module.id);
                 oApplication.oMyMeetEventView.getMySpeedMeets();
             });

             var uploadFiles = [], crossCounter = 0;

             $('#fileupload').bind('change', function () {
                 var files = this.files;
                 var i = 0;
                 for (; i < files.length; i++) {
                     var fileName = files[i].name;
                     var crossId = "cross-" + crossCounter;
                     var CrossHtml = "<a id='" + crossId + "' href='#'>&#x274C;</a><br />";
                     var filehtml = "<div>" + fileName + CrossHtml + "</div>";
                     $("#files").append(filehtml);

                     $("#" + crossId).bind("click", function () {
                         $(this).parent().remove();
                     });

                     uploadFiles.push(files[i]);
                     crossCounter++;
                 }
             });

         }

         return MainView;
     });