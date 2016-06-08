define([
  'jquery',
  'underscore',
  'backbone',
  'velocity',
  './components/navigation',
  './components/progress-bar'
], function ($, _, Backbone, velocity, Navigation, ProgressBar) {

  PostMortemView = Backbone.View.extend({

    el: $(window),

    navTags: [
      { tagId: '#overview', name: 'Overview' },
      { tagId: '#explanation', name: 'Explanation' },
      { tagId: '#action', name: 'Action' },
      { tagId: '#prevention', name: 'Prevention' },
      { tagId: '#reporting', name: 'Reporting' },
    ],

    events: {
      'click #backtop-btn': 'scrollToTop',
      'scroll': 'toggleComponents',
    },

    initialize: function () {

      this.pageNav = new Navigation({ model: this.navTags });
      this.progressBar = new ProgressBar();
    },

    render: function () {
      this.pageNav.render();
      this.progressBar.render();
    },

    scrollToTop: function () {
      this.$el.velocity('scroll', {
        duration: 500,
        offset: -100,
        easing: 'ease-in-out'
      })
    },

    toggleComponents: function () {
      this.toggleSideMenu();

    },

    toggleSideMenu: function () {
      var $backtopBtn = $('#backtop-btn-container'),
          $pageNav = $('#page-nav'),
          scrollHeight = this.$el.scrollTop();
      if (scrollHeight > 300) {
        $backtopBtn.fadeIn(400);
        $pageNav.addClass('active');
      } else if (scrollHeight <= 300) {
        $backtopBtn.fadeOut(400);
        $pageNav.removeClass('active');
      }
    },




  });

  return PostMortemView;

});