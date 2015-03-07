//
// CLIENT ENVIRONMENT
// provides client with setup information
//

var appEnv = {

  // stores result
  config:{
    subDomain:'',       // domain, includes -dev
    env:'production',   // development / production.
    app:'',
    tenant:'actifi',
    index:'actifi'
  },



  //
  // INIT
  //
  init:function(configFromServer){
    appEnv.config.subDomain = configFromServer.subDomain;
    appEnv.config.tenant =    configFromServer.tenant;
    appEnv.config.index =     configFromServer.index;
    appEnv.config.env =       configFromServer.env;
    appEnv.config.app =       configFromServer.app;

    // set app... mainly for logging/sentry/tagging etc...
    if(!appEnv.config.app){
      var parts = window.location.pathname.split('/');
      if (parts.length >= 2) appEnv.config.app = parts[1].toLowerCase();
    }

    // log
    console.log(appEnv.config.env.toUpperCase()+' Env Loaded', appEnv.config);
    appEnv.loaded = true;
  },


  //
  // GETTERS
  //
  isProd : function(){    return appEnv.config.env !== 'development';  },
  isDev : function(){     return appEnv.config.env === 'development';  },
  isLocal : function(){   return appEnv.config.subDomain === 'localhost'  },
  subDomain : function(){ return appEnv.config.subDomain; },
  env : function(){       return appEnv.config.env;  },
  tenant : function() {   return appEnv.config.tenant; },
  index : function() {    return appEnv.config.index;  },
  app : function() {      return appEnv.config.app;  }

};
