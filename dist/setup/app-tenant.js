//
// TENANTS CONFIGURATION (labels, theme, etc)
//
var appTenant = {

  config:{}, // holds config (loaded from db or php, or whatever)

  get:function(path, makePlural) {
    if (!path) return appTenant.config; // return whole config
    var value = appTenant.getPathValue(appTenant.config, path);
    if(typeof value == 'undefined' || value === null) console.log('appTenant.get('+path+') MISSING!');
    if(makePlural) {
      var pluralValue = appTenant.getPathValue(appTenant.config, path + '_plural');
      if(pluralValue) return pluralValue;
      return appTenant.makePlural(value);
    }
    return value;
  },


  //
  // UTIL
  //
  // checks if enabled flag is true on an object
  enabled:function(path){
    return appTenant.get(path+'.enabled') === true
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

  // easily get nested value from objects
  // eg: getPathValue({ name:{ first:'John', last:'Doe'}}, 'name.first')
  getPathValue:function(object, path) {
    var parts = (''+path).split('.');
    if (parts.length === 1) return object[parts[0]];
    var child = object[parts.shift()];
    if (!child) return child;
    return appTenant.getPathValue(child, parts.join('.'));
  }
}