(function() {

  var myApp = angular.module('af.authManager', ['af.util']);

  myApp.constant('SESSION_TOKEN_PRIORITY', ['url', 'cache', 'window']);

  myApp.service('authManager', function($util, SESSION_TOKEN_PRIORITY) {

    //
    // SESSION/USER CACHE
    //
    var loggedInUser = amplify.store('loggedInUser') // for easy reference

    var auth = {

      // finds sessionToken based on priority
      sessionToken: function() {
        // default priority, looks in this class first, then URL, then checks amplify and finally window.sessionToken
        var token = null;
        _.each(SESSION_TOKEN_PRIORITY, function(place) {
          if (token) return;
          switch (place) {
            case 'url':     token = $util.GET('sessionToken'); break;
            case 'cache':   token = amplify.store('sessionToken'); break;
            case 'window':  token = window.sessionToken; break;
          }
        });
        return token;
      },

      // return object if null to prevent auth.user().firstName from blowing up.
      user:function(){            return auth.loggedIn() ? loggedInUser : {} },

      // is logged in?
      loggedIn: function() { return auth.sessionToken() && loggedInUser && loggedInUser.userId;  },



      //
      // SET
      //
      setSessionToken: function(sessionToken) {
        amplify.store('sessionToken', sessionToken, 86400000); // 1 day
      },
      setLoggedInUser: function(user) {
        user.displayName = $util.createDisplayName(user); // adds a displayName to the user
        amplify.store('loggedInUser', user, 86400000); // 1 day
      },


      //
      // DESTROY
      //
      logout:function(){ auth.clear(); },
      clear: function() {
        amplify.store('loggedInUser', null);
        amplify.store('sessionToken', null);
        loggedInUser = null;
      },



      //
      // ROLES
      //
      // ENUMS
      Role_Admin:'Role_Admin',                              // has access to everything
      Role_RoadmapUserAdmin:'Role_RoadmapUserAdmin',        // can edit/create users
      Role_RoadmapContentAdmin:'Role_RoadmapContentAdmin',  // can edit content
      Role_AccessKeyManager:'Role_AccessKeyManager',        // can view/edit other users data

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

      isAdmin: function() { return auth.hasAnyRole([auth.Role_Admin, auth.Role_RoadmapUserAdmin, auth.Role_RoadmapContentAdmin]); },
      isCoach: function() { return auth.hasAnyRole([auth.Role_AccessKeyManager]); }


    };

    return auth;
  });

}).call(this);
