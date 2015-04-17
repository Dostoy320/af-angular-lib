//
// TENANTS CONFIGURATION (labels, theme, etc)
//
var appTenant = {

  _config:{}, // holds config (loaded from db or php, or whatever)

  init:function(config){
    appTenant._config = config;
  },

  config:function(path, makePlural){
    if(!path) return appTenant._config; // return entire config if no path
    var value = _.getPathValue(appTenant._config, path);
    if(!_.hasValue(value)) {
      console.log('appTenant.config(' + path + ') MISSING!');
      return '';
    }
    if(makePlural) {
      var customPluralValue = _.getPathValue(appTenant._config, path + '_plural');
      if(_.hasValue(customPluralValue)) return customPluralValue;
      return appTenant.makePlural(value);
    }
    return value;
  },

  makePlural:function(value){
    if(!value) return value;
    if(typeof value !== 'string') return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  },

  // quickie makers
  label:function(value, plural){ return appTenant.config('labels.'+value, plural)},
  enabled:function(value){ return appTenant.config('enabled.'+value)}

};