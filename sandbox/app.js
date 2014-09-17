(function() {
  var myApp;

  console.log('init');

  myApp = window.myApp = angular.module('myApp', [
    //'af.httpInterceptor',
    //'af.authManager', 'af.api', 'af.java', 'af.node', 'af.config', 'af.event', 'af.loader',
    //'af.modal', 'af.msg', 'af.storage', 'af.apply', 'af.sentry', 'af.track', 'af.util', 'af.bsIcons'
  ]);

  myApp.config(function($httpProvider){
    console.log('config');
    $httpProvider.interceptors.push('httpInterceptor');
  });

  myApp.controller('AppCtrl', function($scope, $http) {
    console.log('AppCtrl');
    $http.get('meow', {ignoreExceptions:true}).error(function(params){
      alert('override')
    })

  });

}).call(this);
