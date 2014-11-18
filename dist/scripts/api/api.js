(function() {

  // this file was pulled out of api service because of circular dependency issues with httpInterceptor

  var myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.authManager', 'af.catch', 'af.config']);

  // LOAD DEFAULTS
  myApp.constant('API_REQUEST_DEFAULTS', {
    method:'POST',
    url:'',
    // options
    autoApplySession:true,  // should a sessionToken be added to ALL api calls automatically?
    autoApplyIndex:false,   // should the node db index to ALL api calls automatically?
    urlEncode:false,        // send as application/x-www-form-urlencoded
    // response options
    disableHttpInterceptor:false, // turn off to disable any http interceptor
    // errors
    logErrors:true,         // on error, log to sentry (or whatever)
    displayErrors:true,     // on error, display error to user
    loaderStopOnError:true  // on error, call $loader.stop()
  });



  myApp.service('api', function($window, $log, $msg, API_REQUEST_DEFAULTS, authManager, $loader, $catch, $config, $log, $q) {



    var api = {


      //
      // REQUEST CREATION
      //

      // creates a request... merges default request, with anything users passes in
      // generally this: createRequest(request, overrides)
      createRequest:function(){
        return _.extend({}, API_REQUEST_DEFAULTS, arguments[0], arguments[1], arguments[2])
      },
      // add debugs info to requests (don't do on Java, Java could blow up)
      getDebugInfo: function() {
        return {
          url:    $window.location.href,
          index:  $config.index(),
          tenant: $config.tenant(),
          env:    $config.env()
        }
      },



      //
      // ERROR HANDLING
      //
      handleApiError: function(data, status, request) {
        // log errors?
        if(api.optionEnabled(request, 'logErrors'))
          api.logApiError(data, status, request);

        // display message to user?
        if(api.optionEnabled(request, 'displayErrors')) {
          $log.debug('api.handleApiError: $msg.error()')
          $msg.error(api.getErrorMessage(data, status));
        }

        // stop loaders?
        if(api.optionEnabled(request, 'loaderStopOnError')) {
          $log.debug('api.handleApiError: $loader.stop()')
          $loader.stop();
        }
      },

      logApiError:function(data, status, request) {
        request = request || {}
        // remove password!!!
        if (request.data && _.isString(request.data)){
          request.data = request.data.replace(/(password=)[^\&]+/, 'password=********');
        } else {
          if (request.data && request.data.password) request.data.password = '********';
        }
        // log it
        var message = api.getErrorMessage(data, status);
        if(request.headers)
          $catch.error(message, { request:request.data, headers:request.headers, debug:data.debug });
        else
          $catch.error(message, request.data);
        $log.warn(message, status);
      },

      // attempts to get a humanized response from an error.
      getErrorMessage: function(data, status) {
        // was this JSEND ERROR?
        if (api.responseIsJSEND(data)) {
          var codeStr = api.getHttpCodeString(data.code);
          data.message = data.message || 'Whoops, an error has occured.'
          if (data.message === codeStr) {
            return data.message + ' (' + data.code + ')';
          } else {
            return data.message + ' (' + codeStr + ')';
          }
        }
        if (_.isNumber(status) && api.isHttpCode(status)) {
          var err = api.getHttpCodeString(status);
          if (status === 502) err = 'Unable to communicate with server. Please check your internet connection.';
          return err + ' (' + status + ')';
        }
        // return whatever info we can
        return data.message || data.code || data || status;
      },
      // HTTP CODES
      isHttpCode: function(code) {
        return _.isString(api.getHttpCodeString(code));
      },
      getHttpCodeString: function(code) {
        if (http_codes.hasOwnProperty(code)) return http_codes[code];
        return code;
      },



      //
      // UTIL
      //
      optionEnabled:function(request, optionName){
        if(request && request.hasOwnProperty(optionName))
          return request[optionName]
        return API_REQUEST_DEFAULTS[optionName]
      },
      responseIsJSEND:function(data) {
        return _.isObject(data) && data.hasOwnProperty('status') && (data.hasOwnProperty('data') || data.hasOwnProperty('code'));
      },
      // VALIDATION
      ensureInt: function(value) {
        if (_.isString(value)) return parseInt(value);
        return value;
      },
      ensureBool: function(value) {
        if (value === 'true' || value === 1 || value === '1')  return true;
        if (value === 'false' || value === 0 || value === '0') return false;
        return value;
      },
      ensureString: function(value) {  return '' + value; },
      
      
      //
      // RESOLVE/REJECT
      //
      resolveResponse:function(defer){
        return function(response){ defer.resolve(response); }
      },
      rejectResponse:function(defer){
        return function(response){ defer.reject(response); }
      }
    };

    var http_codes = {
      100: 'Continue',
      101: 'Switching Protocols',
      102: 'Processing',
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      203: 'Non-Authoritative Information',
      204: 'No Content',
      205: 'Reset Content',
      206: 'Partial Content',
      207: 'Multi-Status',
      300: 'Multiple Choices',
      301: 'Moved Permanently',
      302: 'Found',
      303: 'See Other',
      304: 'Not Modified',
      305: 'Use Proxy',
      306: 'Switch Proxy',
      307: 'Temporary Redirect',
      400: 'Bad Request',
      401: 'Unauthorized',
      402: 'Payment Required',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      407: 'Proxy Authentication Required',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      411: 'Length Required',
      412: 'Precondition Failed',
      413: 'Request Entity Too Large',
      414: 'Request-URI Too Long',
      415: 'Unsupported Media Type',
      416: 'Requested Range Not Satisfiable',
      417: 'Expectation Failed',
      418: 'I\'m a teapot',
      422: 'Unprocessable Entity',
      423: 'Locked',
      424: 'Failed Dependency',
      425: 'Unordered Collection',
      426: 'Upgrade Required',
      449: 'Retry With',
      450: 'Blocked by Windows Parental Controls',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
      506: 'Variant Also Negotiates',
      507: 'Insufficient Storage',
      509: 'Bandwidth Limit Exceeded',
      510: 'Not Extended'
    };

    return api

  });

}).call(this);
