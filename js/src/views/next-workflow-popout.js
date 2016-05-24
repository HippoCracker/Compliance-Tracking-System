define([
  'jquery',
  'underscore',
  'backbone',
  './email-popout',
  '../utils/email-service',
  './page-alert'
], function ($, _, Backbone, EmailPopoutView, EmailService, PageAlert) {

  var PopoutView = Backbone.View.extend({

    el: '#confirm-popout-container',

    attributes: {
      expand: false
    },

    events: {
      'click #popout-cancel-btn' : 'hidePopout',
      'click #popout-submit-btn' : 'sendReviewCompleteRequest',
    },

    initialize: function () {
      this.$cancelBtn = $('#popout-cancel-btn');
      this.$submitBtn = $('#popout-submit-btn');
    },

    render: function () {
      var $notReviewedTableContainer = $("#current-stage-detail-template .table-container"),
          content = this.$el.find('#next-workflow-popout > section');

      $notReviewedTableContainer.find('table').attr('class', '');

      if ($notReviewedTableContainer.find('tr').length > 0) {
        content.html($notReviewedTableContainer.html());
      } else {
        content.empty();
      }
      this.showPopout();
    },

    hidePopout: function () {
      this.$el.fadeOut('fast');
    },

    showPopout: function () {
      this.$el.fadeIn('fast');
    },

    sendReviewCompleteRequest: function (e) {
      var successCallback = this.successReviewComplete.bind(this),
          locationFacade = {
            reload: window.navigate ?
                    window.navigate.bind(window, location.href) :
                    location.reload.bind(location)
          }

      $(e.target).attr('disabled', 'true');

      $.ajax({
        type: "POST",
        url: Backbone.siteRootUrl + "PostMortem/ReviewComplete",
        data: { incidentId: Backbone.incident.incidentId, isMoveWorkflow: true },
        dataType: 'json',
        success: function (data) {
          PageAlert.success(data.message);
          if (data.isMoveWorkflow) {
            setTimeout(locationFacade.reload, 3500);
          } else {
            successCallback(data);
          }
        },
        error: function (err) {
          PageAlert.error(err.responseText.message);
          console.log('error: ' + err);
        }
      });
    },

    successReviewComplete: function (data) {
      var incidentId = Backbone.incident.incidentId,
          workflowTypeId = Backbone.incident.workflowTypeId,
          emailService,
          emailPopout;

      this.hidePopout();

      emailService = new EmailService('email', 'ComposeReviewCompleteEmail');
      emailPopout= new EmailPopoutView({
            model: {
              emailService: emailService,
              data: {
                incidentId: incidentId,
                workflowType: workflowTypeId
              }
            }
          });
    }
  });

  return PopoutView;
});