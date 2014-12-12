(function() {

  var myApp = angular.module('af.httpInterceptor', ['af.api', 'af.authManager']);

  myApp.factory("httpInterceptor", function($q, $injector, api, authManager) {

    var isDisabled = function(request){
      return api.optionEnabled(request, 'disableHttpInterceptor');
    };
    var isFile = function(request){
      // if end of our request contains a period.. probably a file request
      return request.url.substr(request.url.length - 5).indexOf('.') >= 0
    };

    var interceptor = {

      request: function(request) {
        // should this even run?
        if(isDisabled(request) || isFile(request)) return request;

        // AUTO APPLY SOME REQUEST PARAMS:
        request.method = request.method || 'POST';
        request.data = request.data || {};

        if(api.optionEnabled(request, 'autoApplyDebugInfo'))
          request.debug = api.debugInfo();

        if(api.optionEnabled(request, 'autoApplySession') && !request.data.hasOwnProperty('sessionToken'))
          request.data.sessionToken = authManager.sessionToken();

        if(api.optionEnabled(request, 'autoApplyIndex') && !request.data.hasOwnProperty('tenant'))
          request.data.tenant = appEnv.index();

        // URLENCODED?
        if (api.optionEnabled(request, 'urlEncode')) {
          // add urlencoded header
          request.headers = request.headers || {};
          _.extend(request.headers, {'Content-Type':'application/x-www-form-urlencoded'});
          // data needs to be in string format
          if(!_.isString(request.data)) request.data = $.param(request.data)
        }
        return request;
      },

      response: function(response) {
        if(!response.config) return response; // don't mess with a response that has no config
        var request = response.config;
        // should this even run?
        if(isDisabled(request) || isFile(request)) return response;

        var isJSEND = api.isJSEND(response.data);

        // is this actually an error?
        var isSuccess = true;
        if (response.status !== 200) isSuccess = false;
        if (isJSEND && response.data.status !== 'success') isSuccess = false;


        // handle response
        if (isSuccess) {
          if (isJSEND) response.data = response.data.data; // strip status junk
          return response;
        } else {
          // convert the jsend response to an actual response
          if (isJSEND){
            response.status = response.data.code;
            response.statusText = api.getHttpCodeString(response.status);
            response.data = response.data.message || 'Unknown Error, code:' + response.data.code;
          }
          return interceptor.responseError(response);
        }
      },

      responseError: function(response) {
        if(!response.config) return $q.reject(response); // don't mess with a response that has no config
        var request = response.config;
        // should this even run?
        if(isDisabled(request) || isFile(request)) return $q.reject(response);

        // handle it
        api.error.handler(response);
        return $q.reject(response);
      }
    };
    return interceptor;
  });

}).call(this);
