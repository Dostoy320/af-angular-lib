(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api, $q) {

    var java = {

      // so you don't have to inject $http in your controllers if you injected this service already..
      call: function(request) { return $http(request); },

      //
      // ROADMAP SERVICE
      //
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        // BASE
        call:function(url, params){
          return java.call(this.createRequest(url, params));
        },
        // creates standard request object for this service
        createRequest:function(url, params, overrides){
          var request = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + url,
            data: params || {}
          }
          // merge with default request options
          return api.createRequest(request, overrides)
        },

        // METHODS
        invoke: function(params) {
          return this.call('/invoke', params);
        }
      },




      //
      // AUTH SERVICE
      //
      AuthService: {
        serviceUrl: '/RoadmapService',
        // BASE
        call:function(url, params){
          return java.call(this.createRequest(url, params));
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
          // merge with default request options
          return api.createRequest(request, overrides)
        },


        // METHODS
        login: function(username, password) {
          var request = this.createRequest('/login', { username: username, password: password })
          request.autoApplySession = false;
          request.displayErrors = false;
          return java.call(request);
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
