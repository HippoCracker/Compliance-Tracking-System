define([
  'jquery',
  'underscore',
  'backbone',
  '../models/workflow'
], function ($, _, Backbone, WorkflowModel) {

  WorkflowsCollection = Backbone.Collection.extend({

    model: WorkflowModel,

    url: '/postmortem/GetAllWorkflowData'

  })

  return WorkflowsCollection;
});