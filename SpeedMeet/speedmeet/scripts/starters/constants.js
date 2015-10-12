'use strict';

define(function () {
    function Constants() {
        var self = this;

        self.getConstants = function getConstants() {
            var constantsLiteral = {
                DB: {
                    HTTP: {
                        METHODS: {
                            GET: "GET",
                            POST: "POST",
                            PATCH: "PATCH"
                        }
                    }
                },
                APP: {
                },
                HTML: {
                    divFeedBackNO: "<div class='alert alert-warning text-center' width='100%' height='100%' data-feedback='0' data-startdate='{0}' data-enddate='{1}'><strong><i class='glyphicon glyphicon-remove'></i></strong></div>",
                    divFeedBackYES: "<div class='alert alert-success text-center' width='100%' height='100%' data-feedback='1' data-startdate='{0}' data-enddate='{1}'><strong><i class='glyphicon glyphicon-ok'></i></strong></div>",
                    footerRow: "<tfoot><tr id='tfooterrow' class='cellfooter'><td>Participants Total:</td></tr></tfoot>",
                    //footerCell: "<b><span class='text-center'>{0}</span><br><br><button id='{1}' type='button' class='btn btn-primary text-center'>Finalize date</button></b>"
                    footerCell: "<div style='text-align:center'><b><span>{0}</span><br><br><div class='adminFunctions hide'><button id='{1}' type='button' class='btn btn-primary'>Finalize date</button></div></b></div>"
                },
                URL: {
                    userImagePath: "../Images/Person.png"
                },
                EMAIL: {
                    NewLocation: {
                        FROM: "smtpgate.de.tuv.com",
                        TO: "{0}",
                        SUBJECT: "SpeedMeet event location: {0}",
                        BODY: "{0}",
                        BODY_TEXT: function () {
                            var sHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
                            sHtml += '<html xmlns="http://www.w3.org/1999/xhtml">';
                            sHtml += '<head>';
                            sHtml += '<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />';
                            sHtml += '<title>SpeedMeet Invitation</title>';
                            sHtml += '<style type="text/css">a, u {';
                            sHtml += 'text-decoration: none;';
                            sHtml += '}</style></head>';
                            sHtml += '<body>';
                            sHtml += '<p> <strong>Dear {0}</strong>, </p>';
                            sHtml += '<p> <br> The location of the speedmeet event <strong>"{1}"</strong></strong> has been changed to: <strong>{2}</strong></strong> <br></p>';
                            sHtml += '<p> For further details, please visit your <strong><a href="{3}">SpeedMeet event</a>.</strong></strong></p>';
                            sHtml += '<b></p><div >';
                            sHtml += '</div></body></html>';

                            return sHtml;
                        }
                    },
                    NewMeet: {
                        FROM: "smtpgate.de.tuv.com",
                        TO: "{0}",
                        SUBJECT: "SpeedMeet event invitation: {0}",
                        BODY: "{0}",
                        BODY_TEXT: function () {
                            var sHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
                            sHtml += '<html xmlns="http://www.w3.org/1999/xhtml">';
                            sHtml += '<head>';
                            sHtml += '<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />';
                            sHtml += '<title>SpeedMeet Invitation</title>';
                            sHtml += '<style type="text/css">a, u {';
                            sHtml += 'text-decoration: none;';
                            sHtml += '}</style></head>';
                            sHtml += '<body>';
                            sHtml += '<p> <strong>Dear {0}</strong>, </p>';
                            sHtml += '<p> <br> You have been invited to the SpeedMeet event. The following are the details of the SpeedMeet event; <br><br></p>';
                            sHtml += '<p> ';
                            sHtml += '<table style="width: 100%" border="0">';
                            sHtml += '<tr>';
                            sHtml += '<td style="color:white;background-color:#0072C6; font-size:x-large" colspan="2">SpeedMeet Event</td>';
                            sHtml += '</tr>';
                            sHtml += '<tr>';
                            sHtml += '<td class="auto-style5" style="width: 152px">Title:</td>';
                            sHtml += '<td>{1}</td>';
                            sHtml += '</tr>';
                            sHtml += '<tr>';
                            sHtml += '<td class="auto-style1" style="width: 152px">Description:</td>';
                            sHtml += '<td>{2}</td>';
                            sHtml += '</tr>';
                            sHtml += '<tr>';
                            sHtml += '<td class="auto-style5" style="width: 152px">Location:</td>';
                            sHtml += '<td>{3}</td>';
                            sHtml += '</tr>';
                            sHtml += '</table><b></p><div>';
                            sHtml += '<a href="{4}">	<table style="color:white;background-color:#0072C6;width: 15%" align="left">';
                            sHtml += '<tr><td class="auto-style8">Join this SpeedMeet</td></tr>';
                            sHtml += '</table></a>';
                            sHtml += '<br></div></body></html>';

                            return sHtml;
                        }
                    },
                    FinalizeEvent: {
                        FROM: "smtpgate.de.tuv.com",
                        TO: "{0}",
                        SUBJECT: "SpeedMeet event finalized",
                        BODY: "{0}",
                        BODY_TEXT: function () {
                            var sHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
                            sHtml += '<html xmlns="http://www.w3.org/1999/xhtml">';
                            sHtml += '<head>';
                            sHtml += '<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />';
                            sHtml += '<title>SpeedMeet Invitation</title>';
                            sHtml += '<style type="text/css">a, u {';
                            sHtml += 'text-decoration: none;';
                            sHtml += '}</style></head>';
                            sHtml += '<body>';
                            sHtml += '<p> <strong>Dear {0}</strong>, </p>';
                            sHtml += '<p> <br> The date has been finalized for the event <strong>"{1}"</strong></strong>. The following are the details;<br></p>';
                            sHtml += '<table style="width: 100%">';
                            sHtml += '<tr><td style="color:white;background-color:#0072C6; font-size:x-large" colspan="2">SpeedMeet Event: {2}</td></tr>';                            
                            sHtml += '<tr><td style="width: 152px">Description:</td><td>{3}</td></tr>';
                            sHtml += '<tr><td style="width: 152px">Location:</td><td>{4}</td></tr>';
                            sHtml += '<tr><td style="width: 152px">Date-Time:</td><td>{5}</td></tr>';
                            sHtml += '</table>';
                            sHtml += '<p> For further details, please visit your <strong><a href="{6}">SpeedMeet event</a></strong>.</p>';
                            sHtml += '</p><div >';
                            sHtml += '</div></body></html>';

                            return sHtml;
                        }
                    }
                }
            }
                
            return constantsLiteral;
        }
        
    }

    return Constants;
});