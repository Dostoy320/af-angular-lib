(function() {

  var myApp = angular.module('af.httpInterceptor', ['af.apiUtil', 'af.authManager']);

  myApp.factory("httpInterceptor", function($q, $injector, apiUtil, sessionManager) {

    var isEnabled = function(request, key){
      return apiUtil.request.optionEnabled(request, key);
    };
    var isFile = function(request){
      // if end of our request contains a period.. probably not an api request
      return request.url.substr(request.url.length - 5).indexOf('.') >= 0
    };

    var interceptor = {

      request: function(request) {
        // should this even run?
        if(!isEnabled(request, 'disableHttpInterceptor') || isFile(request))
          return request;

        // auto apply:
        request.method = request.method || 'POST';
        request.data = request.data || {};
        if(isEnabled(request, 'autoApplySession'))
          request.data.sessionToken = sessionManager.getSessionToken();
        if(isEnabled(request, 'autoApplyIndex'))
          request.data.index = appEnv.index();
        if(isEnabled(request, 'autoApplyDebugInfo'))
          request.debug = apiUtil.debugInfo();

        // url encoded?
        if (isEnabled(request, 'urlEncode')) {
          // add urlencoded header
          request.headers = request.headers || {};
          Object.merge({'Content-Type':'application/x-www-form-urlencoded'}, request.headers);
          // data needs to be in string format
          if(!Object.isString(request.data))
            request.data = Object.toQueryString(request.data); //$.param(request.data)
        }
        return request;
      },


      response: function(response) {
        if(!response.config) return response; // don't mess with a response that has no config
        var request = response.config;
        // should this even run?
        if(!isEnabled(request, 'disableHttpInterceptor') || isFile(request))
          return response;

        var isJSEND = apiUtil.response.isJSEND(response);

        // is this actually an error?
        var isSuccess = true;
        if (response.status !== 200) isSuccess = false;
        if (isJSEND && response.data.status !== 'success') isSuccess = false;


        // handle response
        if (isSuccess) {
          if (isJSEND) response.data = response.data.data; // just return data
          return response;
        } else {
          // convert the jsend response to something httpHandler expects
          if (isJSEND){
            // jsend returns status 200, but the error status is in response data:
            // we should have -> data:{status, code, message}
            response.status = response.data.code;
            response.statusText = apiUtil.getHttpCodeString(response.data.code) + ': ' + response.data.code;
            response.data = response.data.message || 'Unknown Error. Code:' + response.data.code;
          }
          // reject it via our error handler
          return interceptor.responseError(response);
        }
      },

      responseError: function(response) {
        console.log('responseError', response);
        if(!response.config) return $q.reject(response); // don't mess with a response that has no config
        var request = response.config;
        // should this even run?
        if(!isEnabled(request, 'disableHttpInterceptor') || isFile(request))
          return $q.reject(response);
        // handle it
        apiUtil.error.handler(response);
        return $q.reject(response);
      }
    };
    return interceptor;
  });

}).call(this);
