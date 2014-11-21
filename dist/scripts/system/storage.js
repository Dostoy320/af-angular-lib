(function() {

  
  //
  // SIMPLE WRAPPER AROUND AMPLIFY.STORE TO ALLOW NAME SPACING...
  //
  var myApp = angular.module('af.storage', []);

  myApp.constant('STORAGE_PREFIX', 'myApp');

  myApp.service('$storage', function(STORAGE_PREFIX) {

    var prefix = STORAGE_PREFIX + '_';

    var service = {

      store: function(key, value, options) {

        // save/get key
        if(key){
          if(options){
            if(_.isObject(options) && options.hasOwnProperty('expires')) options = expires;
            if(_.isNumber(options)) options = { expires: options }
          }
          return amplify.store(prefix + key, value, options);

        // return all data related to this app
        } else {
          var allData = {}
          _.each(amplify.store(), function(value, key){
            if(key.indexOf(prefix) === 0)
              allData[key] = value;
          })
          return allData;
        }
      },

      clear: function(key) {
        _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key)) {
            return amplify.store(key, null);
          }
        });
      }
    };

    return service;
  });

}).call(this);
