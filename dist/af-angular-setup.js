if (typeof console === "undefined") { var console = { log : function(){} }; }
;

//
//  THIS FILE CONTAINS ALL THE INFORMATION
//  NEEDED TO PROVIDE THE CLIENT WITH INFORMATION ABOUT ITS ENVIRONMENT
//

var appEnv = {

  cache:null,

  // DEVELOPMENT OVERRIDES
  // index essentially provides node with the database
  dev:{
    localhost:{
      tenant:'actifi',
      index:'alpha2'
    },
    alpha:{
      tenant:'waddell',
      index:'alpha'
    },
    alpha2:{
      tenant:'td',
      index:'alpha2'
    }
  },


  // init
  init:function(){
    appEnv.cache = {};
    // subDomain
    appEnv.cache.subDomain = (window.location.host).split('.').shift().toLowerCase();
    // clean subDomain (with no -dev on it)
    appEnv.cache.subDomainClean = appEnv.cache.subDomain.split('-').shift();
    // isLocal?
    appEnv.cache.isLocal = false;
    if(appEnv.cache.subDomainClean === 'localhost')           appEnv.cache.isLocal = true;
    if(appEnv.cache.subDomainClean === 'dev')                 appEnv.cache.isLocal = true;
    if(appEnv.cache.subDomainClean.indexOf('192.168.') === 0) appEnv.cache.isLocal = true;
    // environment
    appEnv.cache.env = 'prod';
    if(appEnv.cache.isLocal)                            appEnv.cache.env = 'dev';
    if(appEnv.cache.subDomain.indexOf('alpha') === 0)   appEnv.cache.env = 'dev';
    if(appEnv.cache.subDomain.indexOf('-dev') >= 0)     appEnv.cache.env = 'dev';

    // load tenant
    if(appEnv.cache.isLocal)                        appEnv.cache.tenant = appEnv.dev.localhost.tenant;
    if(appEnv.cache.subDomainClean == 'alpha')      appEnv.cache.tenant = appEnv.dev.alpha.tenant;
    if(appEnv.cache.subDomainClean == 'alpha2')     appEnv.cache.tenant = appEnv.dev.alpha2.tenant;
    if(appEnv.cache.subDomainClean == 'tdai')       appEnv.cache.tenant = 'td';     // special case
    if(appEnv.cache.subDomainClean == 'apps')       appEnv.cache.tenant = 'actifi'; // special case
    if(!appEnv.cache.tenant)  appEnv.cache.tenant = appEnv.cache.subDomainClean;    // defaults to subDomain

    // load tenant index (db uid)
    if(appEnv.isLocal())                            appEnv.cache.index = appEnv.dev.localhost.index;
    if(appEnv.cache.subDomainClean == 'alpha')      appEnv.cache.index = appEnv.dev.alpha.index;
    if(appEnv.cache.subDomainClean == 'alpha2')     appEnv.cache.index = appEnv.dev.alpha2.index;
    if(appEnv.cache.subDomainClean == 'tdai')       appEnv.cache.index = 'td'; // special case
    if(appEnv.cache.subDomainClean == 'waddell')    appEnv.cache.index = 'wr'; // special case
    if(!appEnv.cache.tenant)  appEnv.cache.index =  appEnv.cache.tenant; // defaults to tenant

    // set app... mainly for logging/sentry tagging etc...
    if(!appEnv.cache.app){
      // attempt to auto get app from pathname....
      appEnv.cache.app = ''
      var parts = window.location.pathname.split('/');
      if (parts.length >= 2) appEnv.cache.app = parts[1].toLowerCase();
    }

    if(typeof console !== 'undefined')
      console.log(appEnv.cache.env.toUpperCase()+' Env Loaded', appEnv.cache);
  },


  //
  // GETTERS
  //
  isProd : function(){
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.env !== 'dev';
  },
  isDev : function(){
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.env === 'dev';
  },
  isLocal : function(){
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.isLocal;
  },
  subDomain : function(){
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.subDomain;
  },
  subDomainClean:function(){
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.subDomainClean; // returns domain with -dev stripped off
  },
  env : function(){
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.env;
  },
  tenant : function() {
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.tenant;
  },
  index : function() {
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.index;
  },
  app : function() {
    if(!appEnv.cache) appEnv.init();
    return appEnv.cache.app;
  }
}
;
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
    if(!appCatch.loaded()) return;
    var user = {id:id}
    if(email) user.email = email
    if(user){
      Raven.setUser(user)
    } else {
      appCatch.clearUser();
    }
  },
  clearUser:function(){
    if(!appCatch.loaded()) return;
    Raven.setUser(); // this clears out any current user
  }

}
;
//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//

//
// CONFIG
//
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

  config: {
    enabled:true,
    prod: 'd0695354d367ec464143a4fc30d25cd5', // default PROD key
    dev:  'c783e4625a55094cbf9d91c94d285242'  // default DEV key
  },

  // util
  log:function(msg){ if(typeof console !== 'undefined') console.log(msg); },
  isEnabled:function(){ return appTrack.initialized && appTrack.config.enabled },
  initialized:false,



  //
  // INITIALIZE
  //
  init : function(){
    if(typeof mixpanel === "undefined")
      return alert('Cannot initialize MixPanel. Missing MixPanel library.')

    // init
    var token = appTrack.config.prod;
    if(appEnv.env() === 'dev') token = appTrack.config.dev;
    mixpanel.init(token);

    // store the fact its initialized
    appTrack.initialized = true;

    // always pass this with events:
    appTrack.register({
      domain:appEnv.subDomainClean(),
      env:appEnv.env(),
      app:appEnv.app()
    })
    appTrack.log('Mixpanel - '+appEnv.env()+' env: ' + token)
  },



  //
  // METHODS
  //


  // allows us to track logged in users.... need to call right away.
  setUser:function(id){
    if (!appTrack.isEnabled()) return appTrack.log('Mixpanel Not loaded. Unable to setUser: ' + id);
    mixpanel.identify(id);
  },
  // set info about identified user
  // { key:value }
  setProfile:function(object){
    if (!appTrack.isEnabled()) return appTrack.log('Mixpanel Not loaded. Unable to people.set: ' + JSON.stringify(object));
    return mixpanel.people.set(object);
  },

  // track an event named "Registered":
  // mixpanel.track("Registered", {"Gender": "Male", "Age": 21});
  track:function(name, options){
    if (!appTrack.isEnabled()) return appTrack.log('Mixpanel Not loaded. Unable to track event: ' + name);
    mixpanel.track(name, options); //
  },

  // Register a set of super properties, which are automatically included with all events.
  // { key:value }
  register: function(options) {
    if (!appTrack.isEnabled()) return appTrack.log('Mixpanel Not loaded. Unable to Register', options);
    return mixpanel.register(options);
  },
  // removes a registered key
  unregister: function(key) {
    if (!appTrack.isEnabled()) return appTrack.log('Mixpanel Not loaded. Unable to Unregister: ' + key);
    return mixpanel.unregister(key);
  }


}