﻿define([
  'jquery',
  'underscore',
  'backbone',
  '../common',
  './components/navigation',
  './next-workflow-popout',
  './email-popout',
  './confirm-popout',
  './page-alert',
  '../utils/email-service',
  '../utils/animation',
], function (
  $, _, Backbone,
  common,
  Navigation,
  NextWorkflowPopoutView,
  EmailPopoutView,
  ConfirmPopoutView,
  PageAlert,
  EmailService,
  Animation) {

  PostMortemView = Backbone.View.extend({

    el: '#post-mortem-app',

    navTags: [
      { tagId: '#overview', name: 'Overview' },
      { tagId: '#explanation', name: 'Explanation' },
      { tagId: '#action', name: 'Action' },
      { tagId: '#prevention', name: 'Prevention' },
      { tagId: '#reporting', name: 'Reporting' },
    ],

    events: {
      'click .backtop-btn'    : 'scrollToTop',
      'click #show-popout-btn': 'showPopout',
      'click .edit-btn'       : 'submitEditForm',
      'click .email-reminder-btn': 'displayEmailPopout',
      'click .email-lastcall-btn': 'displayEmailPopout',
      'click #show-status-details-btn': 'showStagesDetail',
      'click .close-status-detail-btn': 'hideStagesDetail',
      'click .open-incident-btn': 'openIncident'
    },

    initialize: function () {
      var toggleComponents = this.toggleComponents.bind(this);
      this.pageNav = new Navigation({ model: this.navTags });
      this.$showStagesDetailBtn = $('#show-status-details-btn');
      $(window).scroll(toggleComponents)

      var $workflowContainer = $(".case-status-text");
      if ($workflowContainer.length > 0) {
        Animation.toggleDown('.case-status-process');
        $workflowContainer.hover(
          function () {
            $dropdown = $(this).find(".case-status-detail-wrapper");
            $dropdown.show();
            var width = $dropdown.width();
            var defaultOffsetLeft = $(document).width() - width - 100;
            var offset = $dropdown.offset();
            if (offset != void 0 && offset.left > defaultOffsetLeft) {
              $dropdown.offset({ left: defaultOffsetLeft });
            }
          },
          function () {
            $(this).find(".case-status-detail-wrapper").hide();
          }
        );
        this.resizeProgressBar();
      }
     
      this._initPopout();
    },

    render: function () {
      this.pageNav.render();
    },

    _initPopout: function () {
      this.submitPopout = new NextWorkflowPopoutView();

      // Open Incident Popout
      var incidentId = Backbone.incident.incidentId,
          cb = this._openIncident
      var model = {
        title: 'Open Incident',
        message: 'Are you sure open incident with ID: ' + incidentId,
        submitBtnName: 'Open',
        cancelBtnName: 'Cancel',
        submitCallback: cb,
        context: this
      };
      this.openIncidentPopout = new ConfirmPopoutView({ model: model });
    },

    submitEditForm: function() {
      $('#EditForm').submit();
    },

    scrollToTop: function () {
      var el = this.el;
      Animation.scrollTo(el, { duration: 600, offset: -100, easing: 'ease-in-out' });
    },

    toggleComponents: function () {
      this.toggleSideMenu();
    },

    toggleSideMenu: function () {
      var $backtopBtn = $('#backtop-btn-container'),
          $pageNav = $('#side-nav-container'),
          scrollHeight = $(window).scrollTop();
      if (scrollHeight > 300) {
        $backtopBtn.fadeIn(400);
        $pageNav.addClass('active');
      } else if (scrollHeight <= 300) {
        $backtopBtn.fadeOut(400);
        $pageNav.removeClass('active');
      }
    },

    showPopout: function () {
      this.submitPopout.render();
    },

    displayEmailPopout: function (e) {
      delete this.emailPopout;

      var incidentId = Backbone.incident.incidentId,
          workflowTypeId = Backbone.incident.workflowTypeId,
          emailService, emailPopout;
        
      if (Backbone.incident.workflowTypeId === common.WORKFLOW_TYPE.WorkingGroup) {
        emailService = this._getEmailService('email', 'ComposeLastCallEmail');
      } else {
        emailService = this._getEmailService('email', 'ComposeReminderEmail');
      }
      
      this.emailPopout = new EmailPopoutView({
        model: {
          emailService: emailService,
          data: {
            incidentId: incidentId,
            workflowType: workflowTypeId
          }
        }
      });
    },

    _getEmailService: function (controller, action) {
      return new EmailService(controller, action);
    },

    showStagesDetail: function () {
      var $btn = this.$showStagesDetailBtn;
      Animation.toggle($btn, '#status-detail-toggle-wrapper');
    },

    hideStagesDetail: function (e) {
      var $btn = this.$showStagesDetailBtn;
      $btn.trigger('click');
      $('#close-status-detail-container').css('top', -40);
    },

    openIncident: function (e) {
      this.openIncidentPopout.render();
    },

    _openIncident: function () {
      var incidentId = Backbone.incident.incidentId,
          url = Backbone.siteRootUrl + common.CONTROLLER_ACTION.OpenIncident;

      $.ajax({
        type: "POST",
        url: url,
        data: { incidentId: incidentId },
        dataType: 'json',
        success: function (data) {
          window.location.reload();
        },
        error: function (err) {
          PageAlert.error("Error! " + err.responseText);
          $('.open-incident-btn').removeAttr('disabled');
        }
      });
    },

    resizeProgressBar: function() {
      var
        $container = $('#progressbar-item-container'),
        $progressBarTop = $("#process-top-layer"),
        $progressBarBottom = $("#process-bottom-layer"),
        $currentStatus = $(".status-current"),
        $doneStatus = $(".case-status-text.status-done"),
        stages = $container.find(".case-status-text"),
        counter = 0,
        $stage, totalWidth, stageWidth, topBarWidth, left;

      totalWidth = $container.width();
      stageWidth = (100 / stages.length) + '%';

      for (var i = 0; i < stages.length; i++) {
        $stage = $(stages[i]);
        $stage.width(stageWidth);
        if ($stage.hasClass("status-done"))
          counter++;
      }
      if ($stage !== void 0) {
        topBarWidth = $stage.width() * ($doneStatus.length == stages.length ? counter - 1 : counter) + '%';
        left = ($stage.width() / 2) + '%';
        $progressBarTop.width(topBarWidth);
        $progressBarTop.css('left', left);
        $progressBarBottom.css('left', left);
        $progressBarBottom.width($stage.width() * (stages.length - 1));
      }
    }


  });

  return PostMortemView;

});