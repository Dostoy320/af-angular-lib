(function() {

  var myApp = angular.module('af.authManager', ['af.util']);

  myApp.service('authManager', function($util) {

    var auth;

    return auth = {

      sessionTokenPriority:['app', 'url', 'amplify', 'window'],

      //
      // SESSION/USER CACHE
      //
      loggedInUser: amplify.store("loggedInUser"), // username, firstName, lastName, email, nameOfPractice and email
      sessionToken: amplify.store('sessionToken'),

      loggedIn: function() {
        return auth.sessionToken && auth.loggedInUser && auth.loggedInUser.userId;
      },
      clearUser: function() {
        amplify.store('loggedInUser', null);
        amplify.store('sessionToken', null);
        auth.loggedInUser = null;
        auth.sessionToken = null;
      },
      setSessionToken: function(sessionToken) {
        auth.sessionToken = sessionToken;
        amplify.store('sessionToken', sessionToken);
      },
      setLoggedInUser: function(sessionToken, userId, userName, userEmail, authorities) {
        auth.setSessionToken(sessionToken);
        auth.loggedInUser = {
          userId: userId,
          userName: userName,
          userEmail: userEmail,
          authorities: authorities
        };
        amplify.store('loggedInUser', auth.loggedInUser);
      },
      // finds sessionToken based on priority
      findSessionToken: function(priority) {
        // default priority, looks in this class first, then URL, then checks amplify and finally window.sessionToken
        if (!priority) priority = auth.sessionTokenPriority;
        var token = null;
        _.each(priority, function(place) {
          if (token) return;
          switch (place) {
            case 'app':     token = auth.sessionToken; break;
            case 'amplify': token = amplify.store('sessionToken'); break;
            case 'url':     token = $util.GET('sessionToken'); break;
            case 'window':  token = window.sessionToken;
          }
        });
        return token;
      },

      
      //
      // ROLE CHECKS
      //
      hasRole: function(role) {
        if (!auth.loggedIn()) return false;
        return _.contains(auth.loggedInUser.authorities, role);
      },
      hasAnyRole: function(array) {
        var matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) matched += 1;
        });
        return matched > 0;
      },
      hasAllRoles: function(array) {
        var matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) matched += 1;
        });
        return array.length === matched;
      },

      isAdmin: function() { return auth.hasAnyRole(['Role_Admin', 'Role_RoadmapUserAdmin', 'Role_RoadmapContentAdmin']); },
      isCoach: function() { return auth.hasAnyRole(['Role_AccessKeyManager']); }

    };
  });

}).call(this);
