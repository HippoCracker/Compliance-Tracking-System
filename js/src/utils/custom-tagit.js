define([
  'jquery',
  'underscore',
  'backbone',
   'jquery.ui.tagit'
], function ($, _, Backbone) {

  var CustomTagit = function (elem, options) {
    if (!options) options = {};
    if (!options.tagSource) {
      options.tagSource = this.getTagSource;
    }

    this.$elem = $(elem);
    this.$elem.tagit(options);
  };

  _.extend(CustomTagit.prototype, {
    disable: function() {
      $('.ui-autocomplete-input').prop('disabled', true).val('');
      $('.tagit-choice').remove();
      $('.ui-widget-content').css('opacity', '.2');
    },

    enable: function() {
      $('.ui-widget-content').css('opacity','1');
      $('.ui-autocomplete-input').prop('disabled', false); 
    },

    update: function() {
      var $elem = this.$elem,
          values = $elem.val();

      this._addValueToTag(values);
    },

    clear: function() {
      this.$elem.tagit('removeAll');
    },

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

    getTagSource: function (request, response) {
      var maxTags = this.maxTags || 50;
      $.ajax({
        type: "POST",
        url: Backbone.siteRootUrl + 'Email/FetchEmailList',
        data: "{'nameStartsWith': '" + extractLast(request.term) + "'}",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
          response($.map(data, function (item) {
            return {
              label: item,
              value: item
            };
          }));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          var err = jQuery.parseJSON(XMLHttpRequest.responseText);
          alert(err.Message);
        }
      }); 
    },


  });

  return CustomTagit;
});