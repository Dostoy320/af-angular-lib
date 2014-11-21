(function() {


  //
  // ANGULAR wrapper for appConfig
  //
  var myApp = angular.module('af.filters', []);

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

}).call(this);
