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

    getSendEmailUrl: function() {
      return Backbone.siteRootUrl + 'email/sendemail';
    },

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

    send: function (incidentId, emailData, callback) {
      var url = this.getSendEmailUrl();

      if (emailData.SystemMessageBody !== void 0) {
        delete emailData.SystemMessageBody;
      };

      $.ajax({
        type: "POST",
        url: url,
        data: emailData,
        success: function (result) {
          console.log('success: ' + result);

          if (typeof callback === 'function') {
            callback(result);
          }
        },
        error: function (err) {
          console.log('err:' + err);
        }
      });
    },

    _getUrl: function () {
      return Backbone.siteRootUrl + this.controller + '/' + this.action;
    },


  });

  return EmailService;
});