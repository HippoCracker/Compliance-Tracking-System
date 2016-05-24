define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {

  var WorkflowsView = Backbone.View.extend({

    el: '#workflows-app',

    events: {

    },

    initialize: function () {
      console.log("workflows view init");
    },

    render: function () {

    },


  })

  return WorkflowsView;
});