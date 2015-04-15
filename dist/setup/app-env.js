//
// CLIENT ENVIRONMENT
// provides client with setup information
//
/*
var appEnv = {

  config:{
    host:'',
    env:'production',
    tenant:'',
    index:'',
    app:''
  },

  // init
  init:function(config){  appEnv.config = config;  },

  get : function(key){    return appEnv.config[key]; },

  host : function(){      return appEnv.config.host; },
  env : function(){       return appEnv.config.env; },
  tenant : function() {   return appEnv.config.tenant; },
  index : function() {    return appEnv.config.index; },
  app : function() {      return appEnv.config.app;  },

  // misc
  sentry : function() {     return appEnv.config.sentry; },
  mixpanel : function() {     return appEnv.config.mixpanel; }

  //subDomain : function(){ return appEnv.host(); },
  //isProd : function(){    return appEnv.env() !== 'development'; },
  //isDev : function(){     return appEnv.env() === 'development'; },
  //isLocal : function(){   return (appEnv.host() === 'localhost' || appEnv.host() === 'dev') ? true:false; },
};
*/