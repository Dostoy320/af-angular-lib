//
// SENTRY
//
var sentrySetup = {

  prodUrl : 'https://c62072b6aefc4bf1bd217382b9b7dad5@app.getsentry.com/27961', // PROD : nalberg@actifi.com
  devUrl :  'https://656d24f28bbd4037b64638a4cdf6d61d@app.getsentry.com/26791', // DEV : alberg.nate@actifi.com

  options:  {
    whitelistUrls:[ 'actifi.com/' ],
    ignoreUrls: [ /extensions\//i, /^chrome:\/\//i ]
  },

  message:function(message){
    if(typeof Raven === "undefined") return;
    var options = null
    if(appEnv) {
      options = {
        extra: {url: window.location.url },
        tags: {
          app: appEnv.app(),
          env: appEnv.env(),
          tenant: appEnv.tenant(),
          index:  appEnv.index(),
          subDomain: appEnv.subDomainClean()
        }
      }
    }
    Raven.captureMessage(message, options)
  },

  init:function(prodUrl, devUrl, user){
    // what url?
    var url = prodUrl || sentrySetup.prodUrl
    if(appEnv.env() === 'dev'){
      url = devUrl || sentrySetup.devUrl;
      if(typeof console !== 'undefined') console.log('Sentry - Dev Environment')
    } else {
      if(typeof console !== 'undefined') console.log('Sentry - Prod Environment')
    }

    // this NEEDS to be loaded.. important our apps are sending errors.
    if(typeof Raven === "undefined") return;

    // init
    Raven.config(url, sentrySetup.options).install();
    if(user){
      Raven.setUser(user)
    } else {
      Raven.setUser(); // clear any prior loaded user
    }
  }
}
// init sentry
// sentrySetup.init();