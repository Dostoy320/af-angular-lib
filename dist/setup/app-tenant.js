//
// TENANTS CONFIGURATION (labels, theme, etc)
//
var appTenant = {

  _config:{}, // holds config (loaded from db or php, or whatever)

  init:function(config){ appTenant._config = config; },

  // quickie makers
  label:function(value, plural){
    return appTenant.get('labels.'+value, plural)
  },
  enabled:function(value){
    return appTenant.get('enabled.'+value)
  },

  get:function(path, makePlural) {
    if (!path) return appTenant._config; // return entire config if no path
    var value = appTenant.getPath(path);
    if (value === ''){
      console.log('appTenant.config(' + path + ') MISSING!');
      return '';
    }
    if(makePlural) {
      var pluralValue = _.get(appTenant._config, path + '_plural', '');
      if(pluralValue !== '') return pluralValue;
      return appTenant.makePlural(value);
    }
    return value;
  },

  // Helpers
  getPath:function(path){
    return _.get(appTenant._config, path, '');
  },

  makePlural:function(value){
    if(typeof value !== 'string' || value === '') return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    // If the word ends in a vowel (a,e,i,o,u) + y then just add s.
    if (lastChar === 'y' && lastTwoChar !== 'ay' && lastTwoChar !== 'ey' && lastTwoChar !== 'iy' && lastTwoChar !== 'oy' && lastTwoChar !== 'uy')
      return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  }

};