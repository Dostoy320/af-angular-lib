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




//
// SENTRY
//
var sentrySetup = {

  prodUrl : 'https://c62072b6aefc4bf1bd217382b9b7dad5@app.getsentry.com/27961', // PROD : nalberg@actifi.com
  devUrl : 'https://656d24f28bbd4037b64638a4cdf6d61d@app.getsentry.com/26791',  // DEV : alberg.nate@actifi.com

  options:  {
    whitelistUrls:[ 'actifi.com/' ],
    ignoreUrls: [ /extensions\//i, /^chrome:\/\//i ]
  },

  init:function(){
    // what url?
    var url = sentrySetup.prodUrl
    if(appEnv.getEnv() === 'dev'){
      url = sentrySetup.devUrl;
      console.log('Sentry - Dev Environment')
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



//
// MIX PANEL
//
// start mixpanel lib
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
// end mixpanel lib

var mixPanelSetup = {

  prodToken : 'd0695354d367ec464143a4fc30d25cd5', // PROD
  devToken  : 'c783e4625a55094cbf9d91c94d285242', // DEV

  init : function(){
    var token = mixPanelSetup.prodToken
    if(appEnv.getEnv() === 'dev'){
      token = mixPanelSetup.devToken;
      console.log('MixPanel - Dev Environment')
    }

    window.mixpanel.init(token);
    // ALL mixPanel events will contain this data...
    window.mixpanel.register({
      domain:appEnv.getSubDomain(),
      env:appEnv.getEnv()
    });
  }
}
// init mixPanel
mixPanelSetup.init();