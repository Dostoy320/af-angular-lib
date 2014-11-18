(function() {

  var myApp = angular.module('af.track', ['af.authManager']);

  myApp.constant('TRACK_ENABLED', true);

  myApp.service('$track', function($log, authManager, TRACK_ENABLED) {

    var init = function() {
      if (!TRACK_ENABLED) return false;
      if (typeof mixpanel === 'undefined') return false;
      if (authManager.loggedIn())
        mixpanel.identify(authManager.userId());
      return true;
    }


    var service = {
      // track an event named "Registered"
      // mixpanel.track("Registered", {"Gender": "Male", "Age": 21});
      event:function(name, options){ service.track(name, options); },
      track: function(name, options) {
        if (!init()) return $log.info('Mixpanel Not loaded. Unable to track event: ' + name);
        return mixpanel.track(name, options);
      },


      // Register a set of super properties, which are included with all events.
      // { key:value }
      register: function(options) {
        if (!init()) return $log.info('Mixpanel Not loaded. Unable to Register', options);
        return mixpanel.register(options);
      },
      // remove a registered key
      unregister: function(string) {
        if (!init()) return $log.info('Mixpanel Not loaded. Unable to Unregister: ' + string);
        return mixpanel.unregister(string);
      },

      // set info about identified user
      // { key:value }
      set:function(json){
        if (!init()) return $log.info('Mixpanel Not loaded. Unable to Set: ' + JSON.stringify(json));
        return mixpanel.people.set(json);
      }

    };

    return service;
  });

}).call(this);
