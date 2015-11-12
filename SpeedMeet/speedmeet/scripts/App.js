'use strict';

/*require.config({
    baseUrl: '../Scripts',
    shim: {
        //"bootstrap": { "deps": ['jquery'] }
    },
    paths: {
        /*"jquery": "//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
        "bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min",
        "jquery": "libs/jquery-1.11.3.min",
        "bootstrap": "libs/bootstrap.min",
        "jquery-ui": "libs/jquery-ui",
        "datatables": "libs/jquery.dataTables",
        "async": "libs/async",
        "jsapi": "//google.com/jsapi",
        "moment": "libs/moment.min",
        "fullCalendar": "libs/fullcalendar.min",
        "jquery.validate": "libs/jquery.validate"
    }
});*/

require.config({
    baseUrl: '../Scripts',
    shim: {
        //"bootstrap": { "deps": ['jquery'] }
    },
    paths: {               
        "async": "libs/async"       
    }
});

require(['starters/application', 'views/main'],
function (Application, viewMain) {
    var waitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Loading SpeedMeet...', 'Please wait, this will not take longer...');
    $(document).ready(function () {
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
});



