define([
  'jquery',
  'underscore',
  'backbone',
  './views/post-mortem'
], function ($, _, Backbone, PostMortemView) {

  var initialize = function () {
    Backbone.siteRootUrl = $('#site-root-url').attr('data-root-url');
    Backbone.incidentId = Number($("#IncidentId").val());
    Backbone.workflowTypeId = Number($("#WorkflowTypeId").val());

    var postMortem = new PostMortemView();
    postMortem.render();
  };

  return {
    initialize: initialize
  };
});