define([
  'jquery',
  'underscore',
  'backbone',
  'velocity'
], function ($, _, Backbone, Velocity) {

  var Animation = function () {
    this.reverseCache = {};
  }

  Animation = _.extendOwn(Animation, {

    slide: function (direction, elem, options) {
      if (elem && direction) {
        $(elem).velocity('slide' + direction, options);
      }
    },

    scrollTo: function (elem, options) {
      if (!elem) return;
      $(elem).velocity('scroll', options);
    },

    move: function (elem, options) {
      if (elem && options) {
        $(elem).velocity(options);
      }
    },

    dimension: function(elem, options) {
      if (elem && options) {
        $(elem).velocity(options);
      }
    },

    toggle: function(button, toggleSelector, options) {
      var $btn = $(button), options;
      if (!options) {
        options = { duration: 600, easing: 'ease-in-out' };
      }
      if ($btn.hasClass('active')) {
        this.toggleUp(toggleSelector, options);
        $btn.removeClass('active');
      } else {
        this.toggleDown(toggleSelector, options);
        $btn.addClass('active');
      }
    },

    toggleUp: function(selector, options) {
      var $elem = $(selector);
      $elem.velocity('slideUp', options);
    },

    toggleDown: function (selector, options) {
      var $elem = $(selector);
      $elem.velocity('slideDown', options);
    },

    reverse: function (elem) {
      if (!elem) return;
      $(elem).velocity('reverse');
    }
  });

  return Animation;
});