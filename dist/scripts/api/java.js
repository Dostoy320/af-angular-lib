(function() {

  var myApp = angular.module('af.java', ['af.apiUtil']);

  myApp.service('java', function($http, apiUtil) {

    var java = {

      // so you no have to include $http in controllers
      call: function(request) {
        return $http(request);
      },


      //
      // ROADMAP SERVICE
      //
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = apiUtil.request.create(options);
          request.url = java.RoadmapService.serviceUrl + url;
          request.data = params || {};
          return request;
        },
        call:function(url, params, options){
          return java.call(this.createRequest(url, params, options));
        },

        // METHODS
        invoke: function(params, callback, options){
          return this.call('/invoke', params, callback, options);
        }
      },


      //
      // AUTH SERVICE
      //
      AuthService: {
        serviceUrl: '/RoadmapService',
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = apiUtil.request.create(options);
          request.url = java.AuthService.serviceUrl + url;
          request.data = params || {};
          request.urlEncode = true;
          return request;
        },
        call:function(url, params, options){
          return java.call(this.createRequest(url, params, options));
        },

        // METHODS
        login: function(username, password, options) {
          Object.merge(options || {}, { displayErrors:false }); // by default.. don't autoHandle errors on this
          return this.call('/login', { username: username, password: password }, options)
        },
        logout: function(options) {
          return this.call('/logout', null, options);
        },
        loadsession: function(sessionToken, options) {
          return this.call('/loadsession', {sessionToken: sessionToken}, options);
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
          apiUtil.call(request, {token: token});
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
