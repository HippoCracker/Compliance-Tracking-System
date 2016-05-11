define([
  'jquery',
  'underscore',
  'backbone',
], function ($, _, Backbone) {

  var navigationComponent = Backbone.View.extend({

    el: 'nav.navigation',

    template: $('<ul></ul>'),

    childTemplate: _.template('<li><a class="nav-item" href="<%= tagId %>"><%= name %></a></li>'),

    events: {
      'click .nav-item': 'navigateTo',
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      var allTags = [],
          model = this.model,
          childTemplate = this.childTemplate,
          tag, content;
      _.each(model, function (value, index) {
        tag = childTemplate(value);
        allTags.push(tag);
      })
      content = this.template.append(allTags.join(''));
      this.$el.html(content);
      return this;
    },

    updateActiveItem: function(tagId) {
      var index, previousIndex;
      index = _.findIndex(this.$items, function (item) {
        return $(item).attr('href') === tagId;
      });
      if (index > 0) {
        previousIndex = this.activeIndex;
        this.activeIndex = index;
        this.$items[previousIndex].removeClass('active');
        this.$items[this.activeIndex].addClass('active');
      }
    },

    navigateTo: function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $element = $(e.target),
          target = $element.attr('href');
      $(target).velocity('scroll', {
        duration: 500,
        offset: -140,
        easing: 'ease-in-out'
      });
      this._resetActiveItem($element);
    },

    _resetActiveItem: function ($element) {
      if (this.$activeElement !== void 0) {
        this.$activeElement.removeClass('active');
      }
      $element.addClass('active');
      this.$activeElement = $element;
    },

  });

  return navigationComponent;
});