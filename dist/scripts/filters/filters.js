
angular.module('af.filters', [])


  // eg {{'user.name' | label}}
  // <span ng-bind="'user' | tenantLabel | plural"></span>
  .filter('tenantConfig', function() {  return appTenant.config; })
  .filter('tenantLabel', function() {   return appTenant.label; })
  .filter('tenantEnabled', function() { return appTenant.enabled; })

  .filter('plural', function() {        return appTenant.makePlural; })

  .filter('tenantImage', function($filter) {
    return function(file) {
      var tnt = appTenant.config('tenant');
      return '/tenant/' + tnt + '/images/' + tnt + '_' + file;
    };
  })
  .filter('activeItems', function($filter){
    return function(items) {
      return $filter('propertyIsTrue')(items, 'active');
    }
  })
  .filter('propertyIsTrue', function() {
    return function(items, property) {
      if(_.isArray(items))
        return _.filter(items, function(item){
          return item[property] === true;
        });
      return item[property] === true;
    };
  })