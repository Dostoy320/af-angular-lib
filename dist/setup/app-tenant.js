//
// TENANTS CONFIGURATION (labels, theme, etc)
//
var appTenant = {

  _config:{}, // holds config (loaded from db or php, or whatever)


  config:function(path, makePlural) {
    if (!path) return appTenant._config; // return whole config
    var value = appTenant.get(path);
    if(!appTenant._hasValue(value)) {
      console.log('appTenant.get(' + path + ') MISSING!');
      return '';
    }
    if(makePlural) {
      var pluralValue = appTenant.get(path + '_plural');
      if(appTenant._hasValue(pluralValue)) return pluralValue;
      return appTenant._makePlural(value);
    }
    return value;
  },

  // get value from objects using dot notation..
  // eg: get('name.first')
  get:function(path, parent) {
    if(!parent) parent = appTenant._config;
    var parts = (''+path).split('.');
    var part = parts[0];
    if(!parent[part]) return null;
    if (parts.length === 1) return parent[part];
    var child = parent[parts.shift()];
    if (!child) return null;
    return appTenant.get(child, parts.join('.'));
  },


  //
  // UTIL
  //
  _hasValue:function(value){
    return typeof value !== 'undefined' && value !== null;
  },
  _makePlural:function(value){
    if(!value) return value;
    if(typeof value !== 'string') return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  }


}