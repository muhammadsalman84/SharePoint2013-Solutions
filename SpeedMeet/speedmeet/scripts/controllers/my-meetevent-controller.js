'use strict';
define(["data/da-utility", "data/da-layer"],
    function (DAUtility, DALayer) {
        function MyMeetEventController(oApplication) {
            var self = this,
            oDAUtility = new DAUtility(),
            oDALayer = new DALayer,
            CONSTANTS = oApplication.getConstants();

            this.getMySpeedMeets = function () {
                //https://app-6777c5453929c8.apptest.emea.tuv.group/sites/spApps/SpeedMeet/_api/web/lists/getByTitle('SpeedMeetList')/items?$select=Title,Location1,Description1,Participants1Id,Author/ID,Author/Title&$expand=Author/ID,Author/Title&filter=Author/ID eq '1'
                var sMethodType = CONSTANTS.DB.HTTP.METHODS.GET,
                oHttpRequest = oDAUtility.getHttpRequest(sMethodType, "default", oApplication.getSPAppWebUrl()),
                oSpeedMeetList = oDAUtility.SPLists().SpeedMeet,
                olMeetItems,
                aData = [],
                oDeferred = $.Deferred();

                oHttpRequest.url += "lists/getbytitle('" + oSpeedMeetList.Title + "')/items?$select=ID,Title,Location1,Description1,Participants1Id,Author/ID,Author/Title,Created&$expand=Author/ID,Author/Title&$filter=Author/ID eq " + "'" + _spPageContextInfo.userId + "' &$orderby=Created desc";
                oDALayer.SubmitWebMethod(oHttpRequest).done(function (oListItems) {
                    if (oListItems.d.results) {
                        olMeetItems = oListItems.d.results;
                        var arrayHdrs = [];
                        $.each(olMeetItems, function (index, meetItem) {
                            var row = [];

                            row.push(meetItem.ID);
                            row.push(meetItem.Title);
                            row.push(meetItem.Created);
                            row.push(meetItem.Description1);
                            row.push(meetItem.Location1);                            

                            aData.push(row);
                        });

                        arrayHdrs.push({ "title": "ID" });
                        arrayHdrs.push({ "title": oSpeedMeetList.fields.Title.title });
                        arrayHdrs.push({ "title": "Created" });
                        arrayHdrs.push({ "title": oSpeedMeetList.fields.Description1.title });
                        arrayHdrs.push({ "title": oSpeedMeetList.fields.Location1.title });
                        arrayHdrs.push({
                            data: null,
                            className: "center",
                            defaultContent: "<div class='btn-group btn-group-justified'><button type='button' id='btnEditMeet-mymeet' class='btn btn-primary' data-bsbutton='true'> <i class='glyphicon glyphicon-edit pull-left'></i>Edit</button><button type='button' id='btnCancelMeet-mymeet' class='btn btn-primary' data-bsbutton='true'> <i class='glyphicon glyphicon-trash pull-left'></i>Cancel</button></div>"
                                //'<a href="" class="editor_edit">Edit</a> / <a href="" class="editor_remove">Cancel</a>'
                            //mRender: function (o) { return '<i class="ui-tooltip fa fa-pencil" style="font-size: 22px;" data-original-title="Edit"></i><i class="ui-tooltip fa fa-trash-o" style="font-size: 22px;" data-original-title="Delete"></i>'; }
                        });

        
                        aData.push(arrayHdrs);

                        oDeferred.resolve(aData);
                    }
                });

                return oDeferred.promise();
            }

        }
        return MyMeetEventController;
    });