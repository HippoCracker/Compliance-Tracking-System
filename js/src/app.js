define([
  'jquery',
  'underscore',
  'backbone',
  './views/post-mortem'
], function ($, _, Backbone, PostMortemView) {

  var initialize = function () {
    Backbone.siteRootUrl = $('#site-root-url').attr('data-root-url');

    var incident = {
      incidentId: Number($("#IncidentId").val()),
      workflowTypeId: Number($("#WorkflowTypeId").val())
    };

    var $infoTag = $('#visit-user-info');
    var user = {
      name: $infoTag.attr('data-username'),
      emailAddress: $infoTag.attr('data-email-address')
    }
    Backbone.incident = incident;
    Backbone.user = user;

    var postMortem = new PostMortemView();
    postMortem.render();
  };

  return {
    initialize: initialize
  };
});