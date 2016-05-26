define([
  'jquery',
  'underscore',
  'backbone',
  '../utils/custom-tagit'
], function ($, _, Backbone, Tagit) {

  var WorkflowExistView = Backbone.View.extend({

    el: '#exist-workflow-container',

    tempate: `<a href="#" class="list-group-item <%= className %>">
                <h4 class="list-group-item-heading"><span class="index"><%= orderIndex %>.</span>@WorkflowName</h4>
                <span class="hint"></span>
                <input type="text" value="<%= participants %>">
              </a>`,

    events: {

    },

    initialize: function () {
      var participantNameInputTagit = new Tagit('.participant-name-input');
      this.$el.find('.ui-autocomplete-input').attr('placeholder', '+');
    },

    render: function () {

    },




  })

  return WorkflowExistView;
});