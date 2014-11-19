(function() {


  //
  // ANGULAR wrapper for appConfig
  //
  var myApp = angular.module('af.config', []);

  // plural filter for config
  myApp.filter('plural', function($config) {
    return function(value){
      return appConfig.makePlural(value)
    }
  })

  // label filter
  myApp.filter('label', function($config) {
    return function(path, makePlural){
      return appConfig.get(path, makePlural)
    }
  })

  myApp.service('$config', function($window, $filter) {
    return {
      get: function(path, makePlural) {
        return appConfig.get(path, makePlural)
      }
    };
  });

}).call(this);
