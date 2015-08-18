if (typeof console === "undefined") { var console = { log : function(){} }; }
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
    // load settings
    if(settings){
      for(var key in settings){
        appCatch.config[key] = settings[key];
      }
    }
    // sanity checks
    if(appCatch.loaded) return;
    if(!appCatch.config.enabled) return console.log('SENTRY - Disabled via config.', appCatch.config);
    if(typeof Raven === "undefined") return alert('Cannot initialize Sentry. Missing Raven library.');
    if(!appCatch.config.uid) return alert('Sentry init error. Application Config not defined.');
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
    // url error occurred
    options.extra.url = extra.href || window.location.href;
    // tags
    options.tags.app = tags.app || serverConfig.app();
    options.tags.env = tags.env || serverConfig.env();
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
;
//
// TENANTS CONFIGURATION (labels, theme, etc)
//
var appTenant = {

  _config:{}, // holds config (loaded from db or php, or whatever)

  init:function(config){
    appTenant._config = config;
  },

  // quickie makers
  label:function(value, plural){ return appTenant.config('labels.'+value, plural)},
  enabled:function(value){ return appTenant.config('enabled.'+value)},

  config:function(path, makePlural){
    if(!path) return appTenant._config; // return entire config if no path
    var value = _.getPathValue(appTenant._config, path);
    if(!_.hasValue(value)) {
      console.log('appTenant.config(' + path + ') MISSING!');
      return '';
    }
    if(makePlural) {
      var customPluralValue = _.getPathValue(appTenant._config, path + '_plural');
      if(_.hasValue(customPluralValue)) return customPluralValue;
      return appTenant.makePlural(value);
    }
    return value;
  },

  makePlural:function(value){
    if(typeof value !== 'string' || value === '') return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    // If the word ends in a vowel (a,e,i,o,u) + y then just add s.
    if (lastChar === 'y' && lastTwoChar !== 'ay' && lastTwoChar !== 'ey' && lastTwoChar !== 'iy' && lastTwoChar !== 'oy' && lastTwoChar !== 'uy')
      return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  }

};
;
//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//


//
// MIXPANEL LIB
//
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
    for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);

// gets browser version
navigator.sayswho= (function(){
  var ua= navigator.userAgent, tem,
      M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
    tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE '+(tem[1] || '');
  }
  if(M[1]=== 'Chrome'){
    tem= ua.match(/\bOPR\/(\d+)/)
    if(tem!= null) return 'Opera '+tem[1];
  }
  M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
  return M.join(' ');
})();

var appTrack = {

  loaded: false,

  config: {
    uid:'',
    enabled: true,
    options: {
      'cross_subdomain_cookie': false,
      'debug':false
    },
    globals:{},
    globalUsageDelay:3600000 // 1 per an hour
  },


  //
  // INITIALIZE
  //
  init:function(settings){
    // load settings
    if(settings){
      for(var key in settings){
        appTrack.config[key] = settings[key];
      }
    }

    // sanity checks
    if(appTrack.loaded) return;
    if(!appTrack.config.enabled) return console.log('MixPanel - Disabled via config.', appCatch.config);
    if (typeof mixpanel === "undefined") return appCatch.send('Cannot initialize AppTrack. Missing MixPanel library.');
    if (!appTrack.config.uid) return appCatch.send('Cannot initialize AppTrack. AppTrack.config not defined.');

    appTrack.config.debug = serverConfig.isDev;

    // init
    mixpanel.init(appTrack.config.uid, appTrack.config.options);
    // always pass these with events:
    appTrack.config.globals = {
      'Domain': serverConfig.host,
      'Tenant': serverConfig.tenant,
      'Browser Version':navigator.sayswho,
      'App': serverConfig.app
    };
    mixpanel.register(appTrack.config.globals);
    console.log('MIXPANEL - Enabled', appTrack.config);
    appTrack.loaded = true;
  },

  isEnabled:function(){
    return (appTrack.loaded && appTrack.config.enabled && amplify.store('mixpanel_trackUserStats')) ? true:false;
  },

  //
  // WHO stats are tracked for
  //
  // can disable/enable after init by setting a cached setting
  trackUserStats:function(value){
    amplify.store('mixpanel_trackUserStats', value);
  },
  setUserId: function (userId) {
    if(!appTrack.loaded) return;
    amplify.store('mixpanel_trackUserId', userId);
    mixpanel.identify(userId);
  },
  getUserId:function(){
    if(!appTrack.loaded) return;
    return amplify.store('mixpanel_trackUserId');
  },
  setProfile: function (object) {
    if(!appTrack.loaded) return;
    mixpanel.people.set(object);
  },


  //
  // METHODS
  //
  // mixpanel.track("Register", {"Gender": "Male", "Age": 21}, 'Auth');
  send: function (name, tags, globalModule) { appTrack.track(name, tags, globalModule); }, // alias
  track: function (name, tags, globalModule) {
    if(!appTrack.isEnabled()) return;
    mixpanel.track(name, tags);
    if(globalModule) appTrack.trackGlobalUsage(globalModule);
  },
  trackGlobalUsage:function(module){
    module = module || 'Other';
    if(!appTrack.isEnabled() || !appTrack.getUserId()) return;
    var key = 'mixpanel_globalUsage_'+module+'-'+appTrack.getUserId();
    if(amplify.store(key)) return; // tracked recently?
    appTrack.send('Global Usage', { Module:module });
    appTrack.increment('Global Usage');
    // cache so we don't send again right away...
    amplify.store(key, true, { expires:appTrack.config.globalUsageDelay });
  },
  increment:function(name){
    if(!appTrack.isEnabled() || !appTrack.getUserId()) return;
    mixpanel.people.increment(name);
  },

  // Register a set of super properties, which are automatically included with all events.
  // { key:value }
  register: function (options) {
    if(!appTrack.isEnabled()) return;
    mixpanel.register(options);
  },
  // removes a registered key
  unregister: function (key) {
    if(!appTrack.isEnabled()) return;
    mixpanel.unregister(key);
  },



  //
  // METHODS
  //
  TRACK_LOGIN:function(type, from, to){
    appTrack.send('Login', {'Login Type':type, 'Login Via':_.capitalize(from), 'Login To':_.capitalize(to) });
  },
  PageView:function(name){
    appTrack.send('Page View');
  }
};