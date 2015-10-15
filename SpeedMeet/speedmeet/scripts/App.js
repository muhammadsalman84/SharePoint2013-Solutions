'use strict';

require.config({
    baseUrl: '../Scripts',
    paths: {
        "jquery": "libs/jquery-1.9.1",
        "bootstrap": "libs/bootstrap.min",
        "datatables": "libs/jquery.dataTables",
        "async": "libs/async",
        "jsapi": "//google.com/jsapi",
        "moment": "libs/moment.min",
        "fullCalendar": "libs/fullcalendar.min"
    }
});


require(['jquery', 'starters/application', 'views/main'
],
function ($, Application, viewMain) {
    $(document).ready(function () {
        var waitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Loading SpeedMeet...', 'Please wait, this will not take longer...');
        //(SP.Res.dialogLoading15);
        $("#IMeetEvent").load("SubPages/MeetEvent.html", function () {
            var oApplication = new Application();
            $(oApplication.modules.myMeetEventModule.id).load("SubPages/MyMeetEvent.html", function () {
                $(oApplication.modules.joinMeetEventModule.id).load("SubPages/JoinMeetEvent.html", function () {
                    $(oApplication.modules.showMeetEventModule.id).load("SubPages/ShowMeetEvent.html", function () {
                        $(oApplication.modules.finalMeetEventModule.id).load("SubPages/FinalMeetEvent.html", function () {

                            var oviewMain = new viewMain(oApplication);
                            waitDialog.close();
                            waitDialog = null;

                        });
                    });
                });
            });

        });

    });
   
   
    var sUserName = "i:0#.f|membership|msalmanm@myspappsdev.onmicrosoft.com".replace('i:0#.w|', '');
    var settings = { type: "withpicture", redirectToProfile: true };
    //createpresence(sUserName, settings);

});



