(function() {
  var myApp = angular.module('af.config', []);

  //
  // plural filter for config
  //
  myApp.filter('plural', function() {
    return function(value) {
      if(!value) return value;
      if(!_.isString(value)) return value;
      var lastChar = value.charAt(value.length - 1).toLowerCase();
      var lastTwoChar = value.slice(value.length - 2).toLowerCase();
      // special cases...
      if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
      if (lastTwoChar === 'ch') return value + 'es';
      return value + 's';
    };
  })
  // label filter
  myApp.filter('configLabel', function($config) {
    return function(path, makePlural) {
      var val = $config.get(path, makePlural)
      return val;
    };
  })



  //
  // config exposed from server
  //
  myApp.service('$config', function($window, $filter) {

    var getPathValue = function(object, path) {
      var parts = path.split('.');
      if (parts.length === 1) return object[parts[0]];
      var child = object[parts.shift()];
      if (!child) return child;
      return getPathValue(child, parts.join('.'));
    };

    // the service
    var config = {
      // gets a value from our config
      // accepts a string value, eg:('label.app.name')
      get: function(path, makePlural) {
        var pluralValue, value;
        if (!$window.config) return null;
        if (!path) return $window.config; // return whole config if no path
        value = getPathValue($window.config, path);
        if (makePlural) {
          pluralValue = getPathValue($window.config, path + '_plural');
          if(pluralValue) return pluralValue;
          return $filter('plural')(value);
        }
        return value;
      },

      tenant: function() {    return appEnv.tenant(); },
      env: function() {       return appEnv.env(); },
      index: function() {     return appEnv.index(); },
      subDomain: function() { return appEnv.subDomain(); }
    };
    return config;
  });

}).call(this);
