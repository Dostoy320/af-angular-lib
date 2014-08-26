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

  getSubDomain : function(){
    return (window.location.host).split('.').shift().toLowerCase();
  },

  // dev or prod?
  getEnv : function(){
    var subDomain = sentrySetup.getSubDomain();
    if(subDomain.indexOf('alpha') === 0) return 'dev';
    if(subDomain.indexOf('-dev') > -1) subDomain = subDomain.split("-dev").shift();
    switch(subDomain){
      case 'dev':
      case 'localhost':
        return 'dev'
    }
    return 'prod';
  },

  init:function(){
    // what url?
    var url = sentrySetup.prodUrl
    if(sentrySetup.getEnv() === 'dev') url = sentrySetup.devUrl
    // this NEEDS to be loaded.. important our apps are sending errors.
    if(typeof Raven === "undefined") return alert('Raven/Sentry Setup Failed. Raven undefined')
    // init
    Raven.config(url, sentrySetup.options).install()
    // Attach user data if possible
    if(typeof amplify !== "undefined"){
      var user = {}
      if(amplify.store('userId')) user.id = amplify.store('userId');
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

//<!-- start Mixpanel --><script type="text/javascript">
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
//mixpanel.init("YOUR TOKEN");</script><!-- end Mixpanel -->

var mixPanelSetup = {

  prodToken : 'd0695354d367ec464143a4fc30d25cd5', // PROD
  devToken  : 'c783e4625a55094cbf9d91c94d285242', // DEV

  init : function(){
    var token = mixPanelSetup.prodUrl
    if(sentrySetup.getEnv() === 'dev') token = mixPanelSetup.devUrl
    mixpanel.init(token);
    // ALL mixPanel events will contain this data...
    mixpanel.register({
      domain:sentrySetup.getSubDomain(),
      env:sentrySetup.getEnv()
    });
  }
}
// init mixPanel
mixPanelSetup.init();