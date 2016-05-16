require.config({
  baseUrl: '/Scripts/post-mortem/',
  paths: {
    'underscore': 'libs/underscore/underscore-debug',
    'backbone': 'libs/backbone/backbone-debug',
    'jquery': 'libs/jquery/2.2.3/jquery-debug',
    'jquery.ui.widget': 'libs/jquery-ui/widget',
    'jquery.ui.tagit' : 'libs/tag-it/tag-it-debug',
    'velocity': 'libs/velocity/velocity',
    'text': 'node_modules/text/text'
  },

  shim: {
    'jquery.ui.tagit': ['jquery.ui.widget'],
  }

});

require(['jquery', 'src/app'], function ($, App) {
  var j = jQuery.noConflict(true);

  App.initialize();
});