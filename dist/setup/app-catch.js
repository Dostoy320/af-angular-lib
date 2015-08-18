//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//
var appCatch = {

  loaded:false,

  config: {
    uid:'',
    enabled: true,
    logging:true,
    options: {
      whitelistUrls:[ 'actifi.com/' ],
      ignoreUrls: [ /extensions\//i, /^chrome:\/\//i ]
    }
  },


  //
  // INITIALIZE
  //
  init:function(settings){
    // load settings
    if(settings){
      for(var key in settings){
        appCatch.config[key] = settings[key];
      }
    }
    // sanity checks
    if(appCatch.loaded) return;
    if(!appCatch.config.enabled)     return console.log('SENTRY - Disabled via config.', appCatch.config);
    if(typeof Raven === "undefined") return console.log('ERROR!! Cannot initialize Sentry. Missing Raven library.');
    if(!appCatch.config.uid)         return console.log('ERROR!! Sentry init error. Application Config not defined.');
    // init
    Raven.config(appCatch.config.uid, appCatch.config.options).install();
    console.log('SENTRY - Enabled', appCatch.config);
    appCatch.loaded = true;
  },


  //
  // METHODS
  //
  // alias
  send:function(message, extra, tags){
    appCatch.error(message, extra, tags);
  },
  error:function(message, extra, tags){
    if(!appCatch.loaded) return;
    console.log('SENTRY - error()', message);
    extra = extra || {};
    tags = tags || {};
    // build options
    var options = { extra:extra, tags:tags };
    // url of error
    options.extra.url = extra.href || window.location.href;
    // tags
    options.tags.app = tags.app || serverConfig.app;
    options.tags.env = tags.env || serverConfig.env;
    options.tags.subDomain = tags.subDomain || tags.host || serverConfig.host;
    Raven.captureMessage(message, options)
  },

  // additional info about the user that threw error...
  setUser:function(id, email){
    if(!appCatch.loaded) return;
    var user = { id:id };
    if(email) user.email = email;
    console.log('SENTRY - setUser()', user);
    Raven.setUser(user);
  },
  clearUser:function(){
    if(!appCatch.loaded) return;
    console.log('SENTRY - clearUser()');
    Raven.setUser(); // this clears out any current user
  }
};