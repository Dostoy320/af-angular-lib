(function() {
  var myApp;

  myApp = angular.module('af.sentry', []);

  myApp.service('$sentry', function($log, authManager) {
    var sentryIsLoaded, service;
    sentryIsLoaded = function() {
      if (typeof Raven === "undefined") {
        return false;
      }
      if (authManager && authManager.loggedInUser) {
        Raven.setUser({
          id: authManager.loggedInUser.userId,
          email: authManager.loggedInUser.userEmail
        });
      }
      return true;
    };
    service = {
      error: function(name, extra) {
        return service.message(name, extra);
      },
      message: function(name, extra) {
        if (!sentryIsLoaded()) {
          return $log.info('Sentry Not loaded. Unable to send "' + name + '"');
        }
        return Raven.captureMessage(name, extra);
      },
      exception: function(error) {
        if (!sentryIsLoaded()) {
          return $log.info('Sentry Not loaded. Unable to send exception');
        }
        return Raven.captureException(error);
      }
    };
    return service;
  });

}).call(this);
