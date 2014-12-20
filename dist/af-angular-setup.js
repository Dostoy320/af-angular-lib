if (typeof console === "undefined") { var console = { log : function(){} }; }
;

//
// NEEDED TO PROVIDE THE CLIENT WITH INFORMATION ABOUT ITS ENVIRONMENT
//

var appEnv = {

  // this gets filled out once per page load...
  loaded:false,

  cache:{
    subDomain:'',       // domain, includes -dev
    subDomainClean:'',  // domain, strips off -dev
    env:'production',   // development / production.
    isLocal:false       // running locally? (http://localhost/ or http://development/
  },


  //
  // INIT, this only runs once per page load... (generally)
  //
  init:function(){
    if(appEnv.loaded) return; // do once.

    console.log(window.location.hostname);
    // subDomain
    appEnv.cache.subDomain = (window.location.hostname).split('.').shift().toLowerCase();
    // clean subDomain (no -dev on it)
    appEnv.cache.subDomainClean = appEnv.cache.subDomain.split('-').shift();

    // isLocal?
    if(appEnv.cache.subDomainClean === 'localhost')   appEnv.cache.isLocal = true;
    if(appEnv.cache.subDomainClean === 'development') appEnv.cache.isLocal = true;

    // development?
    if(appEnv.cache.isLocal)                        appEnv.cache.env = 'development';
    if(appEnv.cache.subDomain.indexOf('-dev') >= 0) appEnv.cache.env = 'development';

    // set app... mainly for logging/sentry/tagging etc...
    //var parts = window.location.pathname.split('/');
    //if (parts.length >= 2) appEnv.cache.app = parts[1].toLowerCase();

    // log
    console.log(appEnv.cache.env.toUpperCase()+' Env Loaded', appEnv.cache);
    appEnv.loaded = true;
  },


  //
  // GETTERS
  //
  isProd : function(){
    appEnv.init();
    return appEnv.cache.env !== 'development';
  },
  isDev : function(){
    appEnv.init();
    return appEnv.cache.env === 'development';
  },
  isLocal : function(){
    appEnv.init();
    return appEnv.cache.isLocal;
  },
  subDomain : function(){
    appEnv.init();
    return appEnv.cache.subDomain;
  },
  // returns domain with -dev stripped off
  subDomainClean:function(){
    appEnv.init();
    return appEnv.cache.subDomainClean;
  },
  env : function(){
    appEnv.init();
    return appEnv.cache.env;
  }
};

appEnv.init(); // init
;
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
  init:function(){

    // sanity checks
    if(!appConfig) return alert('Sentry init error. Application Config not defined.');
    if(typeof Raven === "undefined") return alert('Cannot initialize Sentry. Missing Raven library.');

    if(appCatch.loaded || !appCatch.config.enabled) return; // do once

    // populate config
    var env = appEnv.env();
    if(appConfig[env] && appConfig[env].sentry){
      var config = appConfig[env].sentry;
      for(var key in config){
        appCatch.config[key] = config[key];
      }
    }

    // init
    Raven.config(appCatch.config.url, appCatch.config.options).install();
    console.log('SENTRY LOADED - '+appEnv.env() + ' - ' + appCatch.config.url, appCatch.config.options);
    appCatch.loaded = true;
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

// run it..
appCatch.init();
;
//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//

//
// CONFIG
//
/*
var appConfig = {

  //
  // METHODS
  //
  // send error
  get:function(path, makePlural) {
    if (!window.config) return null;
    if (!path) return window.config; // return whole config if no path
    var value = appConfig.getPathValue(window.config, path);
    if (makePlural) {
      var pluralValue = appConfig.getPathValue(window.config, path + '_plural');
      if(pluralValue) return pluralValue;
      return appConfig.makePlural(value);
    }
    return value;
  },


  //
  // UTIL
  //

  // checks if enabled flag is true on an object
  enabled:function(path){
    return appConfig.get(path+'.enabled') === true
  },

  makePlural:function(value){
    if(!value) return value;
    if(!_.isString(value)) return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  },
  getPathValue:function(object, path) {
    var parts = (''+path).split('.');
    if (parts.length === 1) return object[parts[0]];
    var child = object[parts.shift()];
    if (!child) return child;
    return appConfig.getPathValue(child, parts.join('.'));
  }
}
*/
;
//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//


//
// MIXPANEL LIB
//
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
    for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);


var appTrack = {

  loaded:false,

  config: {
    enabled:true,
    key:'',
    options:{
      'cross_subdomain_cookie':false
      //,'debug':true
    },
    logging:true
  },

  //
  // INITIALIZE
  //
  init:function(){
    if(appTrack.loaded || !appTrack.config.enabled) return; // do once

    // sanity checks
    if(!appConfig) return alert('Sentry init error. Application Config not defined.');
    if(typeof mixpanel === "undefined") return alert('Cannot initialize MixPanel. Missing MixPanel library.');

    // populate config
    var env = appEnv.env();
    if(appConfig[env] && appConfig[env].mixpanel){
      var config = appConfig[env].mixpanel;
      for(var key in config){
        appTrack.config[key] = config[key];
      }
    }

    // init
    mixpanel.init(appTrack.config.key, appTrack.config.options);
    console.log('MIXPANEL LOADED - '+appEnv.env() + ' - ' + appTrack.config.key, appTrack.config.options);
    appTrack.loaded = true;

    // always pass this with events:
    appTrack.register({
      domain:appEnv.subDomainClean(),
      env:appEnv.env()
    })
  },



  //
  // METHODS
  //
  // allows us to track logged in users.... need to call right away.
  setUser:function(id){
    if(!appTrack.loaded) return;
    console.log('MIXPANEL.identify(): ', id);
    mixpanel.identify(id);
  },

  // set info about identified user
  // { key:value }
  setProfile:function(object){
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.people.set():', object);
    mixpanel.people.set(object);
  },

  // track an event named "Registered":
  // mixpanel.track("Registered", {"Gender": "Male", "Age": 21});
  send:function(name, options){ appTrack.track(name, options); }, // alias
  track:function(name, options){
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.track:', name, options);
    mixpanel.track(name, options); //
  },

  // Register a set of super properties, which are automatically included with all events.
  // { key:value }
  register: function(options) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.register:', options);
    mixpanel.register(options);
  },
  // removes a registered key
  unregister: function(key) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.unregister: ', key);
    mixpanel.unregister(key);
  },

  //
  //  EVENTS we track
  //
  TRACK_LOGIN:function(){   appTrack.track('Login') },
  TRACK_LOGOUT:function(){  appTrack.track('Logout') },
  TRACK_PAGE_VIEW:function(pageName){
    appTrack.track('PageView', {
      'page': pageName,
      'url':window.location.hash
    });
  }
}

appTrack.init(); // init