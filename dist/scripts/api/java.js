(function() {

  var myApp = angular.module('af.java', ['af.apiUtil', 'af.authManager']);

  myApp.service('java', function($http, apiUtil, authManager) {


    var java = {

      setAutoApplySession: function(value) {         return autoApplySession = value; },
      setAutoApplySessionPriority: function(value) { return autoApplySessionPriority = value; },


      RoadmapService: {
        serviceUrl: '/RoadmapService',
        // BASE CALL
        call: function(method, params, options) {
          // slap on a sessionToken?
          params = apiUtil.autoApplySession(params, options)
          var requestDefaults = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + method,
            data: params
          }
          // merge default options into our request
          var req = _.defaults(options || {}, requestDefaults);
          return $http(req);
        },

        // METHODS
        invoke: function(params, options) {
          return this.call('/invoke', params, options);
        }
      },



      AuthService: {

        serviceUrl: '/RoadmapService',

        // BASE CALL
        call: function(method, params, options) {
          // slap on a sessionToken?
          params = apiUtil.autoApplySession(params, options)

          // AuthService expects urlEncoded
          var requestDefaults = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded'  },
            url: java.AuthService.serviceUrl + method,
            data: $.param(params)
          };
          // merge default options into our request
          var req = _.defaults(options || {}, requestDefaults);
          return $http(req);
        },


        // METHODS
        login: function(username, password, options) {
          return this.execute('/login', {username: username, password: password}, options);
        },
        logout: function(options) {
          return this.execute('/logout', null, options);
        },
        validatesession: function(sessionToken, options) {
          var params = {};
          if (sessionToken) params.sessionToken = sessionToken;
          return this.execute('/validatesession', params, options);
        },
        createtoken: function(loginAsUserId, expiresOn, url, options) {
          var params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          return this.execute('/createtoken', params, options);
        },
        updatetoken: function(tokenString, url, options) {
          return this.execute('/updatetoken', {tokenString: tokenString, url: url}, options);
        },
        loadtoken: function(token, options) {
          return this.execute('/loadtoken', {token: token}, options);
        },
        changepassword: function(userId, currentPassword, newPassword, options) {
          var params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          return this.execute('/changepassword', params, options);
        },
        getuserfromuserid: function(userId, options) {
          return this.execute('/getuserfromuserid', {userId: userId}, options);
        },
        loadsession: function(sessionToken, options) {
          return this.execute('/loadsession', {sessionToken: sessionToken}, options);
        }
      }
    };
    return java;
  });

}).call(this);
