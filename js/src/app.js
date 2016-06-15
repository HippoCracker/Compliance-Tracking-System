define([
  'jquery',
  'underscore',
  'backbone',
  './views/post-mortem',
  './views/workflows'
], function ($, _, Backbone, PostMortemView, WorkflowsView) {

  function init () {
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
  }

  function route() {
    var href = window.location.href.toLowerCase();

    if (href.indexOf('postmortem') >= 0) {
      var postMortem = new PostMortemView();
      postMortem.render();
    } else if (href.indexOf('participant') >= 0) {
      var workflows = new WorkflowsView();
      workflows.render();
    }
  }

  var initialize = function () {
    init();
    route();
  };

  

  return {
    initialize: initialize
  };
});