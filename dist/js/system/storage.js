(function() {
  var myApp;

  myApp = angular.module('af.storage', []);

  myApp.constant('STORAGE_PREFIX', 'myApp');

  myApp.service('$storage', function(STORAGE_PREFIX) {
    var service;
    service = {
      _prefix: STORAGE_PREFIX + '_',
      _prefixPersistent: 'p_' + STORAGE_PREFIX,
      store: function(key, value, expires) {
        return amplify.store(this._prefix + key, value, {
          expires: expires
        });
      },
      persist: function(key, value, expires) {
        return amplify.store(this._prefixPersistent + key, value, {
          expires: expires
        });
      },
      all: function() {
        var appData;
        appData = {};
        _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key) || service.isPersistantAppData(key)) {
            return appData[key] = value;
          }
        });
        return appData;
      },
      clear: function(key) {
        return _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key)) {
            return amplify.store(key, null);
          }
        });
      },
      nuke: function() {
        return _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key) || service.isPersistantAppData(key)) {
            return amplify.store(key, null);
          }
        });
      },
      isAppData: function(key) {
        return key.indexOf(this._prefix) === 0;
      },
      isPersistantAppData: function(key) {
        return key.indexOf(this._prefixPersistent) === 0;
      }
    };
    return service;
  });

}).call(this);
