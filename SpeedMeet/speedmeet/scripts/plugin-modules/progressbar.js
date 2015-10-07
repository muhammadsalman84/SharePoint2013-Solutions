'use strict';

define(function () {
    function ProgressbarModule() {
        var iIncrementValue = 0
        
        this.incrementProgressBar = function (iValue, sTextValue) {
            var sText = sTextValue;
            $('.progress-bar').text(sText);
            $('.progress-bar').css('width', iIncrementValue + '%').attr('aria-valuenow', iIncrementValue);
            if (iIncrementValue < 100) {
                iIncrementValue += iValue;
            }
        }

        this.stopProgressBar = function () {
            $(ProgressbarModule.progressbarModuleId).addClass("hide");
            iIncrementValue = 0;
        }

        this.startProgressbar = function (sTextValue) {
            var sText = "Loading...";
            iIncrementValue = 0;
            this.incrementProgressBar(10, sText);
            //$('.progress-bar').text(sText);
        }
        
    }

    ProgressbarModule.progressbarModuleId;

    return ProgressbarModule;
});