(function() {


//
// ANGULAR wrapper for appConfig
//
angular.module('af.filters', [])

  // plural filter for config
  .filter('plural', function($config) {
    return function(value){
      return appTenant.makePlural(value)
    }
  })

  // label filter
  .filter('label', function($config) {
    return function(path, makePlural){
      return appTenant.get(path, makePlural)
    }
  })

}).call(this);
