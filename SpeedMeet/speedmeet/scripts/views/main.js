'use strict';
define(["views/meetevent-view", "views/my-meetevent-view", "views/join-meetevent-view",
    "views/show-meetevent-view", "views/final-meetevent-view", "views/announcements-view", "controllers/utility-controller"],
     function (MeetEventView, MyMeetEventView, JoinMeetEventView, ShowMeetEventView, FinalSpeedMeetView, AnnouncementsView, utilityController) {
         function MainView(oApplication) {
             var headerButtons = oApplication.modules.menubar.getButtons(),
                 olLocation, itemId, userId;

             // Get Query String
             itemId = oApplication.getQueryStringParameters("smItemId");
             userId = oApplication.getQueryStringParameters("smUserId");

             var setStartUpValues = function () {
                 var oUtilityController = new utilityController(oApplication),
                     oDeferred = $.Deferred();

                 oUtilityController.getLoginUserId().done(function (userId) {
                     oApplication.CurrentUserId = userId;
                     oDeferred.resolve();
                 });

                 return oDeferred.promise();
             }           

             setStartUpValues().done(function () {

                 // Set Objects in the Application Object
                 oApplication.oMyMeetEventView = new MyMeetEventView(oApplication);
                 oApplication.oFinalSpeedMeetView = new FinalSpeedMeetView(oApplication);
                 oApplication.oShowMeetEventView = new ShowMeetEventView(oApplication);
                 oApplication.oJoinMeetEventView = new JoinMeetEventView(oApplication);
                 oApplication.oAnnouncementView = new AnnouncementsView(oApplication);

                 if ((itemId) && (userId == oApplication.CurrentUserId)) {
                     oApplication.oMeetEventView = new MeetEventView(oApplication);
                     oApplication.oMeetEventView.showEvent(itemId);
                 }
                 else {
                     oApplication.showHideModule(oApplication.modules.meetEventModule.id, 0);
                     oApplication.oMeetEventView = new MeetEventView(oApplication);
                 }

                // $(document).tooltip();
                 //$(document).tooltip();
                 var bootstrap3_enabled = (typeof $().emulateTransitionEnd == 'function');

                 $('[data-toggle="tooltip"]').tooltip();
                 //$("body").tooltip({ selector: '[data-toggle=tooltip]' });

             }).fail(function () {
                 alert("Sorry an error occured while loading the SpeedMeet App.");
             });



             // Menu Button Events
             $(headerButtons.btnNewMeetEvent).bind("click", function () {
                 oApplication.oMeetEventView.ShowNewMeet();
             });

             $(headerButtons.btnMyMeetEvents).bind("click", function () {
                 var module = oApplication.modules.myMeetEventModule;
                 oApplication.showHideModule(module.id);
                 oApplication.oMyMeetEventView.getMySpeedMeets();
             });

             $(headerButtons.btnJoinMeetEvent).bind("click", function () {
                 var module = oApplication.modules.joinMeetEventModule;
                 oApplication.showHideModule(module.id);
                 oApplication.oJoinMeetEventView.getMeetInvitations();
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