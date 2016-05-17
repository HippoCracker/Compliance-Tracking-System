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

    displayEmailPopout: function (toUsers) {
      if (!toUsers || typeof toUser !== 'string') return void 0;

      var incidentId = Backbone.incident.incidentId,
          workflowTypeId = Backbone.incident.workflowTypeId,
          emailService, emailPopout;


      if (Backbone.incident.workflowTypeId === common.WORKFLOW_TYPE.WorkingGroup) {
        emailService = this._getEmailService('email', 'ComposeLastCallEmail');
      } else {
        emailService = this._getEmailService('email', 'ComposeReminderEmail');
      }

      emailPopout = new EmailPopoutView({
        model: {
          emailService: emailService,
          incidentId: incidentId,
          workflowTypeId: workflowTypeId
        }
      });

      return emailPopout;
    },

    _getUrl: function () {
      return Backbone.siteRootUrl + this.controller + '/' + this.action;
    },

    _getEmailService: function (controller, action) {
      return new EmailService(controller, action);
    },

  });

  return EmailService;
});