define([
  'jquery',
  'underscore',
  'backbone',
  './views/post-mortem'
], function ($, _, Backbone, PostMortemView) {

  var initialize = function () {
    var postMortemView = new PostMortemView();
    postMortemView.render();
  };

  return {
    initialize: initialize
  };
});