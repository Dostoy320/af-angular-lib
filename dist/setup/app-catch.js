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
    },
    tags:{
      //app:''
      //env:''
    },
    subDomain:(''+window.location.hostname).split('.').shift().toLowerCase()
  },

  error:function(msg){
    appCatch.log('ERROR: ' + msg, true);
  },
  log:function(msg, force){
    if(typeof console === "undefined") return;
    if(force || appCatch.config.logging)
      console.log('SENTRY', msg);
  },

  //
  // INITIALIZE
  //
  init:function(settings){

    if(appCatch.loaded) return; // do once

    var domain = appCatch.config.subDomain;
    if( domain.indexOf('-dev') > 0 ||
        domain.indexOf('localhost') == 0 ||
        domain.indexOf('dev') == 0 ||
        domain.indexOf('alpha') == 0 ||
        domain.indexOf('192.168.') == 0) {
      return appCatch.error('Failed to load.  Does not load on development servers.');
    }

    // load settings
    if(!settings) return appCatch.error('Failed to load. Settings not defined.');
    for(var key in settings){
      appCatch.config[key] = settings[key];
    }

    // sanity checks
    if(!appCatch.config.enabled)     return console.error('Sentry - Disabled via config.', appCatch.config);
    if(typeof Raven === "undefined") return console.error('Sentry - Cannot initialize. Missing Raven library.');
    if(!appCatch.config.uid)         return console.error('Sentry - Init error. Uid not defined.');

    // INIT
    Raven.config(appCatch.config.uid, appCatch.config.options).install();
    console.log('Sentry Init:', appCatch.config);
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
    appCatch.log('error() -> '+message);
    extra = extra || {};
    tags = tags || {};
    // build options
    var options = { extra:extra, tags:tags };
    // url of error
    options.extra.url = extra.href || window.location.href;
    // tags
    for(var key in appCatch.config.tags){
      options.tags[key] = appCatch.config.tags[key];
    }
    for(var key in tags){
      options.tags[key] = tags[key];
    }
    options.tags.subDomain = (''+window.location.host).split('.').shift().split('-').shift();
    Raven.captureMessage(message, options)
  },

  // additional info about the user that threw error...
  setUser:function(id, email){
    if(!appCatch.loaded) return;
    var user = { id:id };
    if(email) user.email = email;
    appCatch.log('setUser():' + id + ', email:'+email);
    Raven.setUser(user);
  },
  clearUser:function(){
    if(!appCatch.loaded) return;
    appCatch.log('clearUser()');
    Raven.setUser(); // this clears out any current user
  }
};