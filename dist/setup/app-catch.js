//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//
var appCatch = {

  loaded:false,

  config: {
    url:'',
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
    if(settings) appCatch.loadSettings(settings);
    // do once
    if(appCatch.loaded || !appCatch.config.enabled) return;
    // sanity checks
    if(typeof Raven === "undefined") return alert('Cannot initialize Sentry. Missing Raven library.');
    if(!appCatch.config.url) return alert('Sentry init error. Application Config not defined.');

    // init
    Raven.config(appCatch.config.url, appCatch.config.options).install();
    console.log('SENTRY LOADED - '+appEnv.env() + ' - ' + appCatch.config.url, appCatch.config.options);
    appCatch.loaded = true;
  },

  loadSettings:function(settings){
    // populate config
    if(!settings) return;
    for(var key in settings){
      appCatch.config[key] = settings[key];
    }
  },


  //
  // METHODS
  //
  // send error
  send:function(message, extra, tags){ appCatch.error(message, extra, tags); }, // alias
  error:function(message, extra, tags){
    if(!appCatch.loaded) return;
    console.log('MIXPANEL.error():', message);
    extra = extra || {};
    tags = tags || {};
    // build options
    var options = { extra:extra, tags:tags };
    // url error occurred
    options.extra.url = extra.href || window.location.href;
    // tags
    options.tags.app = tags.app || appEnv.app();
    options.tags.env = tags.env || appEnv.env();
    options.tags.subDomain = tags.subDomain || appEnv.subDomainClean();
    Raven.captureMessage(message, options)
  },

  // additional info about the user that threw error...
  setUser:function(id, email){
    if(!appCatch.loaded) return;
    var user = {id:id};
    if(email) user.email = email;
    if(user) {
      console.log('SENTRY.setUser():', user);
      Raven.setUser(user);
    } else {
      appCatch.clearUser();
    }
  },

  clearUser:function(){
    if(!appCatch.loaded) return;
    console.log('SENTRY.clearUser():');
    Raven.setUser(); // this clears out any current user
  }

};