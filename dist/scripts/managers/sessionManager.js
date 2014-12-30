(function() {

  var myApp = angular.module('af.sessionManager', ['af.util']);

  myApp.constant('SESSION_MANAGER_CONFIG', {
    locationPriority:['url', 'cache', 'window'], // by default looks in URL, then cache, then finally on window
    cacheAs:'sessionToken',
    cacheFor:86400000 // 1 day
  });

  myApp.service('sessionManager', function($util, $log, SESSION_MANAGER_CONFIG) {

    var service = {

      // GET
      // finds sessionToken based on priority
      sessionToken: function(priorities) {
        priorities = priorities || SESSION_MANAGER_CONFIG.locationPriority;
        var token = null;
        _.each(priorities, function(priority) {
          if (token) return;
          switch (priority) {
            case 'url':     token = $util.GET(SESSION_MANAGER_CONFIG.cacheAs); break;
            case 'cache':   token = amplify.store(SESSION_MANAGER_CONFIG.cacheAs); break;
            case 'window':  token = window.sessionToken; break;
          }
        });
        return token;
      },

      // SET
      setSessionToken:function(sessionToken){
        amplify.store(SESSION_MANAGER_CONFIG.cacheAs, sessionToken, {expires:SESSION_MANAGER_CONFIG.cacheFor});
      },

      // CLEAR
      clear: function() {
        amplify.store(SESSION_MANAGER_CONFIG.cacheAs, null);
      }
    };

    return service;

  });

}).call(this);
