define([
  'jquery',
  'underscore',
  'backbone',
  './email-popout',
  '../utils/email-service',
  '../utils/animation',
  '../utils/custom-tagit',
], function ($, _, Backbone, EmailPopoutView, EmailService, Animation, Tagit) {

  var PopoutView = Backbone.View.extend({

    el: '#confirm-popout-container',

    events: {
      'click #popout-cancel-btn'          : 'hidePopout',
      'click #popout-submit-btn'          : 'sendReviewCompleteRequest',
      'click #create-workflow-btn' : 'createWorkflow',
      'change .workflow-radio'            : 'switchActiveTag',
      'change #workflowTypeDropdown'      : 'changeUIAndFetchParticipants',
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
      this.participantsTagit = new Tagit('#workflow-participants');
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
        this.participantsTagit.disable();
        this.$createWorkflowBtn.attr('disabled', 'true');
      } else {
        this.participantsTagit.enable();
        this.participantsTagit.update();
        this.$createWorkflowBtn.removeAttr('disabled');
      }
    },

    fetchParticipantsData: function () {
      var participantsTagit = this.participantsTagit;
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
            participantsTagit.clear();
            var participants = result.split(',');
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

    changeUIAndFetchParticipants: function () {
      this.fetchParticipantsData();
      this.changeFormUI();
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