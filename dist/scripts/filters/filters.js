
angular.module('af.filters', [])

  .filter('plural', function() {
    return appTenant.makePlural;
  })

  // eg {{'user.label' | label}}
  // <span ng-bind="'user.label' | tenantLabel | plural"></span>
  .filter('tenantLabel', function() {
    return appTenant.config;
  })

  .filter('tenantImage', function($filter) {
    return function(file) {
      var tnt = appTenant.get('tenant');
      return '/tenant/' + tnt + '/images/' + tnt + '_' + file;
    };
  });