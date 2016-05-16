define([
  'jquery',
  'underscore',
  'backbone',
  './email-popout',
  '../utils/email-service',
  '../utils/animation',
   'jquery.ui.tagit'
], function ($, _, Backbone, EmailPopoutView, EmailService, Animation) {

  var PopoutView = Backbone.View.extend({

    el: '#confirm-popout-container',

    events: {
      'click #popout-cancel-btn'          : 'hidePopout',
      'click #display-email-popout-btn'   : 'hidePopout',
      'click #popout-submit-btn'          : 'sendReviewCompleteRequest',
      'click #select-all-checkbox': 'toggleRecevierCheckbox',
      'click #create-workflow-btn' : 'createWorkflow',
      'change .workflow-radio'            : 'switchActiveTag',
      'change .send-email-checkbox'       : 'toggleSendEmailBtn',
      'change #workflowTypeDropdown'      : 'changeUIAndFetchParticipants',
      'change #change-workflow-checkbox'  : 'toggleWorkflowSection',
    },

    initialize: function () {
      this.$cancelBtn = $('#popout-cancel-btn');
      this.$submitBtn = $('#popout-submit-btn');
      this.$createWorkflowBtn = $('#create-workflow-btn');
      this.$nextWorkflowCheckbox = $('#change-workflow-checkbox');
      this.$workflowDropdown = $('#workflowTypeDropdown');
      this.workflowRadioBtns = this.$el.find('.workflow-radio');
      this.workflowForm = this.$el.find('#new-workflow-settings-form');
      this.emailPopoutBtn = document.getElementById('display-email-popout-btn');
      this.$participantNameTxt = $('#workflow-participants');
      this.$participantNameTxt.tagit();
    },

    render: function () {
      this.showPopout();
    },

    hidePopout: function () {
      this.$el.fadeOut("fast");
    },

    showPopout: function () {
      this.$el.fadeIn("fast");
    },

    switchActiveTag: function (e) {
      var btns = this.workflowRadioBtns,
          clickedBtn = e.target;

      _.each(btns, function (btn) {
        $(btn).next('label.active').removeClass('active');
      });
      $(clickedBtn).next('label').addClass('active');

      if (clickedBtn.id === 'create-workflow-radio') {
        Animation.slide('Down', this.workflowForm, { duration: 400, easing: 'ease-in-out' });
        Animation.move('#popout-window', { top: 0 });
        this.$submitBtn.attr('disabled', 'true');
      } else {
        Animation.slide('Up', this.workflowForm, { duration: 400, easing: 'ease-in-out' });
        Animation.reverse('#popout-window');
        this.$submitBtn.removeAttr('disabled');
      }
    },

    changeFormUI: function () {
      var selectedValue = Number(this.$workflowDropdown.val());
      if (selectedValue === -1) {
        this.$createWorkflowBtn.attr('disabled', 'true');
      } else {
        this.$createWorkflowBtn.removeAttr('disabled');
      }
    },

    fetchParticipantsData: function () {
      var $participantNameTxt = this.$participantNameTxt;
      var selectedValue = Number(this.$workflowDropdown.val());
      
      if (selectedValue !== -1) {
        $.ajax({
          url: Backbone.siteRootUrl + 'postmortem/getparticipants',
          type: 'post',
          data: {
            incidentId: Backbone.incident.incidentId,
            workflowTypeId: selectedValue
          },
          success: function (result) {
            console.log("success");
            console.log(result);
            $participantNameTxt.removeAttr('disabled');

            $participantNameTxt.tagit('removeAll');
            var participants = result.split(',');
            _.each(participants, function (participant) {
              $participantNameTxt.tagit('createTag', participant);
            });

          },
          error: function (e) {
            console.log("error");
            console.log(e);
          }
        });

      } else {
        $inputTxt.val('');
        $inputTxt.attr('disabled', 'true');
      }
    },

    changeUIAndFetchParticipants: function () {
      this.fetchParticipantsData();
      this.changeFormUI();
    },

    toggleWorkflowSection: function () {
      if (this.$nextWorkflowCheckbox.is(':checked')) {
        Animation.slide('Down', '#next-workflow-section', { duration: 400, easing: 'ease-in-out' });
      } else {
        $('#next-workflow-radio').trigger('click');
        Animation.slide('Up', '#next-workflow-section', { duration: 400, easing: 'ease-in-out' });
      }
    },

    sendReviewCompleteRequest: function () {
      var isMoveWorkflow = this.$nextWorkflowCheckbox.is(':checked'),
          successCallback = this.successReviewComplete.bind(this);
      $.ajax({
        type: "POST",
        url: Backbone.siteRootUrl + "PostMortem/ReviewComplete",
        data: { incidentId: Backbone.incident.incidentId, isMoveWorkflow: isMoveWorkflow },
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

    toggleSendEmailBtn: function () {
      var length = this.$el.find('.send-email-checkbox:checked').length;
      if (length === 0) {
        this.emailPopoutBtn.setAttribute('disabled', 'true');
      } else {
        this.emailPopoutBtn.removeAttribute('disabled');
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

    createWorkflow: function () {
      var workflowTypeId = $(this.workflowForm).find('#workflowTypeDropdown').val(),
          participantsIdentity = $(this.workflowForm).find('#workflow-participants').val(),
          callback = this.displayAlert.bind(this),
          incident = Backbone.incident,
          result;

      $.ajax({
        type: 'post',
        url: Backbone.siteRootUrl + 'PostMortem/CreatNewWorkflowAsNext',
        data: JSON.stringify({
          incidentId: incident.incidentId,
          workflowTypeId: workflowTypeId,
          participants: participantsIdentity
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