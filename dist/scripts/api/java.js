(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api) {

    var java = {

      // so you don't have to inject api in your controllers...
      execute: function(request, onSuccess, onError) {
        api.execute(request, onSuccess, onError)
      },


      //
      // ROADMAP SERVICE
      //
      RoadmapService: {
        serviceUrl: '/RoadmapService',

        // BASE
        // execute shortcut, when you have no options...
        call:function(url, params, onSuccess, onError){
          var request = java.RoadmapService.createRequest(url, params)
          java.call(request, onSuccess, onError);
        },

        // creates standard request object for this service
        createRequest:function(url, params, options){
          params = api.autoAddSessionTokenToParams(params, options)
          var defaultRequest = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + url,
            data: params || {}
          }
          return _.extend(defaultRequest, options || {})
        },

        // METHODS
        invoke: function(params, request, onSuccess, onError) {
          return java.RoadmapService.call('/invoke', params, request, onSuccess, onError);
        }
      },






      //
      // AUTH SERVICE
      //
      AuthService: {
        serviceUrl: '/RoadmapService',

        // BASE
        // execute shortcut for basic calls
        call:function(url, params, onSuccess, onError){
          java.execute(this.createRequest(url, params), onSuccess, onError);
        },

        // creates standard request object for this service
        createRequest:function(url, params, overrides){
          var request = {
            method: 'POST',
            url: java.AuthService.serviceUrl + url,
            data: params,
            // options
            urlEncode:true
          }
          return _.extend(api.defaultRequest, request , overrides)
        },


        // METHODS
        login: function(username, password, onSuccess, onError) {
          var request = this.createRequest('/login', { username: username, password: password })
          request.autoApplySession = false;
          request.displayErrors = false;
          java.execute(request, onSuccess, onError);
        }
        /*

        UNTESTED

        ,
        logout: function(onSuccess, onError) {
          this.call('/logout', onSuccess, onError);
        },
        validatesession:function(sessionToken) {
          var params = {};
          if (sessionToken) params.sessionToken = sessionToken;
          this.call('/validatesession', params);
        },
        createtoken: function(loginAsUserId, expiresOn, url) {
          var params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          this.call('/createtoken', params);
        },
        updatetoken: function(tokenString, url) {
          this.call('/updatetoken', {tokenString: tokenString, url: url});
        },
        loadtoken: function(token) {
          var request = java.AuthService.createRequest('/loadtoken', {token: token}, {autoApplySession:false})
          api.call(request, {token: token});
        },
        changepassword: function(userId, currentPassword, newPassword) {
          var params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          this.call('/changepassword', params);
        },
        getuserfromuserid: function(userId) {
          this.call('/getuserfromuserid', {userId: userId});
        },
        loadsession: function(sessionToken) {
          this.call('/loadsession', {sessionToken: sessionToken});
        }
        */
      }
    };
    return java;
  });

}).call(this);
