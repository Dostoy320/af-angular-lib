//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//
var appCatch = {

  config: {
    prod: 'https://c62072b6aefc4bf1bd217382b9b7dad5@app.getsentry.com/27961', // PROD : nalberg@actifi.com
    dev: 'https://656d24f28bbd4037b64638a4cdf6d61d@app.getsentry.com/26791', // DEV : alberg.nate@actifi.com
    enabled:true,
    options:  {
      whitelistUrls:[ 'actifi.com/' ],
      ignoreUrls: [ /extensions\//i, /^chrome:\/\//i ]
    }
  },


  // util
  log:function(msg){ if(typeof console !== 'undefined') console.log(msg); },
  isEnabled:function(){ return appCatch.initialized && appCatch.config.enabled },
  initialized:false,


  //
  // INITIALIZE
  //
  init:function(){
    if(typeof Raven === "undefined")
      return alert('Cannot initialize Sentry. Missing Raven library.')

    // init
    var url = appCatch.config.prod;
    if(appEnv.env() === 'dev') url = appCatch.config.dev;
    Raven.config(url, appCatch.config.options).install();

    // store the fact its initialized
    appCatch.initialized = true;

    appCatch.log('Sentry - '+appEnv.env()+' env: ' + url)
  },


  //
  // METHODS
  //
  // send error
  error:function(message, extra, tags){
    if(!appCatch.isEnabled())
      return appCatch.log('Sentry Not Loaded. Unable to log error: ' + message)

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
    options.tags.subDomain = tags.subDomain || appEnv.subDomainClean();
    Raven.captureMessage(message, options)
  },
  // additional info about the user that threw error...
  setUser:function(id, email){
    if(!appCatch.isEnabled()) return;
    var user = {id:id}
    if(email) user.email = email
    if(user){
      Raven.setUser(user)
    } else {
      appCatch.clearUser();
    }
  },
  clearUser:function(){
    if(!appCatch.isEnabled()) return;
    Raven.setUser(); // this clears out any current user
  }

}