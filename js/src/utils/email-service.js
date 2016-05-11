define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {

  var EmailService = function () {

  }

  EmailService = _.extend(EmailService, {

    controller: 'email',

    connect: function (controller, action) {
      this.controller = controller,
      this.action = action;
      var url = this._getUrl();
      return function (incidentId, workflowTypeId, callback) {
        $.ajax({
          type: 'post',
          url: url,
          data: { incidentId: incidentId, currentType: workflowTypeId },
          success: function (result) {
            if (callback) callback(result);
          },
          error: function (error) {
            console.log(error);
          }
        });
      };
    },

    _getUrl: function () {
      return Backbone.siteRootUrl + this.controller + '/' + this.action;
    },


  });

  return EmailService;
});