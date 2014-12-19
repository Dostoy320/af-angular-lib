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