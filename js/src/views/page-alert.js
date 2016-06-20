define([
  'jquery',
  'underscore',
  'backbone',
  '../utils/animation',
], function ($, _, Backbone, Animation) {

  var PageAlertView = Backbone.View.extend({

    el: '#page-level-alert',

    initialize: function() {

    },

    render: function (statusClass, message, duration) {
      var toggle = this.toggle.bind(this),
          toggleUp = _.partial(toggle, 'up');

      if (typeof duration !== 'number') {
        duration = 3000;
      }

      this.$el.attr('class', 'page-level-alert ' + statusClass);
      this.$el.html(message);
      this.toggle(true);
      setTimeout(toggleUp, duration);
    },

    success: function(message) {
      var statusClass = 'success';
      this.render(statusClass, message);
    },

    error: function (message) {
      var statusClass = 'danger';
      this.render(statusClass, message, 5000);
    },

    warning: function(message) {
      var statusClass = 'warning';
      this.render(statusClass, message);
    },

    toggle: function (dir) {
      var $el = this.$el;
      if (dir === 'up') {
        Animation.toggleUp($el);
      } else {
        Animation.toggleDown($el);
      }
    },

  })

  return new PageAlertView;
});