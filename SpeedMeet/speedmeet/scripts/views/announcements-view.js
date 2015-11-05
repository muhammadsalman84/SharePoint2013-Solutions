'use strict';
define(["controllers/announcement-controller"],
     function (AnnouncementsController) {
         function AnnouncementView(oApplication) {

             var successAnnouncements = function (arrayAnnoucements) {
                 if (arrayAnnoucements[0] > 0) {
                     $("#allAnnouncements li").remove();
                     $("#badge-Announcement").text(arrayAnnoucements[0]);
                     $("#allAnnouncements").append(arrayAnnoucements[1]);
                 }
                 else {
                     $("#allAnnouncements li").remove();
                     $("#allAnnouncements").append("<li><b>No new Announcements</b></li><li class='divider'></li>");
                 }

                 var allAnchors = $('#allAnnouncements').find("a");

                 // Bind the click event with the Events Anchors
                 $.each(allAnchors, function (index, eventAnchor) {
                     $(eventAnchor).bind('click', function () {
                         var eventId = $(this).attr("data-eventId");
                         oApplication.oShowMeetEventView.loadMeetEvent(eventId, _spPageContextInfo.userId);
                     });
                 });
             }

             var errorAnnouncements = function () {

             }

             var myAnnouncements = function () {
                 var oAnnouncementsController = new AnnouncementsController(oApplication);

                 oAnnouncementsController.getMyAnnouncements()
                    .then(successAnnouncements, errorAnnouncements);
             }

            /* $("#btn-Announcements").bind("click", function () {
                 $(this).toggleClass('btn-warning').toggleClass('btn-primary');
             });

             $("#btn-Announcements").bind("mouseleave", function () {
                 $(this).removeClass('btn-warning').addClass('btn-primary');
             });*/

             setInterval(myAnnouncements, 40000);

             myAnnouncements();
             return {
                 getMyAnnouncments: myAnnouncements
             }
         }

         return AnnouncementView;
     });