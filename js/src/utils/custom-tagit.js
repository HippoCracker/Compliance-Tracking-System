define([
  'jquery',
  'underscore',
  'backbone',
   'jquery.ui.tagit'
], function ($, _, Backbone) {

  var CustomTagit = function (elem, context) {
    this.el = elem;
    this.context = context;
  };

  _.extend(CustomTagit.prototype, {

    

    update: function (values) {
      var $el = this.$el;

      $el.tagit('remove');
      values = result.split(',');

      _.each(values, function (value) {
        $el.tagit('createTag', value);
      });
    },

  });

  return CustomTagit;
});