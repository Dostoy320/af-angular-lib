(function() {

  var myApp = angular.module('af.authManager', ['af.util']);

  myApp.service('authManager', function($util) {
    var auth;
    return auth = {
      loggedInUser: amplify.store("loggedInUser"),
      sessionToken: amplify.store('sessionToken'),
      clearUser: function() {
        amplify.store('loggedInUser', null);
        amplify.store('sessionToken', null);
        auth.loggedInUser = null;
        return auth.sessionToken = null;
      },
      setSessionToken: function(sessionToken) {
        auth.sessionToken = sessionToken;
        return amplify.store('sessionToken', sessionToken);
      },
      setLoggedInUser: function(sessionToken, userId, userName, userEmail, authorities) {
        auth.setSessionToken(sessionToken);
        auth.loggedInUser = {
          userId: userId,
          userName: userName,
          userEmail: userEmail,
          authorities: authorities
        };
        return amplify.store('loggedInUser', auth.loggedInUser);
      },
      findSessionToken: function(priority) {
        var token;
        token = null;
        if (!priority) {
          priority = ['app', 'url', 'amplify', 'window'];
        }
        _.each(priority, function(place) {
          if (token) {
            return;
          }
          switch (place) {
            case 'app':
              token = auth.sessionToken;
              break;
            case 'amplify':
              token = amplify.store('sessionToken');
              break;
            case 'url':
              token = $util.GET('sessionToken');
              break;
            case 'window':
              token = window.sessionToken;
          }
          return token;
        });
        return token;
      },
      hasRole: function(role) {
        if (!auth.loggedIn()) {
          return false;
        }
        return _.contains(auth.loggedInUser.authorities, role);
      },
      hasAnyRole: function(array) {
        var matched;
        matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) {
            return matched += 1;
          }
        });
        return matched > 0;
      },
      hasAllRoles: function(array) {
        var matched;
        matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) {
            return matched += 1;
          }
        });
        return array.length === matched;
      },
      isAdmin: function() {
        return auth.hasAnyRole(['Role_Admin', 'Role_RoadmapUserAdmin', 'Role_RoadmapContentAdmin']);
      },
      isCoach: function() {
        return auth.isManager();
      },
      isManager: function() {
        return auth.hasAnyRole(['Role_AccessKeyManager']);
      },
      loggedIn: function() {
        return auth.sessionToken && auth.loggedInUser && auth.loggedInUser.userId;
      }
    };
  });

}).call(this);
