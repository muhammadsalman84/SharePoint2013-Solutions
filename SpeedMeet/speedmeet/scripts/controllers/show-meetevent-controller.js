'use strict';
define(["data/da-utility", "data/da-layer", "controllers/pool"], function (DAUtility, DALayer, PoolController) {
    function ShowSpeedMeetController(oApplication) {
        var self = this,
        oDAUtility = new DAUtility(),
        oDALayer = new DALayer,
        oPoolController = new PoolController(oApplication),
        CONSTANTS = oApplication.getConstants();
      
    }
    return ShowSpeedMeetController;
});