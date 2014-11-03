(function() {
  var httpInterceptor, myApp;

  myApp = angular.module('af.httpInterceptor', ['af.apiUtil', 'af.sentry', 'af.msg']);

  myApp.factory("httpInterceptor", httpInterceptor = function($q, $injector, apiUtil, $window, $config) {
    var getExtension, interceptor, isObject, responseIsJsend;
    responseIsJsend = function(response) {
      return isObject(response) && response.hasOwnProperty('status');
    };
    isObject = function(item) {
      return typeof item === 'object';
    };
    getExtension = function(url) {
      return url.split('.').pop();
    };
    interceptor = {
      request: function(config) {
        var appendDebug, ext;
        ext = getExtension(config.url);
        if (ext === 'php' || ext === 'html') {
          return config;
        }
        if (config.method == null) {
          config.method = 'POST';
        }
        appendDebug = config.appendDebug !== false;
        if (appendDebug && isObject(config.data) && !config.data.debug) {
          apiUtil.addDebugInfo(config);
        }
        return config;
      },
      response: function(response) {
        if (response.status !== 200 || (responseIsJsend(response.data) && response.data.status !== 'success')) {
          return interceptor.responseError(response);
        }
        if (responseIsJsend(response) && isObject(response.data) && response.data.hasOwnProperty('data')) {
          response.data = response.data.data;
        }
        return response;
      },
      responseError: function(response) {
        var ignore;
        ignore = response.config.ignoreExceptions;
        if (ignore === true || (_.isArray(ignore) && _.contains(ignore, response.status))) {
          return $q.reject(response);
        }
        apiUtil.handleApiError(response.data, response.status, response.headers, response.config);
        return $q.reject(response);
      }
    };
    return interceptor;
  });

}).call(this);
