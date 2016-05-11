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

    reverse: function (elem) {
      if (!elem) return;
      $(elem).velocity('reverse');
    }
  });

  return Animation;
});