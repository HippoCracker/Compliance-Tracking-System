define([
  'jquery',
  'underscore',
  'backbone',
  '../models/participant'
], function ($, _, Backbone, ParticipantModel) {

  ParticipantsCollection = Backbone.Collection.extend({

    model: ParticipantModel,

    count: function () {
      return this.length;
    },

  });

  return ParticipantsCollection;
});