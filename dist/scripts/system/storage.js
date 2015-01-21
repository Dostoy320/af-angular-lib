(function() {

  
  //
  // SIMPLE WRAPPER AROUND AMPLIFY.STORE TO ALLOW NAME SPACING...
  //
angular.module('af.storage', [])

  .constant('STORAGE_PREFIX', 'myApp')

  .service('$storage', function(STORAGE_PREFIX, $log) {

    var sessionData = {};

    var storage = {

      // LOCAL STORAGE
      // data stored with prefix pertaining to a particular application only
      store:function(key, value, options){
        // ensure options are in correct format: { expires:x }
        if(_.isNumber(options)) options = { expires:options };

        // get or set a value
        if(key) return amplify.store(STORAGE_PREFIX + '_' + key, angular.copy(value), options);
        // get all data
        var appData = {};
        _.each(amplify.store(), function(value, key){
          if(storage.isAppData(key)) appData[key] = angular.copy(value);
        });
        return appData;
      },

      // THiS IS BASICALLY A SESSION STORAGE
      // data that will be gone if page refreshed.
      logCachedData:true,
      cache:function(key, value){
        if(arguments.length == 0) return sessionData;
        if(arguments.length == 1) {
          if(storage.logCachedData) $log.info('CACHED:' + key); //, sessionData[key]);
          return sessionData[key];
        }
        sessionData[key] = angular.copy(value);
      },

      clear: function(key) {
        if(key){
          delete sessionData[key];
          return amplify.store(STORAGE_PREFIX+'_'+key, null);
        }
        sessionData = {};
        _.keys(amplify.store(), function(key){
          if(storage.isAppData(key)) amplify.store(key, null);
        });
      },

      isAppData:function(key){ return key.indexOf(STORAGE_PREFIX+'_') === 0; }

    };

    return storage;
  })

}).call(this);
