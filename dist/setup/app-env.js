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
