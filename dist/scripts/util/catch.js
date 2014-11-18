(function() {

  var myApp = angular.module('af.catch', ['af.authManager', 'af.config']);

  myApp.constant('CATCH_ENABLED', true);

  myApp.service('$catch', function(authManager, $log, CATCH_ENABLED) {

    var init = function(){
      if (!CATCH_ENABLED) return false;
      if (typeof Raven === 'undefined') return false;
      if (authManager.loggedIn()) {
        var user = {
          id: authManager.userId(),
          email: authManager.userEmail()
        }
        afCatch.setUser(user)
      }
      return true;
    }

    var service = {
      throw: function(msg, extra, tags) {
        if(!init()) return $log.debug('Sentry Not Loaded. Cannot send: ' + msg);
        $log.error(msg)
        afCatch.throw(msg, extra, tags);
      }
    };
    return service;
  });

}).call(this);
