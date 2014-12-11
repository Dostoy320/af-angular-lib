(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api, $q) {

    var java = {

      // so you don't have to inject $http in your controllers if you injected this service already..
      call: function(request, callback) {
        $http(request).success(function(data){
          if(callback) callback(null, data);    // SUCCESS
        }).error(function(error, status){
          if(callback) callback(error, status); // ERROR
        });
      },

      //
      // ROADMAP SERVICE
      //
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = api.newRequest(options);
          request.url = java.RoadmapService.serviceUrl + url;
          request.data = params || {};
          return request;
        },
        call:function(url, params, callback, options){
          java.call(this.createRequest(url, params, options), callback);
        },

        // METHODS
        invoke: function(params, callback, options){
          this.call('/invoke', params, callback, options);
        }
      },




      //
      // AUTH SERVICE
      //
      AuthService: {
        serviceUrl: '/RoadmapService',
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = api.newRequest(options);
          request.url = java.AuthService.serviceUrl + url;
          request.data = params || {};
          request.urlEncode = true;
          return request;
        },
        call:function(url, params, callback, options){
          java.call(this.createRequest(url, params, options), callback);
        },

        // METHODS
        login: function(username, password, callback, options) {
          if(!options) options = { autoApplySession:false, displayErrors:false };
          this.call('/login', { username: username, password: password }, callback, options)
        },
        logout: function(callback, options) {
          this.call('/logout', null, callback, options);
        },
        loadsession: function(sessionToken, callback, options) {
          this.call('/loadsession', {sessionToken: sessionToken}, callback, options);
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
        */
      }
    };
    return java;
  });

}).call(this);
