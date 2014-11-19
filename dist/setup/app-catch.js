//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//
var appCatch = {

  config: {
    prod: 'https://c62072b6aefc4bf1bd217382b9b7dad5@app.getsentry.com/27961', // PROD : nalberg@actifi.com
    dev: 'https://656d24f28bbd4037b64638a4cdf6d61d@app.getsentry.com/26791', // DEV : alberg.nate@actifi.com
    options:  {
      whitelistUrls:[ 'actifi.com/' ],
      ignoreUrls: [ /extensions\//i, /^chrome:\/\//i ]
    }
  },


  // util
  log:function(msg){ if(typeof console !== 'undefined') console.log(msg); },
  loaded:function(){ return (typeof Raven !== "undefined"); },

  //
  // INITIALIZE
  //
  init:function(){
    if(!appCatch.loaded()) alert('Cannot initialize Sentry. Raven not defined.')
    var url = appCatch.config.prod;
    if(appEnv.env() === 'dev') url = appCatch.config.dev;
    Raven.config(url, appCatch.config.options).install();
    appCatch.log('Sentry - '+appEnv.env()+' env: ' + url)
  },


  //
  // METHODS
  //
  // send error
  throw:function(message, extra, tags){
    if(!appCatch.loaded()) return appCatch.log('Sentry Not Loaded. Unable to log issue: ' + message)

    // build options
    var options = {
      extra:extra || {},
      tags:tags || {}
    }
    // url error occurred.git st
    options.extra.url = extra.url || window.location.url;
    // tags
    options.tags.app = tags.app || appEnv.app();
    options.tags.env = tags.env || appEnv.env();
    options.tags.tenant = tags.tenant || appEnv.tenant();
    options.tags.index = tags.index || appEnv.index();
    options.tags.subDomain = tags.subDomain || appEnv.subDomain();
    Raven.captureMessage(message, options)
  },

  
  setUser:function(user){
    if(!appCatch.loaded()) return;
    if(user){
      Raven.setUser(user)
    } else {
      appCatch.clearUser();
    }
  },
  clearUser:function(){
    if(!appCatch.loaded()) return;
    Raven.setUser(); // clears out any current user
  }

}