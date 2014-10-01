//
//  BASIC APP SETUP NEEDS
//
window.appEnv = {
  getSubDomain : function(){
    return (window.location.host).split('.').shift().toLowerCase();
  },
  getEnv : function(){
    var subDomain = appEnv.getSubDomain();
    if(subDomain === 'localhost') return 'dev';
    if(subDomain === 'dev') return 'dev';
    if(subDomain.indexOf('alpha') === 0) return 'dev';
    if(subDomain.indexOf('-dev') > -1) return 'dev';
    return 'prod';
  },
  getTenant : function() {
    var subDomain = appEnv.getSubDomain();
    if(appEnv.getEnv() === 'dev') return 'td';
    switch (subDomain) {
      case 'tdai': return 'td';
    }
    return subDomain;
  }
}