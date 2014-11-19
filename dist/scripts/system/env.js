(function() {


  //
  // ANGULAR wrapper for appEnv
  //

  var myApp = angular.module('af.env', []);
  myApp.service('$env', function($window, $filter) {
    return {
      isProd: function() {          appEnv.isProd() },
      isDev: function() {           appEnv.isDev() },
      isLocal: function() {         appEnv.isLocal() },
      subDomain: function() {       appEnv.subDomain() },
      subDomainClean: function() {  appEnv.subDomainClean() },
      env: function() {             appEnv.env() },
      tenant: function() {          appEnv.tenant() },
      index: function() {           appEnv.index() },
      app: function() {             appEnv.app() }
    };
  });

}).call(this);
