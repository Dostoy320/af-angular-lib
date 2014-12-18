
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
    isLocal:false,      // running locally? (http://localhost/ or http://development/
    app:null
  },


  //
  // INIT, this only runs once per page load... (generally)
  //
  init:function(){
    if(appEnv.loaded) return; // do once.

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
    var parts = window.location.pathname.split('/');
    if (parts.length >= 2) appEnv.cache.app = parts[1].toLowerCase();

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
  },
  app : function(){
    appEnv.init();
    return appEnv.cache.app;
  }
};

appEnv.init(); // init