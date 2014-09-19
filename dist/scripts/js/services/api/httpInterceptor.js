(function() {
  var httpInterceptor, myApp;

  myApp = angular.module('af.httpInterceptor', ['af.api', 'af.sentry', 'af.msg']);

  myApp.factory("httpInterceptor", httpInterceptor = function($q, $injector, api, $window, $config, $msg, $log, $loader, $sentry) {
    var interceptor, isObject, responseIsJsend;
    responseIsJsend = function(response) {
      return isObject(response) && response.hasOwnProperty('status');
    };
    isObject = function(item) {
      return typeof item === 'object';
    };
    interceptor = {
      request: function(request) {
        var appendDebug;
        if (request.method == null) {
          request.method = 'POST';
        }
        appendDebug = request.appendDebug !== false;
        if (appendDebug && isObject(request.data) && !request.data.debug) {
          api.addDebugInfo(request);
        }
        return request;
      },
      response: function(response) {
        if (response.status !== 200 || (responseIsJsend(response.data) && response.data.status !== 'success')) {
          return interceptor.responseError(response);
        }
        if (responseIsJsend(response) && response.data.data) {
          response.data = response.data.data;
        }
        return response;
      },
      responseError: function(response) {
        var ignore, message;
        ignore = response.config.ignoreExceptions;
        if (ignore === true || (_.isArray(ignore) && _.contains(ignore, response.status))) {
          return $q.reject(response);
        }
        message = api.getErrorMessage(response.data, response.status);
        $sentry.error(message, {
          extra: 'TODO'
        });
        $msg.error(message);
        $loader.stop();
        console.log('ERROR!');
        return $q.reject(response);
      }
    };
    return interceptor;
  });

}).call(this);
