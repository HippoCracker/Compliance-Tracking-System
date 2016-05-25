define([
  'jquery',
  'underscore',
  'backbone',
  '../views/page-alert'
], function ($, _, Backbone, PageAlert) {

  var EmailService = function (controller, action) {
    this.controller = controller;
    this.action = action;
  }

  _.extend(EmailService.prototype, {

    getSendEmailUrl: function() {
      return Backbone.siteRootUrl + 'email/sendemail';
    },

    getEmailContent: function (data, callback) {
      var url = this._getUrl();

      if (!this._isValid(data))
        throw new Error("Invalid data parameter in method: getContent, class: email-service");

      $.ajax({
        type: 'post',
        url: url,
        data: data,
        success: function (data) {
          if (_.isFunction(callback)) callback(data);
        },
        error: function (error) {
          console.log(error);
        }
      });
    },

    _isValid: function(data) {
      var incidentId = data.incidentId,
          workflowType = data.workflowType,
          receivers = data.receivers;

      if (!incidentId) return false;
      return ((workflowType && typeof workflowType === 'number')
           || (receivers && typeof data.receivers === 'string'))
    },

    send: function (incidentId, emailData, callback) {
      var
        toAddress = emailData.ToAddress,
        ccAddress = emailData.CCAddress,
        emailAddresses = [toAddress, ccAddress].join(),
        isValid = this.validateEmail(emailAddresses),
        url = this.getSendEmailUrl();

      if (!isValid) {
        PageAlert.error('Invalid email address of the receiver');
        return;
      }

      if (emailData.SystemMessageBody !== void 0) {
        delete emailData.SystemMessageBody;
      };

      $.ajax({
        type: "POST",
        url: url,
        data: emailData,
        success: function (result) {
          PageAlert.success(result.message);
          console.log('success: ' + result);

          if (typeof callback === 'function') {
            callback(result);
          }
        },
        error: function (err) {
          PageAlert.error(error.message);
          console.log('err:' + err);
        }
      });
    },

    validateEmail: function (email) {
      var isValid = true;
      $.ajax({
        async: false,
        url: citsGlobal.baseUrl() + "Email/ValidateEmailInput",
        data: { emailData: email },
        type: "post",
        success: function (result) {
          if (result == "True") {
            isValid = true;
          } else {
            isValid = false;
          }
        },
        error: function (e) {
          PageAlert.error("error occurred while validating emails. " + e);
        }
      });
      return isValid;
    },

    _getUrl: function () {
      return Backbone.siteRootUrl + this.controller + '/' + this.action;
    },

  });

  return EmailService;
});