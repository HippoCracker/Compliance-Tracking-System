require.config({
  baseUrl: window.baseSiteUrl + 'Scripts/post-mortem/',
  paths: {
    'underscore': 'libs/underscore/underscore-debug',
    'backbone': 'libs/backbone/backbone-debug',
    'jquery': 'libs/jquery/2.2.3/jquery-debug',
    'velocity': 'libs/velocity/velocity',
    'date-format': 'libs/date-format/date.format',
    'text': 'libs/text/text',


    'jquery.ui.tagit': 'libs/tag-it/tag-it-debug',
    //'jquery.ui.datepicker': 'libs/jquery-ui/datepicker',
    'jquery.ui.widget': 'libs/jquery-ui/widget',
    //'jquery.ui.slider': 'libs/jquery-ui/slider',
    //'jquery.ui.mouse': 'libs/jquery-ui/mouse',
    //'jquery.ui.keycode': 'libs/jquery-ui/keycode',
    //'jquery.ui.version': 'libs/jquery-ui/version',

  },

  shim: {
    'jquery.ui.tagit': ['jquery.ui.widget', 'jquery.ui.version'],
    'jquery.ui.mouse': ['jquery.ui.widget', 'jquery.ui.version'],
    //'jquery.ui.slider': ['jquery', 'jquery.ui.mouse', 'jquery.ui.keycode', 'jquery.ui.version', 'jquery.ui.widget']
  }

});

require(['jquery', 'src/app'], function ($, App) {
  // Avoid jQuery conflict when import multiple version.
  // Use jQuery import by requirejs.
  var j = jQuery.noConflict(true);

  App.initialize();
});