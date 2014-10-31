(function() {
  var myApp;

  myApp = angular.module('af.track', ['af.authManager']);

  myApp.constant('TRACK_ENABLED', true);

  myApp.service('$track', function($log, authManager, TRACK_ENABLED) {
    var init, service;
    init = function() {
      if (!TRACK_ENABLED) {
        return false;
      }
      if (typeof mixpanel === 'undefined') {
        return false;
      }
      if (authManager.loggedInUser) {
        mixpanel.identify(authManager.loggedInUser.userId);
      }
      return true;
    };
    service = {
      event: function(name, options) {
        if (!init()) {
          return $log.info('Mixpanel Not loaded. Unable to track event: ' + name);
        }
        return mixpanel.track(name, options);
      },
      register: function(options) {
        if (!init()) {
          return $log.info('Mixpanel Not loaded. Unable to Register', options);
        }
        return mixpanel.register(options);
      },
      unregister: function(string) {
        if (!init()) {
          return $log.info('Mixpanel Not loaded. Unable to Unregister: ' + string);
        }
        return mixpanel.unregister(string);
      }
    };
    return service;
  });

}).call(this);
