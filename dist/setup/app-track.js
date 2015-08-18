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
    tem= ua.match(/\bOPR\/(\d+)/);
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