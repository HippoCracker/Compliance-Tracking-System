define([
  'jquery',
  'underscore',
  'backbone',
   'jquery.ui.tagit'
], function ($, _, Backbone) {

  var CustomTagit = function (elem, options) {
    this.$elem = $(elem);
    this.$elem.tagit(options);
  };

  _.extend(CustomTagit.prototype, {

    add: function (values) {
      if (values && typeof values === 'string') {
        this._addValueToTag(values);
      }
    },

    _addValueToTag: function(values) {
      var $elem = this.$elem;

      values = values.split(',');
      _.each(values, function (value) {
        $elem.tagit('createTag', value);
      });

    },
  });

  return CustomTagit;
});