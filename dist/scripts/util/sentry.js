(function() {
  var myApp;

  myApp = angular.module('af.sentry', ['af.authManager', 'af.config']);

  myApp.constant('SENTRY_ENABLED', true);

  myApp.service('$sentry', function($log, $window, authManager, $config, $log, SENTRY_ENABLED) {

    var sentryIsLoaded = function() {
      if (!SENTRY_ENABLED) return false;
      if (typeof Raven === "undefined") return false;
      return true;
    };


    var service = {

      setUser:function(){
        if (!sentryIsLoaded()) return;
        if (authManager.loggedIn()) {
          var user = {
            id: authManager.user().userId,
            email: authManager.user().email
          }
          Raven.setUser(user);
        }
      },

      error: function(name, extra, tags) {
        return service.message(name, extra, tags);
      },

      message: function(name, extra, tags) {
        if (!sentryIsLoaded())
          return $log.warn('Sentry Not loaded. Unable to send message: ' + name);

        // set user if possible
        service.setUser();

        // send some info about whats going on.
        var options = {
          extra: { url: $window.location.url },
          tags: {
            app: appEnv.app(),
            env: appEnv.env(),
            tenant: appEnv.tenant(),
            index:  appEnv.index(),
            subDomain: appEnv.subDomainClean()
          }
        }
        _.defaults(options.extra, extra || {})
        _.defaults(options.tags, tags || {})
        return Raven.captureMessage(name, options);
      }
    };

    return service;
  });

}).call(this);
