require.config({
  baseUrl: '/Scripts/post-mortem/',
  paths: {
    'underscore': 'libs/underscore/underscore-debug',
    'backbone': 'libs/backbone/backbone-debug',
    'jquery': 'libs/jquery/2.2.3/jquery-debug',
    'velocity': 'libs/velocity/velocity',
    'text': 'node_modules/text/text'
  },

});

require(['jquery', 'jquery.ui.widget', 'tagit', 'src/app'], function ($, widget, tagit, App) {
  App.initialize();
});