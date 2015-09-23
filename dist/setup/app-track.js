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

  loaded:false,

  config: {
    uid:'',
    enabled: true,
    logging: true,
    options: {
      'cross_subdomain_cookie': false,
      'debug':false
    },
    globals:{
      // App
      // Tenant (no longer sent, use domain)
      // Domain
      // Browser Version
    },
    globalUsageDelay:3600000, // 1 per an hour
    subDomain:(''+window.location.hostname).split('.').shift().toLowerCase()
  },

  //
  // INITIALIZE
  //
  init:function(settings){

    if(appTrack.loaded) return; // do once

    var domain = appCatch.config.subDomain;
    if( domain.indexOf('-dev') > 0 ||
        domain.indexOf('localhost') == 0 ||
        domain.indexOf('dev') == 0 ||
        domain.indexOf('alpha') == 0 ||
        domain.indexOf('192.168.') == 0) {
      return appCatch.error('Failed to load.  Does not load on development servers.');
    }

    // load settings
    if(!settings) return appTrack.error('Failed to load. Settings not defined.');
    for(var key in settings){
      appTrack.config[key] = settings[key];
    }

    // sanity checks
    if(!appTrack.config.enabled) 	       return console.log('Mixpanel - Disabled via config.', appCatch.config);
    if (typeof mixpanel === "undefined") return console.log('Mixpanel - Cannot initialize. Missing MixPanel library.');
    if (!appTrack.config.uid) 		       return console.log('Mixpanel - Init error. Uid not defined.');

    // init
    mixpanel.init(appTrack.config.uid, appTrack.config.options);

    appTrack.config.globals['Browser Version'] = navigator.sayswho;
    appTrack.config.globals['Domain'] = appTrack.config.subDomain;

    if(!appTrack.config.globals['App'])
      appTrack.error('"App" global not defined!!');

    mixpanel.register(appTrack.config.globals);
    console.log('Mixpanel Init:', appTrack.config);
    appTrack.loaded = true;
  },


  // HELPERS
  amplifyExists:function(){
    return typeof amplify !== 'undefined';
  },
  isEnabled:function(){
    return appTrack.loaded && appTrack.config.enabled;
  },
  userShouldBeTracked:function(){
    if(appTrack.amplifyExists())
      return amplify.store('mixpanel_trackUserStats') === true;
    return true;
  },

  shouldTrack:function(){
    return appTrack.isEnabled() && appTrack.userShouldBeTracked();
  },


  //
  // WHO stats are tracked for
  //
  // can disable/enable after init by setting a cached setting
  trackUserStats:function(value){
    if(!appTrack.isEnabled() || !appTrack.amplifyExists()) return;
    amplify.store('mixpanel_trackUserStats', value);
  },
  setUserId: function (userId) {
    if(!appTrack.isEnabled()) return;
    mixpanel.identify(userId);
    // cache for later
    if(appTrack.amplifyExists())
      amplify.store('mixpanel_trackUserId', userId);
  },
  getUserId:function(){
    if(!appTrack.isEnabled() || !appTrack.amplifyExists()) return null;
    return amplify.store('mixpanel_trackUserId');
  },
  setProfile: function (object) {
    if(!appTrack.isEnabled()) return;
    mixpanel.people.set(object);
  },


  //
  // METHODS
  //
  // mixpanel.track("Register", {"Gender": "Male", "Age": 21}, 'Auth');
  send: function (name, tags, globalModule) {
    appTrack.track(name, tags, globalModule); // alias
  },

  track: function (name, tags, globalModule) {
    if(!appTrack.shouldTrack()) return;
    mixpanel.track(name, tags);
    if(globalModule) appTrack.trackGlobalUsage(globalModule);
  },

  trackGlobalUsage:function(module){
    if(!appTrack.shouldTrack() || !appTrack.getUserId() || !appTrack.amplifyExists()) return;
    module = module || 'Other';
    var key = 'mixpanel_globalUsage_'+module+'-'+appTrack.getUserId();
    if(amplify.store(key))
      return; // tracked recently?
    appTrack.send('Global Usage', { Module:module });
    appTrack.increment('Global Usage');
    // cache so we don't send again right away...
    amplify.store(key, true, { expires:appTrack.config.globalUsageDelay });
  },

  increment:function(name){
    if(!appTrack.shouldTrack() || !appTrack.getUserId()) return;
    mixpanel.people.increment(name);
  },

  // Register a set of super properties, which are automatically included with all events.
  // { key:value }
  register: function (options) {
    if(!appTrack.shouldTrack()) return;
    mixpanel.register(options);
  },
  // removes a registered key
  unregister: function (key) {
    if(!appTrack.shouldTrack()) return;
    mixpanel.unregister(key);
  },



  //
  // METHODS
  //
  TRACK_LOGIN:function(type, from, to){
    appTrack.send('Login', {'Login Type':type, 'Login Via':from, 'Login To':to }, 'Auth');
  },
  PageView:function(){
    appTrack.send('Page View');
  }
};