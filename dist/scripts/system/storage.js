(function() {

  
  //
  // SIMPLE WRAPPER AROUND AMPLIFY.STORE TO ALLOW NAME SPACING...
  //
angular.module('af.storage', [])

  .constant('$STORAGE_CONFIG', { namespace:'myApp' } )

  .service('$storage', function($STORAGE_CONFIG, $window, $log) {

    // transfers sessionStorage from one tab to another
    var sessionStorage_transfer = function(event) {
      if (!event) { event = window.event; } // ie
      $log.info('storage event', event);
      if (event.key == 'getSessionStorage') {
        // Some tab asked for the sessionStorage -> send it
        localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
        localStorage.removeItem('sessionStorage');
      } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
        var data = JSON.parse(event.newValue);
        for (var key in data) {
          sessionStorage.setItem(key, data[key]);
        }
      }
    };

    // Ask other tabs for session storage
    if (!sessionStorage.length) {
      localStorage.setItem('getSessionStorage', 'foobar');
      localStorage.removeItem('getSessionStorage');
    };
    if($window.addEventListener) {
      $window.addEventListener("storage", sessionStorage_transfer, false);
    } else {
      $window.attachEvent("onstorage", sessionStorage_transfer);
    };



    var optionsCheck = function(options){
      if(_.isNumber(options)) return { expires:options };
      return options;
    };
    var getAllData = function(values){
      var data = {};
      _.each(values, function(value, key){
        if(storage.isAppData(key)) data[key] = angular.copy(value);
      });
      return data;
    };



    var tempData = {}; // cleared if page refreshed..
    var prefix = $STORAGE_CONFIG.namespace;

    var storage = {

      // amplify wrapper
      store:function(key, value, options){
        options = optionsCheck(options);
        return amplify.store(key, value, options);
      },


      // TEMP cleared if page refreshed...
      temp:function(key, value){
        if(arguments.length == 0) return tempData;
        if(arguments.length == 1) return tempData[key];
        tempData[key] = angular.copy(value);
      },


      // store till window closed
      session:function(key, value, options){
        options = optionsCheck(options);
        if(!amplify.store.types.sessionStorage){
          // get / set data
          if(arguments.length > 0) return amplify.store.sessionStorage(prefix+key, value, options);
          return getAllData(amplify.store.sessionStorage());
        } else {
          // fallback
          if(arguments.length > 0) return amplify.store(key, value, options);
          return getAllData(amplify.store());
        }
      },

      // store till expires
      local:function(key, value, options){
        options = optionsCheck(options);
        return storage.store(key, value, options);
      },



      
      //
      // EMPTY
      //
      clear: function(key) {
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

      // clear ALL data
      nuke:function(){
        _.keys(amplify.store(), function(key){
          amplify.store(key, null);
        });
      },

      isAppData:function(key){
        return (''+key).indexOf(prefix+'_') === 0;
      }

    };

    return storage;
  })

}).call(this);
