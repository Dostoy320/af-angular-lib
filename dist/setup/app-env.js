
//
// THIS FILE CONTAINS ALL THE INFORMATION NEEDED TO PROVIDE
// THE CLIENT WITH INFORMATION ABOUT ITS ENVIRONMENT
//

var appEnv = {


  // this gets filled out once per page load...
  loaded:false,
  cache:{
    subDomain:'',
    subDomainClean:'',
    tenant:'',
    index:'',
    isLocal:'',
    env:'',
    app:''
  },


  // DEVELOPMENT OVERRIDES (SEE BOTTOM OF PAGE!!!!!)
  // these can get overwritten by window.devConfig
  // index essentially provides node with the database
  dev:{
    alpha:{     tenant:'actifi', index:'alpha'  },
    alpha2:{    tenant:'actifi', index:'alpha2' },
    localhost:{ tenant:'actifi', index:'alpha2' }
  },



  //
  // INIT, this only runs once per page load... (generally)
  //
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

    // load tenant index for node (db uid)
    if(appEnv.cache.isLocal)                        appEnv.cache.index = appEnv.dev.localhost.index;
    if(appEnv.cache.subDomainClean == 'alpha')      appEnv.cache.index = appEnv.dev.alpha.index;
    if(appEnv.cache.subDomainClean == 'alpha2')     appEnv.cache.index = appEnv.dev.alpha2.index;
    if(appEnv.cache.subDomainClean == 'tdai')       appEnv.cache.index = 'td'; // special case
    if(appEnv.cache.subDomainClean == 'waddell')    appEnv.cache.index = 'wr'; // special case
    if(!appEnv.cache.tenant)  appEnv.cache.index =  appEnv.cache.tenant; // defaults to tenant

    // set app... mainly for logging/sentry/tagging etc...
    if(!appEnv.cache.app){
      // attempt to auto get app from pathname....
      appEnv.cache.app = '';
      var parts = window.location.pathname.split('/');
      if (parts.length >= 2) appEnv.cache.app = parts[1].toLowerCase();
    }

    // save that it loaded... and log it...
    appEnv.loaded = true;
    if(typeof console !== 'undefined')
      console.log(appEnv.cache.env.toUpperCase()+' Env Loaded', appEnv.cache);
  },


  //
  // GETTERS
  //
  isProd : function(){
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.env !== 'dev';
  },
  isDev : function(){
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.env === 'dev';
  },
  isLocal : function(){
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.isLocal;
  },
  subDomain : function(){
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.subDomain;
  },
  // returns domain with -dev stripped off
  subDomainClean:function(){
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.subDomainClean;
  },
  env : function(){
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.env;
  },
  tenant : function() {
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.tenant;
  },
  index : function() {
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.index;
  },
  app : function() {
    if(!appEnv.loaded) appEnv.init();
    return appEnv.cache.app;
  }
}

// if this is set.. use it...
if(window.devConfig) appEnv.dev = window.devConfig;