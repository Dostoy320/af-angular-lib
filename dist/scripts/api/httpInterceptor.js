(function() {

  var myApp = angular.module('af.httpInterceptor', ['af.api', 'af.authManager', 'af.config']);

  myApp.factory("httpInterceptor", function($q, $injector, api, authManager, $config) {

    var interceptor = {

      request: function(request) {
        // is this interceptor enabled?
        if(api.optionEnabled('disableHttpInterceptor')) return request;
        // don't monkey with requests that have a period in them (files)
        if(request.url && request.url.indexOf('.') >= 0) return request;

        // slap some stuff on our requests
        request.method = request.method || 'POST';
        request.debug = api.getDebugInfo();
        if (api.optionEnabled(request, 'autoApplySession')) {
          request.data = request.data || {}
          if(!request.data.sessionToken) request.data.sessionToken = authManager.sessionToken()
        }
        if (api.optionEnabled(request, 'autoApplyIndex')) {
          request.data = request.data || {}
          if(!request.data.tenant) request.data.tenant = $config.index();
        }

        // if we want urlEncoded... deal with that
        if (api.optionEnabled(request, 'urlEncode')) {
          // add urlencoded header
          request.headers = request.headers || {}
          _.extend(request.headers, {'Content-Type':'application/x-www-form-urlencoded'})
          // data needs to be in string format
          if (request.data && !_.isString(request.data))
            request.data = $.param(request.data)
        }

        return request;
      },

      response: function(response) {
        // is this interceptor enabled?
        if(api.optionEnabled('disableHttpInterceptor')) return response;
        // don't monkey with requests that have a period in them (files)
        if(response.config && response.config.url && response.config.url.indexOf('.') >= 0) return response;

        // is this response an error?
        var isSuccess = true;
        var isJSEND = api.responseIsJSEND(response.data);

        if (response.status !== 200) isSuccess = false;
        if (isJSEND && response.data.status !== 'success') isSuccess = false;

        // handle response
        if (isSuccess) {
          if (isJSEND) response.data = response.data.data // strip status junk
          return response
        } else {
          return interceptor.responseError(response);
        }
      },
      responseError: function(response) {
        // is this interceptor enabled?
        if(api.optionEnabled('disableHttpInterceptor')) return $q.reject(response);
        // don't monkey with requests that have a period in them (files)
        if(response.config && response.config.url && response.config.url.indexOf('.') >= 0) return $q.reject(response);

        // handle error
        api.handleApiError(response.data, response.status, response.config);
        return $q.reject(response);
      }
    };
    return interceptor;
  });

}).call(this);
