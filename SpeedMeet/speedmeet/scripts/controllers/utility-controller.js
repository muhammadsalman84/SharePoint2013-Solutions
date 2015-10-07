'use strict';
define([], function () {
    function UtilityController(oApplication) {
        var self = this;

        self.showAdminView = function (authorId, htmlElement) {
            if (authorId == _spPageContextInfo.userId) {
                $(".adminFunctions").removeClass("hide");                                  
            }
            else {
                $(".adminFunctions").addClass("hide");
            }
        }       
    }
    return UtilityController;
});