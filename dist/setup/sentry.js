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

  init:function(){
    // what url?
    var url = sentrySetup.prodUrl
    if(appEnv.getEnv() === 'dev'){
      url = sentrySetup.devUrl;
      if(typeof console !== 'undefined') console.log('Sentry - Dev Environment')
    }

    // this NEEDS to be loaded.. important our apps are sending errors.
    if(typeof Raven === "undefined") return;
    // init
    Raven.config(url, sentrySetup.options).install();
    // Attach user data if possible
    if(typeof amplify !== "undefined"){
      var user = {}
      if(amplify.store('userId'))    user.id = amplify.store('userId');
      if(amplify.store('userEmail')) user.email = amplify.store('userEmail');
      Raven.setUser(user);
    }
  }
}
// init sentry
sentrySetup.init();