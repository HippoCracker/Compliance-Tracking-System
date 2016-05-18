define([
  'jquery',
  'underscore',
  'backbone',
  '../common',
  './next-workflow-popout',
  './email-popout',
  '../utils/email-service',
  'text!templates/not-reviewed-popout-template.html'
], function ($, _, Backbone, common, NextWorkflowPopoutView, EmailPopoutView, EmailService, popoutTemplate) {

  var NotReviewedPopoutView = Backbone.View.extend({

    el: '#not-reviewed-popout-container',

    template: _.template(popoutTemplate),

    model: {},

    events: {
      'click #popout-cancel-btn': 'hidePopout',
      'click #next-workflow-btn': 'showNextWorkflowPopout',
      'change .send-email-checkbox': 'toggleSendEmailBtn',
      'click #select-all-checkbox': 'toggleRecevierCheckbox',
      'click #display-email-popout-btn': 'showEmailPopout'
    },

    initialize: function () {

    },

    render: function () {
      this.model.notReviewedRows = $("#not-reviewed-participants-template").html();
      this.$el.html(this.template(this.model));
      this.showPopout();

      this.$emailPopoutBtn = this.$el.find('#display-email-popout-btn');
    },

    hidePopout: function () {
      this.$el.fadeOut('fast');
    },

    showPopout: function () {
      this.$el.fadeIn('fast');
    },

    showNextWorkflowPopout: function () {
      this.hidePopout();
      var moveWorkflowPopout = new NextWorkflowPopoutView();
      moveWorkflowPopout.render();
    },

    toggleSendEmailBtn: function () {
      var length = this.$el.find('.send-email-checkbox:checked').length;
      if (length === 0) {
        this.$emailPopoutBtn.attr('disabled', 'true');
      } else {
        this.$emailPopoutBtn.removeAttr('disabled');
      }
    },

    toggleRecevierCheckbox: function (e) {
      var isSelectAll = $(e.target).is(':checked');
      var recevierCheckboxes = this.$el.find('.send-email-checkbox');
      if (isSelectAll) {
        _.each(recevierCheckboxes, function (checkbox) { checkbox.setAttribute('checked', 'checked'); });
      } else {
        _.each(recevierCheckboxes, function (checkbox) { checkbox.removeAttribute('checked'); });
      }
      this.toggleSendEmailBtn();
    },

    showEmailPopout: function () {
      this.hidePopout();
      this.displayEmailPopout();
    },

    _getSelectedReceiver: function () {
      $checkboxes = this.$el.find('#unreviewed-participant-table input[type="checkbox"].send-email-checkbox');
      var result = [],
          len = $checkboxes.length,
          value, $checkbox;
      if ($checkboxes.is(':checked')) {
        for (var i = 0; i < length; i++) {
          $checkbox = $($checkboxes[i]);
          if ($checkbox.is(':checked')) {
            result.push($checkbox.val());
          }
        }
      }
      return result.join();
    },

    displayEmailPopout: function (e) {
      var incidentId = Backbone.incident.incidentId,
          workflowTypeId = Backbone.incident.workflowTypeId,
          receviers = this._getSelectedReceiver(),
          emailService, emailPopout;

      if (Backbone.incident.workflowTypeId === common.WORKFLOW_TYPE.WorkingGroup) {
        emailService = new EmailService('email', 'ComposeLastCallEmailForReceivers');
      } else {
        emailService = new EmailService('email', 'ComposeReminderEmailForReceivers');
      }

      this.emailPopout = new EmailPopoutView({
        model: {
          emailService: emailService,
          data: {
            incidentId: incidentId,
            receivers: receviers
          }
        }
      });
    },

  });

  return NotReviewedPopoutView;
});