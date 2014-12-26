(function() {

  var myApp = angular.module('af.authManager', ['af.util']);

  myApp.constant('AUTH_MANAGER_CONFIG', {
    tokenPriority:['url', 'cache', 'window']
  });

  myApp.service('authManager', function($util, $log, AUTH_MANAGER_CONFIG) {

    //
    // SESSION/USER CACHE
    //
    var loggedInUser = amplify.store('loggedInUser');

    var auth = {

      // finds sessionToken based on priority
      sessionToken: function() {
        // default priority, looks in this class first, then URL, then checks amplify and finally window.sessionToken
        var token = null;
        AUTH_MANAGER_CONFIG.tokenPriority.each(function(priority) {
          if (token) return;
          switch (priority) {
            case 'url':     token = $util.GET('sessionToken'); break;
            case 'cache':   token = amplify.store('sessionToken'); break;
            case 'window':  token = window.sessionToken; break;
          }
        });
        return token;
      },

      // return object if null to prevent auth.user().firstName from blowing up.
      user:function(){      return auth.loggedIn() ? loggedInUser : {} },
      // quickie makers for things we get often:
      user_id:function(){   return auth.loggedIn() ? auth.user()['id']:null; },
      userId:function(){    return auth.loggedIn() ? auth.user()['userId']:null; },
      userEmail:function(){ return auth.loggedIn() ? auth.user()['email']:null;  },

      // is logged in?
      loggedIn: function() {
        return (auth.sessionToken() && loggedInUser && loggedInUser.userId) ? true:false;
      },



      //
      // SET
      //
      setSessionToken: function(sessionToken) {
        amplify.store('sessionToken', sessionToken, 86400000); // 1 day
      },
      setLoggedInUser: function(user) {
        user.displayName = $util.createDisplayName(user);      // adds a displayName to the user
        loggedInUser = user;
        amplify.store('loggedInUser', loggedInUser, 86400000); // 1 day
        $log.debug('authManager.setLoggedInUser:', loggedInUser);
      },
      setUserProperty: function(key, value){
        loggedInUser[key] = value;
        auth.setLoggedInUser(loggedInUser); // update/cache it
      },
      getUserProperty: function(key){
        // (you can just do .user()[key] also)
        return loggedInUser[key];
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

      numOfMatchingRoles:function(array){
        return array.intersect(auth.user().roles).length;
      },
      hasRole: function(role) {
        return [role].intersect(auth.user().roles).length > 0
      },
      hasAnyRole: function(array) {
        return array.intersect(auth.user().roles).length > 0
      },
      hasAllRoles: function(array) {
        return array.intersect(auth.user().roles).length === array.length;
      },

      isAdmin: function() { return auth.hasAnyRole([auth.Role_Admin, auth.Role_RoadmapUserAdmin, auth.Role_RoadmapContentAdmin]); },
      isCoach: function() { return auth.hasAnyRole([auth.Role_AccessKeyManager]);  }


    };

    return auth;
  });

}).call(this);
