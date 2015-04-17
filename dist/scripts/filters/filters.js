
angular.module('af.filters', [])


  // eg {{'user.label' | label}}
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
  });