define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {

  var EmailService = function (controller, action) {
    this.controller = controller;
    this.action = action;
  }

  _.extend(EmailService.prototype, {

    getContent: function (incidentId, workflowTypeId,  callback) {
      var url = this._getUrl();
      $.ajax({
        type: 'post',
        url: url,
        data: { incidentId: incidentId, currentType: workflowTypeId },
        success: function (data) {
          if (_.isFunction(callback)) callback(data);
        },
        error: function (error) {
          console.log(error);
        }
      });
    },

    send: function (callback) {
      var url = this._getUrl();
      $.ajax({
        type: "POST",
        url: url,
        data: "{'incidentId': '" + incidentId + "', 'receivers': '" + users + "'}",
        dataType: "html",
        contentType: "application/json; charset=utf-8",
        success: callback
      });
    },

    _getUrl: function () {
      return Backbone.siteRootUrl + this.controller + '/' + this.action;
    },


  });

  return EmailService;
});