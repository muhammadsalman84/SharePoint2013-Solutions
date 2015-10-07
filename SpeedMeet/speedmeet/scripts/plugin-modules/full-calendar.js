'use strict';

define(['moment', 'fullCalendar'], function () {

    function FullCalendar() {
        var self = this,
            calendarObject = null,
         selectedDates = {};

        self.initializeCalendar = function (allDates) {

            calendarObject = $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'agendaWeek,agendaDay'
                },
                defaultView: 'agendaWeek',
                defaultDate: moment(),
                editable: true,
                selectable: true,
                selectHelper: true,
                eventLimit: true,
                select: function (start, end, jsEvent, view) {

                    var start = moment(start).format();
                    var end = moment(end).format();

                    var eventData = {
                        start: start,
                        end: end
                    };

                    $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
                    $('#calendar').fullCalendar('unselect');

                },
                eventRender: function (event, element) {
                    var closeElement = "<span class='closeon'>X</span>";
                    element.find('.fc-time').before(closeElement);
                    element.find('.closeon').bind('click', function () {
                        $('#calendar').fullCalendar('removeEvents', event._id);
                        delete selectedDates[event._id];
                    });

                    selectedDates[event._id] = {};
                    selectedDates[event._id].startDate = moment(event.start).format();
                    selectedDates[event._id].endDate = moment(event.end).format();
                    /*var startTime = moment(event.start).format("HH:mm");
                 var endTime = moment(event.end).format("HH:mm");
                 var selectedTime= startTime + " - " + endTime;
                 element.find(".fc-time").text(selectedTime);*/

                },
                events: allDates
            });
        }

        self.getAllSelectedDates = function () {
            delete selectedDates["undefined"];
            var count = $.map(selectedDates, function (n, i) { return i; }).length,
                dates;
            (count > 0) ? dates = selectedDates : dates = "";
            return dates;
        }

        self.clearFullCalendar = function () {
            /*$('#calendar').fullCalendar('destroy');
            $('#calendar').fullCalendar('render');

            $('#calendar').fullCalendar('rerenderEvents');*/
            var date;
            $('#calendar').fullCalendar('destroy');
            for (date in selectedDates) {
                delete selectedDates[date];
            }
            self.initializeCalendar();

        }

        self.initializeCalendar();

        self.AddEventsToCalander = function(eventSource){
            calendarObject.fullCalendar( 'addEventSource', eventSource )
        }
      
    }
    return FullCalendar;

});