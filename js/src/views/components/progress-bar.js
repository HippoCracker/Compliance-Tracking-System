define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {

  var progressBarView = Backbone.View.extend({

    el: '#progress-bar',

    model: [
      {nameAbbr: 'C', name: 'Compliance'},
      {nameAbbr: 'I', name: 'Initiator'},
      {nameAbbr: 'WG', name: 'Working Group'},
      {nameAbbr: 'C', name: 'Compliance Review - Working Group'},
      {nameAbbr: 'L', name: 'Legal'},
      {nameAbbr: 'C', name: 'Compliance Review - Legal'},
      {nameAbbr: 'CCO', name: 'CCO'},
      {nameAbbr: 'C', name: 'Compliance Reivew - CCO'},
      {nameAbbr: 'C', name: 'Closed'},
    ],

    nodeTemplate: ' \
              <section class="node"> \
                <header><%= nameAbbr %></header> \
                <section class ="point"><i class="fa fa-circle"></i></section> \
                <section class ="line">------</section> \
                <footer></footer> \
              </section> \
              ',

    events: {
      'click .node': 'resetCurrentNode',
    },

    initialize: function () {

    },

    render: function () {
      var node,
          nodesHtml = [],
          nodeTemplate = this.nodeTemplate;
          model = this.model;
      _.each(model, function(value) {
        var nodeHtml = _.template(nodeTemplate)(value);
        nodesHtml.push(nodeHtml);
      });
      this.$el.html(nodesHtml.join(''));
      return this;
    },

    resetCurrentNode: function () {
      console.log("resetNode");
    }


  });

  return progressBarView;
});