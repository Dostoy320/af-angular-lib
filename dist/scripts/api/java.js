(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api) {

    var java = {


      RoadmapService: {
        serviceUrl: '/RoadmapService',
        // BASE CALL
        call: function(url, params, onSuccess, onError) {
          var request = java.RoadmapService.createRequest(url, params)
          api.call(request, onSuccess, onError);
        },

        createRequest:function(url, params, options){
          params = api.applyParamDefaults(params, options)
          var defaultRequest = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + url,
            data: params || {}
          }
          return _.defaults(options || {}, defaultRequest)
        },

        // METHODS
        invoke: function(params, request, onSuccess, onError) {
          return java.RoadmapService.call('/invoke', params, request, onSuccess, onError);
        }
      },



      AuthService: {
        serviceUrl: '/RoadmapService',
        // BASE CALL
        call: function(url, params, onSuccess, onError) {
          var request = java.AuthService.createRequest(url, params)
          api.call(request, onSuccess, onError);
        },
        createRequest:function(url, params, options){
          // slap sessionToken onto params?
          params = api.autoAddSessionTokenToParams(params, options)
          var defaultRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'  },
            url: java.AuthService.serviceUrl + url,
            data: $.param(params)
          }
          // merge other options onto request
          return _.extend(defaultRequest, options || {})
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
