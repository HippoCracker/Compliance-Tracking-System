define([
  'jquery',
  'underscore',
  'backbone',
  './email-popout',
  '../utils/email-service',
], function ($, _, Backbone, EmailPopoutView, EmailService) {

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

      if ($notReviewedTableContainer.find('tr').length > 0) {
        content.html($notReviewedTableContainer.html());
      } else {
        content.empty();
      }
      this.showPopout();
    },

    hidePopout: function () {
      this.$el.fadeOut();
    },

    showPopout: function () {
      this.$el.fadeIn();
    },

    sendReviewCompleteRequest: function () {
      var successCallback = this.successReviewComplete.bind(this);
      $.ajax({
        type: "POST",
        url: Backbone.siteRootUrl + "PostMortem/ReviewComplete",
        data: { incidentId: Backbone.incident.incidentId, isMoveWorkflow: true },
        dataType: 'json',
        success: function (data) {
          if (data.isMoveWorkflow) {
            window.location.reload();
          } else {
            successCallback(data);
          }
        },
        error: function (err) {
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
              incidentId: incidentId,
              workflowTypeId: workflowTypeId
            }
          });
    }
  });

  return PopoutView;
});