define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/email-popout.html'
], function ($, _, Backbone, emailPopoutTemplate) {

  var EmailPopout = Backbone.View.extend({

    el: '#email-popout-container',

    template: _.template(emailPopoutTemplate),

    events: {
      'click #popout-cancel-btn': 'hidePopout',
      'click #popout-submit-btn': 'sendEmail',
    },

    initialize: function () {

    },

    render: function () {
      this.$el.html(this.template(this.model));
      console.log(this.model);
      this.showPopout();
    },

    hidePopout: function () {
      this.$el.fadeOut("fast");
    },

    showPopout: function () {
      this.$el.fadeIn("fast");
    },



  })

  return EmailPopout;
});