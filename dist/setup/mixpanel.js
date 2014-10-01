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
      if(typeof console !== 'undefined') console.log('MixPanel - Dev Environment')
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