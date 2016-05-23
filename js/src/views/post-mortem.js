define([
  'jquery',
  'underscore',
  'backbone',
  '../common',
  './components/navigation',
  './next-workflow-popout',
  './email-popout',
  '../utils/email-service',
  '../utils/animation',
], function (
  $, _, Backbone,
  common,
  Navigation,
  NextWorkflowPopoutView,
  EmailPopoutView,
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
      'click .close-status-detail-btn': 'hideStagesDetail'
    },

    initialize: function () {
      var toggleComponents = this.toggleComponents.bind(this);
      this.pageNav = new Navigation({ model: this.navTags });
      this.$showStagesDetailBtn = $('#show-status-details-btn');
      $(window).scroll(toggleComponents)
    },

    render: function () {
      this.pageNav.render();
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
      var popout = new NextWorkflowPopoutView();
      popout.render();
      this.popout = popout;
    },

    displayEmailPopout: function (e) {
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
      Animation.toggle($btn, '#status-detail-toggle-wrapper', { duration: 600, easing: 'ease-in-out' });
    },

    hideStagesDetail: function (e) {
      var $btn = this.$showStagesDetailBtn;
      $btn.trigger('click');
      $('#close-status-detail-container').css('top', -20);
    }

  });

  return PostMortemView;

});