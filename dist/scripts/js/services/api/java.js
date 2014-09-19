(function() {
  var myApp;

  myApp = angular.module('af.java', ['af.api', 'af.authManager']);

  myApp.service('java', function($http, api, authManager) {
    var autoApplySession, autoApplySessionPriority, java;
    autoApplySession = true;
    autoApplySessionPriority = null;
    java = {
      setAutoApplySession: function(value) {
        return autoApplySession = value;
      },
      setAutoApplySessionPriority: function(value) {
        return autoApplySessionPriority = value;
      },
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        execute: function(method, params, options) {
          var req, reqDefaults;
          if (autoApplySession) {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          reqDefaults = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + method,
            data: params
          };
          req = _.defaults(options || {}, reqDefaults);
          return $http(req);
        },
        invoke: function(params, options) {
          return this.execute('/invoke', params, options);
        }
      },
      AuthService: {
        serviceUrl: '/RoadmapService',
        execute: function(method, params, options) {
          var req, reqDefaults;
          if (autoApplySession && method !== '/login' && method !== '/loadtoken') {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          reqDefaults = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: java.AuthService.serviceUrl + method,
            data: $.param(params)
          };
          req = _.defaults(options || {}, reqDefaults);
          return $http(req);
        },
        login: function(username, password) {
          var params;
          params = {
            username: username,
            password: password
          };
          return this.execute('/login', params, {
            ignoreExceptions: true
          });
        },
        logout: function() {
          return this.execute('/logout', null);
        },
        validatesession: function(sessionToken) {
          var params;
          params = {};
          if (sessionToken) {
            params.sessionToken = sessionToken;
          }
          return this.execute('/validatesession', params);
        },
        createtoken: function(loginAsUserId, expiresOn, url) {
          var params;
          params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          return this.execute('/createtoken', params);
        },
        updatetoken: function(tokenString, url) {
          var params;
          params = {
            tokenString: tokenString,
            url: url
          };
          return this.execute('/updatetoken', params);
        },
        loadtoken: function(token) {
          return this.execute('/loadtoken', {
            token: token
          });
        },
        changepassword: function(userId, currentPassword, newPassword) {
          var params;
          params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          return this.execute('/changepassword', params);
        },
        getuserfromuserid: function(userId, sessionToken) {
          return this.execute('/getuserfromuserid', {
            userId: userId,
            sessionToken: sessionToken
          });
        },
        loadsession: function(sessionToken) {
          return this.execute('/loadsession', {
            sessionToken: sessionToken
          });
        }
      }
    };
    return java;
  });

}).call(this);
