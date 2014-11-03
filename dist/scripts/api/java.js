(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api) {

    var java = {


      RoadmapService: {
        serviceUrl: '/RoadmapService',
        call: function(method, params, onSuccess, onError) {
          // auto apply sessionToken?
          params = api.autoApplySessionToken(params, options)
          var requestDefaults = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + method,
            data: params
          };
          // merge defaults into user request
          request = _.defaults(request || {}, requestDefaults);
          api.call(request, onSuccess, onError);
        },
        invoke: function(params, request, onSuccess, onError) {
          return java.RoadmapService.call('/invoke', params, request, onSuccess, onError);
        },

        createRequest:function(url, params, options){
          params = api.autoApplySessionToken(params, options)
          return {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + url,
            data: params || {},
            options:options || {}
          }
        }
      },



      AuthService: {
        serviceUrl: '/RoadmapService',
        // BASE CALL
        call: function(method, params, onSuccess, onError, request) {
          // slap on a sessionToken?
          params = api.autoApplySessionToken(params, request)
          // AuthService expects urlEncoded
          var requestDefaults = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'  },
            url: java.AuthService.serviceUrl + method,
            data: $.param(params)
          };
          // merge defaults into user request
          request = _.defaults(request || {}, requestDefaults);
          api.call(request, onSuccess, onError);
        },

        createRequest:function(url, params, options){
          params = api.autoApplySessionToken(params, options)
          return {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'  },
            url: java.AuthService.serviceUrl + url,
            data: $.param(params) || {},
            options:options || {}
          }
        },


        // METHODS
        login: function(username, password, request, onSuccess, onError) {
          this.call('/login', { username: username, password: password }, request, onSuccess, onError);
        },
        logout: function(request, onSuccess, onError) {
          this.call('/logout', null, request, onSuccess, onError);
        },
        validatesession: function(sessionToken, options) {
          var params = {};
          if (sessionToken) params.sessionToken = sessionToken;
          return this.call('/validatesession', params, options);
        },
        createtoken: function(loginAsUserId, expiresOn, url, options) {
          var params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          return this.call('/createtoken', params, options);
        },
        updatetoken: function(tokenString, url, options) {
          return this.call('/updatetoken', {tokenString: tokenString, url: url}, options);
        },
        loadtoken: function(token, options) {
          return this.call('/loadtoken', {token: token}, options);
        },
        changepassword: function(userId, currentPassword, newPassword, options) {
          var params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          return this.call('/changepassword', params, options);
        },
        getuserfromuserid: function(userId, options) {
          return this.call('/getuserfromuserid', {userId: userId}, options);
        },
        loadsession: function(sessionToken, options) {
          return this.call('/loadsession', {sessionToken: sessionToken}, options);
        }
      }
    };
    return java;
  });

}).call(this);
