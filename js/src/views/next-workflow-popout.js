define([
  'jquery',
  'underscore',
  'backbone',
  '../common',
  './email-popout',
  '../utils/email-service',
  '../utils/animation',
  '../utils/custom-tagit',
  'jquery.ui.datepicker',
  'date-format',
], function ($, _, Backbone, common, EmailPopoutView, EmailService, Animation, Tagit, dateFormat) {

  var PopoutView = Backbone.View.extend({

    el: '#confirm-popout-container',

    attributes: {
      expand: false
    },

    events: {
      'click #popout-cancel-btn'          : 'hidePopout',
      'click #popout-submit-btn'          : 'sendReviewCompleteRequest',
      'click #create-workflow-btn'        : 'createWorkflow',
      'click .workflow-radio'             : 'switchActiveTag',
      'change #workflowTypeDropdown': 'fetchWorkflowData',
      'keyup #workflow-end-date': 'validateUserInputs',
    },

    initialize: function () {
      var onSelectCallback = this.updateDuration.bind(this)

      this.$cancelBtn = $('#popout-cancel-btn');
      this.$submitBtn = $('#popout-submit-btn');
      this.$createWorkflowBtn = $('#create-workflow-btn');
      this.$nextWorkflowCheckbox = $('#change-workflow-checkbox');
      this.$workflowDropdown = $('#workflowTypeDropdown');
      this.workflowRadioBtns = this.$el.find('.workflow-radio');
      this.workflowForm = this.$el.find('#new-workflow-settings-form');
      this.emailPopoutBtn = document.getElementById('display-email-popout-btn');
      this.$participantsNameInput = $(this.workflowForm).find('#workflow-participants');
      this.$endDateInput = this.$el.find('#workflow-end-date');
      this.$alertThreshold = this.$el.find('#alert-threshold');
      this.$durationLabel = this.$el.find('#duration-label');
      this.participantsTagit = new Tagit('#workflow-participants',
        {
          afterTagRemoved: this.validateUserInputs.bind(this),
          afterTagAdded: this.validateUserInputs.bind(this)
        });

      this.$endDateInput.datepicker({
        minDate: new Date(),
        dateFormat: 'M. dd yy',
        onSelect: onSelectCallback
      });
    },

    render: function () {
      this.showPopout();
    },

    hidePopout: function () {
      this.$el.fadeOut();
    },

    showPopout: function () {
      this.$el.fadeIn();
    },

    updateDuration: function(date) {
      var duration = this.calculateDuration(date);
      this.updateDurationLabel(duration);
    },

    calculateDuration: function (date) {
      var date, diff;
      if (date && typeof date === 'string') {
        date = new Date(date);
      }
      return diff = date.getDate() - (new Date()).getDate() + 1;
    },

    updateDurationLabel: function(duration) {
      this.$durationLabel.html('Duration: ' + duration + (duration > 1 ? ' days.' : ' day'));
      this.updateAlertThresholdDropdown(duration);
    },

    updateAlertThresholdDropdown: function(duration) {
      var $alertThreshold = this.$alertThreshold,
          index;
      $alertThreshold.empty();
      for (index = 1; index <= duration; index++) {
        $alertThreshold.append('<option value="' + index + '">' + index + '</option>');
      }
      
    },

    switchActiveTag: function (e) {
      var btns = this.workflowRadioBtns,
          clickedBtn = e.target;

      _.each(btns, function (btn) {
        $(btn).next('label.active').removeClass('active');
      });
      $(clickedBtn).next('label').addClass('active');

      if (clickedBtn.id === 'create-workflow-radio') {
        this.expand();
      } else {
        this.fold();
      }
    },

    expand: function() {
      if (!this.attributes.expand) {
        Animation.slide('Down', this.workflowForm, { duration: 400, easing: 'ease-in-out' });
        Animation.move('#popout-window', { top: 60 });
        this.$submitBtn.attr('disabled', 'true');
        this.attributes.expand = true;
      }
    },

    fold: function () {
      if (this.attributes.expand) {
        Animation.slide('Up', this.workflowForm, { duration: 400, easing: 'ease-in-out' });
        Animation.move('#popout-window', { top: 120 });
        this.$submitBtn.removeAttr('disabled');
        this.attributes.expand = false;
      }
    },

    fetchWorkflowData: function () {
      var $endDateInput = this.$endDateInput,
          $alertThreshold = this.$alertThreshold,
          participantsTagit = this.participantsTagit,
          calculateDuration = this.calculateDuration,
          updateDurationLabel = this.updateDurationLabel.bind(this),
          updateDuration = this.updateDurationLabel.bind(this),
          updateAlertThresholdDropdown = this.updateAlertThresholdDropdown.bind(this),
          selectedValue = Number(this.$workflowDropdown.val()),
          endDate, formatEndDate, duration;
      
      if (selectedValue !== -1) {
        $.ajax({
          url: Backbone.siteRootUrl + 'postmortem/getparticipants',
          type: 'post',
          data: {
            incidentId: Backbone.incident.incidentId,
            workflowTypeId: selectedValue
          },
          success: function (result) {
            endDate = new Date(result.endDate);
            duration = calculateDuration(endDate);
            updateDurationLabel(duration);
            updateAlertThresholdDropdown(duration);
            $endDateInput.val(common.formatDate(endDate));
            $alertThreshold.val(result.alertThreshold);
            $alertThreshold.removeAttr('disabled');

            participantsTagit.clear();
            var participants = result.participants.split(',');
            _.each(participants, function (participant) {
              participantsTagit.add(participant);
            });
          },
          error: function (e) {
            console.log("error");
            console.log(e);
          }
        });

      } 
    },

    validateUserInputs: function () {
      var selectedValue = Number(this.$workflowDropdown.val()),
          isAllValid = true,
          endDateText = this.$endDateInput.val();

      if (selectedValue === -1) {
        this.participantsTagit.disable();
        isAllValid = false;
      } else {
        this.participantsTagit.enable();
        this.participantsTagit.update();
      }

      if (this.$participantsNameInput.val().length === 0) {
        isAllValid = false;
      }

      if (!endDateText || !Date.parse(endDateText)) {
        isAllValid = false;
      }

      if (isAllValid) {
        this.$createWorkflowBtn.removeAttr('disabled');
      } else {
        this.$createWorkflowBtn.attr('disabled', 'true');
      }
    },

    _isValidInputs: function() {
      var selectedValue = Number(this.$workflowDropdown.val());
      if (selectedValue === -1) {

      }
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
    },

    errorReviewComplete: function(err) {

    },

    createWorkflow: function () {
      var workflowTypeId = $(this.workflowForm).find('#workflowTypeDropdown').val(),
          participantsIdentity = this.$participantsNameInput.val(),
          endDate = this.$endDateInput.datepicker('getDate'),
          alertThreshold = this.$alertThreshold.find(':selected').val(),
          callback = this.displayAlert.bind(this),
          incident = Backbone.incident,
          result;

      $.ajax({
        type: 'post',
        url: Backbone.siteRootUrl + 'PostMortem/CreatNewWorkflowAsNext',
        data: JSON.stringify({
          incidentId: incident.incidentId,
          workflowTypeId: workflowTypeId,
          participants: participantsIdentity,
          endDate: endDate,
          alertThreshold: alertThreshold
        }),
        contentType: 'application/json; charset=utf-8',
      }).done(function (data) {
        callback(true, data);
      }).fail(function (err) {
        callback(false, err);
      });
    },

    displayAlert: function (success, data) {
      var alertClass, alertContent, nameTags, alertTag;

      if (success) {
        alertClass = 'alert alert-success';
        alertMessage = 'Create successfully. Next workflow will be <strong>' + data.workflow.workflowName + '</strong>.';

        nameTags = this.$el.find('.next-workflow-name');
        nameTags.html(data.workflow.workflowName);

        this.$createWorkflowBtn.attr('disabled', 'true');
        this.$submitBtn.removeAttr('disabled');
      } else {
        alertClass = 'alert alert-danger';
        alertMessage = '<strong>Error!</strong> ' + data.responseText;
      }

      alertTag = this.$el.find('#create-workflow-alert-message');
      alertTag.attr('class', alertClass);
      alertTag.html(alertMessage);

    },

  });

  return PopoutView;
});