define([
  'jquery',
  'underscore',
  'backbone',
  '../utils/animation',
], function ($, _, Backbone, Animation) {

  var PopoutView = Backbone.View.extend({

    el: '#confirm-popout-container',

    events: {
      'click #popout-cancel-btn'          : 'hidePopout',
      'click #display-email-popout-btn'   : 'hidePopout',
      'click #popout-submit-btn'          : 'sendReviewCompleteRequest',
      'click #select-all-checkbox'        : 'toggleRecevierCheckbox',
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
      this.$alertMessage = $('#alert-message');
      this.workflowRadioBtns = this.$el.find('.workflow-radio');
      this.workflowForm = this.$el.find('#new-workflow-settings-form');
      this.emailPopoutBtn = document.getElementById('display-email-popout-btn');
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
      var selectedValue = Number(this.$workflowDropdown.val());
      var inputTxt = $('#workflow-participants');
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
            inputTxt.removeAttr('disabled');
            inputTxt.val(result);
          },
          error: function (e) {
            console.log("error");
            console.log(e);
          }
        });
      } else {
        inputTxt.val('');
        inputTxt.attr('disabled', 'true');
      }
    },

    changeUIAndFetchParticipants: function () {
      this.changeFormUI();
      this.fetchParticipantsData();
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
      $.ajax({
        type: "POST",
        url: Backbone.siteRootUrl + "PostMortem/ReviewComplete",
        data: { incidentId: Backbone.incident.incidentId },
        dataType: 'json',
        success: function (result) {
          if (result.err !== void 0) {
            alert(result.err);
          }
          if (result.isWorkingGroup) {
            showEmailPopup("ComposeIncidentReviewCompleteEmail");
          }
          window.location.reload();
        }
      });
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
    }

  });

  return PopoutView;
});