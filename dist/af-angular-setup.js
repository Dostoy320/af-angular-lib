if (typeof console === "undefined") { var console = { log : function(){} }; }
;
//
// CLIENT ENVIRONMENT
// provides client with setup information
//

var appEnv = {

  // this gets filled out once per page load...
  loaded:false,

  // stores result
  config:{
    subDomain:'',       // domain, includes -dev
    subDomainClean:'',  // domain, strips off -dev
    env:'production',   // development / production.
    isLocal:false,      // running locally? (http://localhost/ or http://development/
    app:'',
    tenant:'',
    index:''
  },



  //
  // INIT
  //
  init:function(clientConfig){
    if(appEnv.loaded) return; // do once.

    // 1 - Determine Environment
    // subDomain
    appEnv.config.subDomain = (window.location.hostname).split('.').shift().toLowerCase();
    // subDomain with no -dev on it
    appEnv.config.subDomainClean = appEnv.config.subDomain.split('-').shift();

    // isLocal?
    if(appEnv.config.subDomainClean === 'localhost')   appEnv.config.isLocal = true;
    if(appEnv.config.subDomainClean === 'dev')         appEnv.config.isLocal = true;
    if(appEnv.config.subDomainClean === 'development') appEnv.config.isLocal = true;

    // development?
    if(appEnv.config.isLocal)                        appEnv.config.env = 'development';
    if(appEnv.config.subDomain.indexOf('-dev') >= 0) appEnv.config.env = 'development';

    // 2 - Merge in Config from client
    // merge in properties passed in from client during setup
    if(clientConfig && clientConfig.hasOwnProperty(appEnv.config.env)){
      // get Production/Development config...
      var conf = clientConfig[appEnv.config.env];
      // if local... merge with localhost config
      if(appEnv.config.isLocal && clientConfig.hasOwnProperty('localhost'))
        conf = appEnv.mergeConfigs(conf, clientConfig['localhost']);
      // merge specific domain configs on top of that
      if(clientConfig.hasOwnProperty(appEnv.config.subDomainClean))
        conf = appEnv.mergeConfigs(conf, clientConfig[appEnv.config.subDomainClean]);

      // set config
      appEnv.config = appEnv.mergeConfigs(appEnv.config, conf);
    }


    // set app... mainly for logging/sentry/tagging etc...
    var parts = window.location.pathname.split('/');
    if (parts.length >= 2) appEnv.config.app = parts[1].toLowerCase();

    // load tenant
    if(appEnv.config.subDomainClean == 'tdai')       appEnv.config.tenant = 'td';     // special case
    if(appEnv.config.subDomainClean == 'apps')       appEnv.config.tenant = 'actifi'; // special case
    if(!appEnv.config.tenant) appEnv.config.tenant = appEnv.config.subDomainClean;    // defaults to subDomain

    // load tenant index for node (db uid)
    if(appEnv.config.subDomainClean == 'tdai')       appEnv.config.index = 'td'; // special case
    if(appEnv.config.subDomainClean == 'waddell')    appEnv.config.index = 'wr'; // special case
    if(!appEnv.config.index) appEnv.config.index =  appEnv.config.tenant; // defaults to tenant

    // log
    console.log(appEnv.config.env.toUpperCase()+' Env Loaded', appEnv.config);
    appEnv.loaded = true;
  },


  //
  // GETTERS
  //
  isProd : function(){
    appEnv.init();
    return appEnv.config.env !== 'development';
  },
  isDev : function(){
    appEnv.init();
    return appEnv.config.env === 'development';
  },
  isLocal : function(){
    appEnv.init();
    return appEnv.config.isLocal;
  },
  subDomain : function(){
    appEnv.init();
    return appEnv.config.subDomain;
  },
  // returns domain with -dev stripped off
  subDomainClean:function(){
    appEnv.init();
    return appEnv.config.subDomainClean;
  },
  env : function(){
    appEnv.init();
    return appEnv.config.env;
  },
  tenant : function() {
    appEnv.init();
    return appEnv.config.tenant;
  },
  index : function() {
    appEnv.init();
    return appEnv.config.index;
  },
  app : function() {
    appEnv.init();
    return appEnv.config.app;
  },

  // merges configs
  mergeConfigs:function(target, source){
    for (var prop in source) {
      if (typeof source[prop] == 'object'){
        if(!target[prop]) target[prop] = {};
        target[prop] = appEnv.mergeConfigs(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }
};

;
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
    if(settings) appCatch.loadSettings(settings);
    // do once
    if(appCatch.loaded || !appCatch.config.enabled) return;
    // sanity checks
    if(typeof Raven === "undefined") return alert('Cannot initialize Sentry. Missing Raven library.');
    if(!appCatch.config.uid) return alert('Sentry init error. Application Config not defined.');

    // init
    Raven.config(appCatch.config.uid, appCatch.config.options).install();
    console.log('SENTRY LOADED - '+appEnv.env() + ' - ' + appCatch.config.uid, appCatch.config.options);
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
;
//
// TENANTS CONFIGURATION (labels, theme, etc)
//
var appTenant = {

  config:{}, // holds config (loaded from db or php, or whatever)

  get:function(path, makePlural) {
    if (!path) return appTenant.config; // return whole config
    var value = appTenant.getPathValue(appTenant.config, path);
    if(makePlural) {
      var pluralValue = appTenant.getPathValue(appTenant.config, path + '_plural');
      if(pluralValue) return pluralValue;
      return appTenant.makePlural(value);
    }
    return value;
  },


  //
  // UTIL
  //
  // checks if enabled flag is true on an object
  enabled:function(path){
    return appTenant.get(path+'.enabled') === true
  },
  makePlural:function(value){
    if(!value) return value;
    if(typeof value !== 'string') return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  },

  // easily get nested value from objects
  // eg: getPathValue({ name:{ first:'John', last:'Doe'}}, 'name.first')
  getPathValue:function(object, path) {
    var parts = (''+path).split('.');
    if (parts.length === 1) return object[parts[0]];
    var child = object[parts.shift()];
    if (!child) return child;
    return appTenant.getPathValue(child, parts.join('.'));
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

  loaded: false,

  config: {
    enabled: true,
    uid: '',
    options: {
      'cross_subdomain_cookie': false
      //,'debug':true
    },
    logging: true
  },

  //
  // INITIALIZE
  //
  init: function (settings) {
    if(settings) appTrack.loadSettings(settings);
    // do once
    if (appTrack.loaded || !appTrack.config.enabled) return;
    // sanity checks
    if (typeof mixpanel === "undefined") return alert('Cannot initialize MixPanel. Missing MixPanel library.');
    if (!appTrack.config.uid) return alert('Sentry init error. Application Config not defined.');

    // init
    mixpanel.init(appTrack.config.uid, appTrack.config.options);
    console.log('MIXPANEL LOADED - ' + appEnv.env() + ' - ' + appTrack.config.uid, appTrack.config.options);
    appTrack.loaded = true;

    // always pass this with events:
    appTrack.register({
      domain: appEnv.subDomainClean(),
      //env: appEnv.env(),
      app: appEnv.app()
    })
  },

  loadSettings: function (from) {
    // populate config
    if (!from) return;
    for (var key in from) {
      appTrack.config[key] = from[key];
    }
  },


  //
  // METHODS
  //
  // allows us to track logged in users.... need to call right away.
  setUserId: function (id) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.identify(): ', id);
    mixpanel.identify(id);
  },

  // set info about identified user
  // { key:value }
  setProfile: function (object) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.people.set():', object);
    mixpanel.people.set(object);
  },

  // track an event named "Registered":
  // mixpanel.track("Registered", {"Gender": "Male", "Age": 21});
  send: function (name, options) {
    appTrack.track(name, options);
  }, // alias
  track: function (name, options) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.track:', name, options);
    mixpanel.track(name, options); //
    // spenser's global usage
    if(name !== 'Login' && name !== 'Page View')
      mixpanel.track('Key Metrics', {'Metric Name':name})
  },
  increment:function(name){
    mixpanel.people.increment(name);
  },

  // Register a set of super properties, which are automatically included with all events.
  // { key:value }
  register: function (options) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.register:', options);
    mixpanel.register(options);
  },
  // removes a registered key
  unregister: function (key) {
    if (!appTrack.loaded) return;
    console.log('MIXPANEL.unregister: ', key);
    mixpanel.unregister(key);
  },

  //
  //  EVENTS we track
  //
  TRACK_LOGIN: function () {
    appTrack.track('Login')
  },
  TRACK_LOGOUT: function () {
    appTrack.track('Logout')
  },
  TRACK_PAGE_VIEW: function (pageName) {
    appTrack.track('PageView', {
      'page': pageName,
      'url': window.location.hash
    });
  }
};