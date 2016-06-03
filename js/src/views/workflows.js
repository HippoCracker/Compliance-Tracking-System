﻿define([
  'jquery',
  'underscore',
  'backbone',
  './_workflows-exist',
  '../utils/custom-tagit',
  '../utils/animation',
  './page-alert',
  'text!templates/workflow-item-template.html'
], function ($, _, Backbone, WorkflowsExistView, Tagit, Animation, PageAlert, WorkflowItemTemplate) {

  var WorkflowsView = Backbone.View.extend({

    el: '#workflows-app',

    events: {
      'click #toggle-form-btn': 'toggleForm',
      'click #create-workflow-btn': 'createWorkflow',
      'click .list-group-item': 'displayWorkflowDetail',
      'click .disable-mask': 'showNotEditableWarning',
      'change #workflowTypeDropdown': 'fetchWorkflowData',

    },

    initialize: function () {
      var validation = this.validateUserInputs.bind(this);

      this.$showFormBtn         = this.$el.find('#show-form-btn');
      this.$createWorkflowBtn   = this.$el.find('#create-workflow-btn');
      this.$alertThresholdDropdown = this.$el.find('#alert-threshold');
      this.$durationDropdown = this.$el.find('#workflow-duration');
      this.$workflowDropdown = this.$el.find('#workflowTypeDropdown');
      this.$orderDropDown = this.$el.find('#workflow-order');
      this.$participantsNameInput = this.$el.find('#workflow-participants');
      this.$sliderContainer = this.$el.find('#slider-container');

      this.participantsNameTagit    = new Tagit('#workflow-participants', { afterTagAdded: validation, afterTagRemoved: validation });

      this.workflowExistView = new WorkflowsExistView();
    },

    render: function () {

    },

    createWorkflow: function() {
      var workflowData = this._getNewWorkflowData(),
          addTag = this.addTag.bind(this);

      $.ajax({
        type: 'post',
        url: Backbone.siteRootUrl + 'participant/CreatNewWorkflow',
        data: JSON.stringify(workflowData),
        contentType: 'application/json; charset=utf-8',
      }).done(function (data) {
        PageAlert.success(data.workflow.workflowName + ' workflow created successfully');
        $('#toggle-form-btn').trigger('click');
        addTag(workflowData);
      }).fail(function (err) {
        PageAlert.error(err.message);
      });
    },

    addTag: function(data) {
      var template = _.template(WorkflowItemTemplate);
      var tagHtml = template(data);
      this.workflowExistView.addListTag(tagHtml, data.orderIndex);
    },

    _getNewWorkflowData: function() {
      var
        incidentId = Backbone.incident.incidentId,
        workflowTypeId = this.$workflowDropdown.val(),
        workflowName = this.$workflowDropdown.find(":selected").text(),
        duration = this.$durationDropdown.val(),
        alertThreshold = this.$alertThresholdDropdown.val(),
        orderIndex = this.$orderDropDown.val();
        participants = $('#workflow-participants').val();

      return {
        incidentId: incidentId, workflowTypeId: workflowTypeId, workflowName: workflowName, duration: duration,
        alertThreshold: alertThreshold, participants: participants, orderIndex: orderIndex
      };

    },

    displayWorkflowDetail: function(e) {
      e.preventDefault();
    },

    toggleForm: function (e) {
      var $btn = $(e.target);
      if ($btn.html() === 'Cancel') {
        Animation.toggleUp('#new-workflow-form');
        $btn.html('New Step');
        $btn.addClass('green-btn');
        $btn.removeClass('blue-btn')
      } else {
        Animation.toggleDown('#new-workflow-form');
        $btn.html('Cancel');
        $btn.removeClass('green-btn');
        $btn.addClass('blue-btn')
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
        updateDropdown = this.updateDropdown.bind(this),
        $durationDropdown = this.$durationDropdown,
        $alertThresholdDropdown = this.$alertThresholdDropdown,
        $orderDropDown = this.$orderDropDown,
        selectedValue = Number(this.$workflowDropdown.val()),
        dropdownMax, duration, alertThreshold;

      if (selectedValue !== -1) {
        $.ajax({
          url: Backbone.siteRootUrl + 'postmortem/getworkflowinfo',
          type: 'post',
          data: {
            incidentId: Backbone.incident.incidentId,
            workflowTypeId: selectedValue
          },
          success: function (result) {
            duration = result.duration;
            alertThreshold = result.alertThreshold;
            dropdownMax = duration + 10;
            participantsNameTagit.update(result.participants);
            updateDropdown($durationDropdown, dropdownMax, duration);
            updateDropdown($alertThresholdDropdown, duration, alertThreshold);
            $orderDropDown.removeAttr('disabled');
          },
          error: function (err) {
            throw new Error(err.message);
          }
        });

      }
    },

    updateDropdown: function (elem, max, select) {
      var $elem = $(elem),
          index;
      $elem.empty();
      for (index = 1; index <= max; index++) {
        $elem.append('<option value="' + index + '">' + index + '</option>');
      }
      $elem.val(select);
      $elem.removeAttr('disabled');
    },

    showNotEditableWarning: function () {
      PageAlert.warning('You can not edit steps already completed.')
    }

  });

  return WorkflowsView;
});