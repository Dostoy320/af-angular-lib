//
//  BASIC APP SETUP NEEDS
//
window.appEnv = {

  // tenant/index for development
  dev:{
    localhost:{
      tenant:'actifi',
      index:'alpha2'
    },
    alpha:{
      tenant:'waddell',
      index:'alpha'
    },
    alpha2:{
      tenant:'td',
      index:'alpha2'
    }
  },


  //
  //  SUB DOMAIN
  //
  getSubDomain : function(){
    return (window.location.host).split('.').shift().toLowerCase();
  },
  // strips -dev off off sub domains
  getCleanSubDomain:function(){
    var subDomain = appEnv.getSubDomain();
    if(subDomain.indexOf('-dev') > -1) return subDomain.split('-').shift();
    return subDomain;
  },


  //
  //  ENVIRONMENT
  //
  getEnv : function(){
    var subDomain = appEnv.getSubDomain();
    if(subDomain === 'localhost')           return 'dev';
    if(subDomain === 'dev')                 return 'dev';
    if(subDomain.indexOf('192.168.') === 0) return 'dev';
    if(subDomain.indexOf('alpha') === 0)    return 'dev';
    if(subDomain.indexOf('-dev') > -1)      return 'dev';
    return 'prod';
  },
  // is development quickie
  isDev : function(){ return appEnv.getEnv() === 'dev' },


  //
  //  TENANT
  //
  getTenant : function() {
    var subDomain = appEnv.getCleanSubDomain();

    // check for special cases
    if(subDomain.indexOf('192.168.' === 0))
      return appEnv.dev.localhost.tenant;
    switch (subDomain) {
      case 'dev':
      case 'localhost': return appEnv.dev.localhost.tenant;
      case 'alpha':     return appEnv.dev.alpha.tenant;
      case 'alpha2':    return appEnv.dev.alpha2.tenant;
      case 'tdai':      return 'td';
    }
    return subDomain;
  },

  getTenantIndex : function() {
    var index = appEnv.getTenant();
    var subDomain = appEnv.getCleanSubDomain();
    // check for special cases
    if(subDomain.indexOf('192.168.' === 0))
      return appEnv.dev.localhost.index;
    switch(subDomain){
      case 'dev':
      case 'localhost': return appEnv.dev.localhost.index;
      case 'alpha':     return appEnv.dev.alpha.index;
      case 'alpha2':    return appEnv.dev.alpha2.index;
      case 'tdai':      return 'td';
      case 'waddell':   return 'wr';
    }
    return index;
  }

}