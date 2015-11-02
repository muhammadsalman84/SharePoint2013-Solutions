'use strict';

define(function () {
    function DALayer() {
        return {
            SubmitWebMethodSynchronise: function (url) {
                $.ajax({
                    url: url,
                    type: "GET",
                    async: false,
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    success: function (data) {
                        return data;
                    },
                    error: function (err) {
                        console.log(err.message)
                    }
                });
            },
            SubmitWebMethod: function (httpRequest) {
                httpRequest.success = function (data) {
                    data;
                }
                httpRequest.error = function (data) {
                    failure(data);
                }

                try {
                    return $.ajax(httpRequest);
                }
                catch (err) {
                    err.message;
                }
            },
            SubmitWebMethodByReqExecutor: function (httpRequest, appWebUrl) {
                var deferred = $.Deferred(),
                executor = new SP.RequestExecutor(appWebUrl);
                httpRequest.success = function (data, status) {
                    deferred.resolve(data);
                }
                httpRequest.error = function (data, errorCode, errorMessage) {
                    deferred.reject(data);
                }
                executor.executeAsync(httpRequest);

                return deferred.promise();
            },
            getUserByLoginName: function (loginName) {
                var deferred = $.Deferred(),
                context = new SP.ClientContext.get_current(),
                user = context.get_web().ensureUser(loginName);
                context.load(user);
                context.executeQueryAsync(
                    function () {
                        deferred.resolve(user);
                    },
                    function (sender, args) {
                        deferred.reject(sender, args);
                    });

                return deferred.promise();
            },
            getCurrentUser: function () {
                var deferred = $.Deferred(),
                context = new SP.ClientContext.get_current(),
                user = context.get_web().get_currentUser();
                context.load(user);
                context.executeQueryAsync(
                    function () {
                        deferred.resolve(user);
                    },
                    function (sender, args) {
                        deferred.reject(sender, args);
                    });

                return deferred.promise();
            }
        }
    }
    return DALayer;
});