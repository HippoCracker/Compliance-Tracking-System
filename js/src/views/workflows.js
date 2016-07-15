define([
  'jquery',
  'underscore',
  'backbone',
  './_workflows-exist',
  '../utils/custom-tagit',
  '../utils/animation',
  './page-alert',
  'text!templates/workflow-item-template.html',
  '../common'
], function ($, _, Backbone, WorkflowsExistView, Tagit, Animation, PageAlert, WorkflowItemTemplate, common) {

  var WorkflowsView = Backbone.View.extend({

    el: '#workflows-app',

    events: {
      'click #toggle-form-btn': 'toggleForm',
      'click #create-workflow-btn': 'createWorkflow',
      'click .list-group-item': 'displayWorkflowDetail',
      'click .disable-mask': 'showNotEditableWarning',
      'change #workflow-type-dropdown': 'fetchWorkflowData',
      'change #workflow-order-dropdown': 'popoutWorkflowName'

    },

    initialize: function () {
      var closeTag = this.$el.find('.list-group-item').last();
      if ($(closeTag).hasClass('workflow-current')) {
        this.$el.find('#toggle-form-btn').attr('disabled', 'true');
      }

      var validation = this.validateUserInputs.bind(this);

      this.$showFormBtn         = this.$el.find('#show-form-btn');
      this.$createWorkflowBtn   = this.$el.find('#create-workflow-btn');
      this.$alertThresholdDropdown = this.$el.find('#alert-threshold');
      this.$durationDropdown = this.$el.find('#workflow-duration');
      this.$workflowDropdown = this.$el.find('#workflow-type-dropdown');
      this.$orderDropDown = this.$el.find('#workflow-order-dropdown');
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

      if (workflowData.participants.length == 0) {
        PageAlert.error("Please input Participants for new workflow");
        return;
      }

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
        PageAlert.error(err.responseText);
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
        workflowType = this.getWorkflowType(),
        duration = this.$durationDropdown.val(),
        alertThreshold = this.$alertThresholdDropdown.val(),
        orderIndex = this.$orderDropDown.val()
        participants = $('#workflow-participants').val(),
        workflowName = $('#workflow-name-input').val();

      return {
        incidentId: incidentId, workflowType: workflowType, workflowName: workflowName, duration: duration,
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

    fetchWorkflowData: function (e) {
      var selectedTag = $(e.target).find(':selected');
      if (selectedTag.text().toLowerCase().indexOf('none') >= 0) {
        this.$createWorkflowBtn.attr('disabled', 'true');
        return;
      } else {
        this.$createWorkflowBtn.removeAttr('disabled');
      }

      var
        participantsNameTagit = this.participantsNameTagit,
        updateDropdown = this.updateDropdown.bind(this),
        $durationDropdown = this.$durationDropdown,
        $alertThresholdDropdown = this.$alertThresholdDropdown,
        $orderDropDown = this.$orderDropDown,
        workflowTypeId = this.getWorkflowType(),
        dropdownMax, duration, alertThreshold;

      if (workflowTypeId > 0) {
        $.ajax({
          url: Backbone.siteRootUrl + 'participant/getworkflowinfo',
          type: 'post',
          data: {
            incidentId: Backbone.incident.incidentId,
            workflowType: workflowTypeId
          },
          success: function (result) {
            duration = result.duration || 3;
            alertThreshold = result.alertThreshold || 1;
            dropdownMax = duration + 10;
            participantsNameTagit.update(result.participants);
            updateDropdown($durationDropdown, dropdownMax, duration);
            updateDropdown($alertThresholdDropdown, duration, alertThreshold);
            $orderDropDown.removeAttr('disabled');
          },
          error: function (err) {
            PageAlert.error(err.responseText)
          }
        });

        this._popoutWorkflowName($(e.target).find(':selected'));
      }
    },

    getWorkflowType: function() {
      var workflowName = this.$workflowDropdown.find(':selected').text(),
          workflowTypeId = this.$workflowDropdown.val();

      if (workflowName.toLowerCase().indexOf('compliance') >= 0) {
        var orderIndex = this.$orderDropDown.val(),
            previousWorkflowName = this._getPreviousWorkflowName(orderIndex).toLowerCase();
        
        if (previousWorkflowName === 'working group') {
          workflowTypeId = common.WORKFLOW_TYPE.ComplianceReviewForWorkingGroup;
        } else if (previousWorkflowName === 'legal') {
          workflowTypeId = common.WORKFLOW_TYPE.ComplianceReviewForLegal;
        } else if (previousWorkflowName === 'cco') {
          workflowTypeId = common.WORKFLOW_TYPE.ComplianceReviewForCCO;
        } else if (previousWorkflowName === 'initiator') {
          workflowTypeId = common.WORKFLOW_TYPE.ComplianceReviewForInitiator;
        }
      } 
      return Number(workflowTypeId);
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

    popoutWorkflowName: function() {
      var selectedWorkflowTag = this.$workflowDropdown.find(':selected');
      this._popoutWorkflowName(selectedWorkflowTag);
    },

    _popoutWorkflowName: function(elem) {
      var name = $(elem).text(),
          orderIndex, previousWorkflowName, previousWorkflowTag, titleTag;
      if (name.toLowerCase().indexOf('compliance') >= 0) {
        orderIndex = this.$orderDropDown.val();
        previousWorkflowName = this._getPreviousWorkflowName(orderIndex);
        if (previousWorkflowName.length > 0 &&
            previousWorkflowName.toLowerCase().indexOf('compliance') === -1) {
          name += ' Review - ' + previousWorkflowName;
        }
      }
      this.$el.find('#workflow-name-input').val(name);
    },

    _getPreviousWorkflowName: function(currentOrderIndex) {
      previousWorkflowTag = this.$el.find('.list-group-item')[currentOrderIndex - 2];
      titleTag = $(previousWorkflowTag).find('.list-group-item-heading');
      return titleTag.text();
    },

    showNotEditableWarning: function () {
      PageAlert.warning('You can not edit steps already completed.')
    }

  });

  return WorkflowsView;
});