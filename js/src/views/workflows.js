define([
  'jquery',
  'underscore',
  'backbone',
  './_workflows-exist',
  '../utils/custom-tagit',
  '../utils/animation',
  './page-alert'
], function ($, _, Backbone, WorkflowsExistView, Tagit, Animation, PageAlert) {

  var WorkflowsView = Backbone.View.extend({

    el: '#workflows-app',

    events: {
      'click #toggle-form-btn': 'toggleForm',
      'click #create-workflow-btn': 'createWorkflow',
      'click .list-group-item': 'displayWorkflowDetail',
      'change #workflowTypeDropdown': 'fetchWorkflowData',

    },

    listItemTemplate: `<a href="#" class="list-group-item <%= className %>">
                         <h4 class="list-group-item-heading"><span class="index"><%= orderIndex %>.</span>@WorkflowName</h4>
                         <span class="hint"></span>
                         <input type="text" value="<%= participants %>">
                       </a>`,

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

      new WorkflowsExistView();
    },

    render: function () {

    },

    createWorkflow: function() {
      var
        workflowData = this._getNewWorkflowData(),
        locationFacade = {
          reload: window.navigate ?
                  window.navigate.bind(window, location.href) :
                  location.reload.bind(location)
        }

      $.ajax({
        type: 'post',
        url: Backbone.siteRootUrl + 'PostMortem/CreatNewWorkflow',
        data: JSON.stringify(workflowData),
        contentType: 'application/json; charset=utf-8',
      }).done(function (data) {
        PageAlert.success(data.workflow.workflowName + ' workflow created successfully');
        $('#toggle-form-btn').trigger('click');
        setTimeout(locationFacade.reload, 3000);
      }).fail(function (err) {
        PageAlert.error(err.message);
      });
    },

    _getNewWorkflowData: function() {
      var
        incidentId = Backbone.incident.incidentId,
        workflowTypeId = this.$workflowDropdown.val(),
        duration = this.$durationDropdown.val(),
        alertThreshold = this.$alertThresholdDropdown.val(),
        orderIndex = this.$orderDropDown.val();
        participants = $('#workflow-participants').val();

      return {
        incidentId: incidentId, workflowTypeId: workflowTypeId, duration: duration,
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
        $btn.html('New Workflow');
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

    //_sliderConfig: {
    //  range: true,
    //  min: 1,
    //  max: 14,
    //  step: 7,
    //  values: [2, 4],
    //  slide: function (event, ui) {
    //    console.log('sliding');
    //  }
    //}

  });

  return WorkflowsView;
});