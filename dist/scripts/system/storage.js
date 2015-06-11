(function() {

  
  //
  // SIMPLE WRAPPER AROUND AMPLIFY.STORE TO ALLOW NAME SPACING...
  //
angular.module('af.storage', [])

  .constant('$STORAGE_CONFIG', {persistent_prefix:'myApp'} )

  .service('$storage', function($STORAGE_CONFIG, $log) {

    var tempData = {}; // cleared if page refreshed..
    var prefix = $STORAGE_CONFIG.persistent_prefix;

    var storage = {
      logCachedData:true, // dev

      // amplify wrapper
      amplify:function(key, value, options){
        if(_.isNumber(options)) options = { expires:options };
        return amplify.store(key, value, options);
      },


      //
      // STORE
      //
      // store till cleared... (amplify alias)
      local:function(key, value, options){
        return storage.amplify(key, value, options);
      },

      // store till cleared or next login...
      session:function(key, value, options){
        // get or set
        if(arguments.length > 0) return storage.amplify(prefix+'_'+key, value, options);
        // get all data
        var appData = {};
        _.each(amplify.store(), function(value, key){
          if(storage.isAppData(key)) appData[key] = angular.copy(value);
        });
        return appData;
      },

      // store till cleared, next login, or page refresh...
      temp:function(key, value){
        if(arguments.length == 0) return tempData;
        if(arguments.length == 1) {
          if(storage.logCachedData) $log.info('TEMP CACHE:' + key);
          return tempData[key];
        }
        tempData[key] = angular.copy(value);
      },

      
      
      //
      // EMPTY
      //
      clear: function(key) {
        // clear one thing
        if(key){
          delete tempData[key];
          return amplify.store(prefix+'_'+key, null);
        }
        // clear all
        tempData = {};
        _.keys(amplify.store(), function(key){
          if(storage.isAppData(key)) amplify.store(key, null);
        });
      },

      // clear everything
      nuke:function(){
        _.keys(amplify.store(), function(key){
          amplify.store(key, null);
        });
      },

      isAppData:function(key){ return key.indexOf(prefix+'_') === 0; }

    };

    return storage;
  })

}).call(this);
