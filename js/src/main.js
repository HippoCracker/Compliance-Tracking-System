require.config({
  baseUrl: '/Scripts/post-mortem/',
  paths: {
    underscore: 'libs/underscore/underscore-debug',
    backbone: 'libs/backbone/backbone-debug',
    jquery: 'libs/jquery/2.2.3/jquery-debug',
    velocity: 'libs/velocity/velocity',
    text: 'node_modules/text/text'
  }
});

require(['src/app'], function (App) {
  App.initialize();
});