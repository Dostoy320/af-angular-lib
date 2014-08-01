(function() {
  var myApp;

  myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api, authManager) {
    var java;
    java = {
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params.sessionToken == null) {
            params.sessionToken = authManager.sessionToken;
          }
          req = {
            url: java.RoadmapService.serviceUrl + method,
            data: params
          };
          return api.execute(req, onSuccess, onError);
        },
        invoke: function(params, onSuccess, onError) {
          return java.RoadmapService.execute('/invoke', params, onSuccess, onError);
        }
      },
      AuthService: {
        serviceUrl: '/AuthService',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (method !== 'login' && method !== 'loadtoken') {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.sessionToken;
            }
          }
          req = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: java.AuthService.serviceUrl + method,
            data: $.param(params)
          };
          return api.execute(req, onSuccess, onError);
        },
        login: function(username, password, onSuccess, onError) {
          var params;
          params = {
            username: username,
            password: password
          };
          return java.AuthService.execute('/login', params, onSuccess, onError);
        },
        logout: function(onSuccess, onError) {
          return java.AuthService.execute('/logout', {}, onSuccess, onError);
        },
        validatesession: function(onSuccess, onError) {
          return java.AuthService.execute('/validatesession', {}, onSuccess, onError);
        },
        createtoken: function(loginAsUserId, expiresOn, url, onSuccess, onError) {
          var params;
          params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          return java.AuthService.execute('/createtoken', params, onSuccess, onError);
        },
        updatetoken: function(tokenString, url, onSuccess, onError) {
          var params;
          params = {
            tokenString: tokenString,
            url: url
          };
          return java.AuthService.execute('/updatetoken', params, onSuccess, onError);
        },
        loadtoken: function(token, onSuccess, onError) {
          return java.AuthService.execute('/loadtoken', {
            token: token
          }, onSuccess, onError);
        },
        changepassword: function(userId, currentPassword, newPassword, onSuccess, onError) {
          var params;
          params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          return java.AuthService.execute('/changepassword', params, onSuccess, onError);
        },
        getuserfromuserid: function(userId, onSuccess, onError) {
          return java.AuthService.execute('/getuserfromuserid', {
            userId: userId
          }, onSuccess, onError);
        },
        loadsession: function(sessionToken, onSuccess, onError) {
          return java.AuthService.execute('/loadsession', {
            sessionToken: sessionToken
          }, onSuccess, onError);
        }
      }
    };
    return java;
  });

}).call(this);
