(function() {

  var myApp;

  console.log('init');
  myApp = window.myApp = angular.module('myApp', [
    'ngSanitize',
    'af.httpInterceptor',
    'af.authManager', 'af.api', 'af.java', 'af.node', 'af.config', 'af.event', 'af.loader',
    'af.modal', 'af.msg', 'af.storage', 'af.apply', 'af.sentry', 'af.track', 'af.util', 'af.bsIcons'
  ]);

  myApp.config(function($httpProvider){
    console.log('config');
    $httpProvider.interceptors.push('httpInterceptor');
    $httpProvider.defaults.headers.common.Authorization = 'Bearer ' + (sessionStorage.oas_token ? sessionStorage.oas_token : '');
  });

  myApp.controller('AppCtrl', function($scope, java, $http, $timeout) {
    console.log('AppCtrl');
    /*
    $http({
        method:'POST',
        url:'/AuthService/login',
        headers:{'Content-Type': 'application/x-www-form-urlencoded'},
        data:$.param({
          password:'actiFoo123',
          username:'nate-alpha2'
        })'
      }
    )
    */
    var params = {
      username:'nate-alpha2',
      password:'actiFoo123'
    }

    var dataHolder = {}
    java.AuthService.login(params.username, params.password)
      // waits for login
      .success(function(data, status, headers, config){
        dataHolder.user = data
        console.log('Success1', dataHolder)
        // returning something here does not effect the rest of the chain in any way
        return java.AuthService.getuserfromuserid(dataHolder.user.userId, dataHolder.user.sessionToken)
          .success(function(data){
            console.log('Success2', dataHolder)
          })
      })
      // waits for login
      .then(function(loginResponse){
        dataHolder.user = loginResponse.data
        console.log('Then1', dataHolder)
        return java.AuthService.validatesession(dataHolder.user.sessionToken)
      })
      // waits for validatesession
      .then(function(validateSessionResponse){
        dataHolder.isValidSession = validateSessionResponse.data
        console.log('Then2', dataHolder)
        return java.AuthService.loadsession(dataHolder.user.sessionToken)
      })
      // waits for loadsession
      .then(function(loadSessionResponse){
        dataHolder.loadedSession = loadSessionResponse.data
        return true
      })
      ['finally'](function(){
        console.log('Finally (called even if there are errors)')
      })




    /*
    .success(function(result){
      console.log('returned success!!!', result)
    })
    .error(function(result){
      console.log('returned error!!!', result)
    })
    ['finally'](function(result){
      console.log('FINISHED', result)
    })
    */

  });

}).call(this);
