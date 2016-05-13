﻿define([
  'jquery',
  'underscore',
  'backbone',
  '../common',
  './components/navigation',
  './confirm-popout',
  './email-popout',
  '../utils/email-service',
  '../utils/animation'
], function (
  $, _, Backbone,
  common,
  Navigation,
  ConfirmPopoutView,
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
    },

    initialize: function () {
      this.pageNav = new Navigation({ model: this.navTags });
      this.popout = new ConfirmPopoutView();
      var toggleComponents = this.toggleComponents.bind(this);
      $(window).scroll(toggleComponents)
    },

    render: function () {
      this.pageNav.render();
      this.popout.render();
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
      this.popout.render();
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
      
      emailPopout = new EmailPopoutView({
        model: {
          emailService: emailService,
          incidentId: incidentId,
          workflowTypeId: workflowTypeId
        }
      });
    },

    _getEmailService: function (controller, action) {
      return new EmailService(controller, action);
    },


  });

  return PostMortemView;

});