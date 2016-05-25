define([
  'jquery',
  'underscore',
  'backbone',
  '../utils/custom-tagit',
  '../utils/animation',
  'jquery.ui.slider'
], function ($, _, Backbone, Tagit, Animation) {

  var WorkflowsView = Backbone.View.extend({

    el: '#workflows-app',

    events: {
      'click #toggle-form-btn': 'toggleForm',
      'click #popout-submit-btn': 'sendReviewCompleteRequest',
      'change #workflowTypeDropdown': 'fetchWorkflowData',

    },

    initialize: function () {
      var validation = this.validateUserInputs.bind(this);

      this.$showFormBtn         = this.$el.find('#show-form-btn');
      this.$createWorkflowBtn   = this.$el.find('#create-workflow-btn');
      this.$alertThreshold      = this.$el.find('#alert-threshold');
      this.$workflowDropdown = this.$el.find('#workflowTypeDropdown');
      this.$participantsNameInput = this.$el.find('#workflow-participants');
      this.$sliderContainer = this.$el.find('#slider-container');

      this.participantsNameTagit    = new Tagit('#workflow-participants', { afterTagAdded: validation, afterTagRemoved: validation });
    },

    render: function () {
      var options = this._sliderConfig;
      this.$sliderContainer.slider(options);

    },

    toggleForm: function (e) {
      var $btn = $(e.target);
      if ($btn.html() === 'Cancel') {
        Animation.toggleUp('#new-workflow-form');
        $btn.html('New Workflow');
        $btn.addClass('green-btn');
        $btn.removeClass('purple-btn')
      } else {
        Animation.toggleDown('#new-workflow-form');
        $btn.html('Cancel');
        $btn.removeClass('green-btn');
        $btn.addClass('purple-btn')
      }
    },

    validateUserInputs: function () {
      var selectedValue = Number(this.$workflowDropdown.val()),
          isAllValid = true;

      if (selectedValue === -1) {
        this.participantsNameTagit.disable();
        isAllValid = false;
      } else {
        this.participantsNameTagit.enable();
      }

      if (this.$participantsNameInput.val().length === 0) {
        isAllValid = false;
      }

      if (isAllValid) {
        this.$createWorkflowBtn.removeAttr('disabled');
      } else {
        this.$createWorkflowBtn.attr('disabled', 'true');
      }
    },

    fetchWorkflowData: function () {
      var
        participantsNameTagit = this.participantsNameTagit,
        updateAlertThresholdDropdown = this.updateAlertThresholdDropdown.bind(this),
        $participantsNameInput = this.$participantsNameInput,
        selectedValue = Number(this.$workflowDropdown.val());

      if (selectedValue !== -1) {
        $.ajax({
          url: Backbone.siteRootUrl + 'postmortem/getworkflowinfo',
          type: 'post',
          data: {
            incidentId: Backbone.incident.incidentId,
            workflowTypeId: selectedValue
          },
          success: function (result) {
            participantsNameTagit.update(result.participants);
          },
          error: function (err) {
            throw new Error(err.message);
          }
        });

      }
    },

    updateAlertThresholdDropdown: function (duration) {
      var $alertThreshold = this.$alertThreshold,
          index;
      $alertThreshold.empty();
      for (index = 1; index <= duration; index++) {
        $alertThreshold.append('<option value="' + index + '">' + index + '</option>');
      }
    },

    _sliderConfig: {
      range: true,
      min: 0,
      max: 14,
      step: 5,
      values: [2, 4],
      slide: function (event, ui) {
        console.log('sliding');
      }
    }

  });

  return WorkflowsView;
});