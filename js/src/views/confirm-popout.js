define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/confirm-popout-template.html'
], function ($, _, Backbone, ConfirmPopoutTemplate) {

  var ConfirmPopoutView = Backbone.View.extend({

    el: '#confirm-popout-container',

    attributes: {
      expand: false
    },

    events: {
      'click #popout-cancel-btn': 'cancel',
      'click #popout-confirm-btn': 'confirm',
    },

    initialize: function () {
    },

    render: function () {
      var template = _.template(ConfirmPopoutTemplate);
      this.$el.html(template(this.model));
      this.$el.fadeIn('fast');
    },

    confirm: function (e) {
      $(e.target).attr('disabled', 'true');
      var model = this.model,
          cb = model.submitCallback,
          context = model.context;
      if (typeof cb === 'function') cb.call(context);
      this.$el.fadeOut('fast');
    },

    cancel: function () {
      this.$el.fadeOut('fast');
    }
  });

  return ConfirmPopoutView;
});