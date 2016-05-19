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

    render: function () {
      var message = this.model.message,
          statusClass = this.model.statusClass;

      this.$el.attr('class', 'page-level-alert ' + statusClass);
      this.$el.html(this.model.message);
      setTimeout()
    },

    display: function () {
    }


  })

  return PageAlertView;
});