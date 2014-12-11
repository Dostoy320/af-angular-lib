(function() {

  // this file was pulled out of api service because of circular dependency issues with httpInterceptor

  var myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.authManager']);

  // LOAD DEFAULTS
  myApp.constant('API_REQUEST_DEFAULTS', {
    method:'POST',
    url:'',
    // auto add some params:
    autoApplySession:true,   // should a sessionToken be added to api calls automatically?
    autoApplyIndex:false,    // should add node db index to api calls automatically?
    autoApplyDebugInfo:true, // should add node db index to api calls automatically?
    // request options:
    urlEncode:false,        // send as application/x-www-form-urlencoded
    // response options:
    disableHttpInterceptor:false, // disable the http interceptor completely
    // errors
    logErrors:true,         // on error, log to sentry (or whatever)
    displayErrors:true,     // on error, display error to user
    stopLoaderOnError:true  // on error, call $loader.stop()
  });



  myApp.service('api', function($window, $log, $msg, API_REQUEST_DEFAULTS, authManager, $loader, $log) {

    var api = {


      //
      // REQUEST API
      //
      // creates a request... merges default request, with anything users passes in
      newRequest:function(options){
        return _.extend({}, API_REQUEST_DEFAULTS, options);
      },


      // add debugs info to requests (don't do on Java, Java could blow up)
      debugInfo: function() {
        return {
          url:    $window.location.href,
          index:  appEnv.index(),
          tenant: appEnv.tenant(),
          env:    appEnv.env()
        }
      },



      //
      // REQUEST ERROR HANDLERS
      // this is generally used by a httpInterceptor
      //
      httpRequestErrorHandler: function(data, status, request) {
        $log.error('api.requestErrorHandler: ', data, status, request);

        // log errors?
        if(api.optionEnabled(request, 'logErrors'))
          api.httpRequestErrorLogger(data, status, request);

        // display message to user?
        if(api.optionEnabled(request, 'displayErrors'))
          $msg.error(api.getErrorMessage(data, status));

        // stop loaders?
        if(api.optionEnabled(request, 'stopLoaderOnError'))
          $loader.stop();
      },
      httpRequestErrorLogger:function(data, status, request) {
        request = request || {};
        // don't log passwords!!
        if (request.data && _.isString(request.data))
          request.data = request.data.replace(/(password=)[^\&]+/, 'password=********');
        else if (request.data && request.data.password)
          request.data.password = '********';
        // log it
        appCatch.send(api.getErrorMessage(data, status), request.data);
      },


      //
      // DEFAULT ERROR HANDLER for manual err handling
      // generally used to handle a response if interceptor is off
      //
      handleError:function(err, status){
        var message = api.getErrorMessage(err, status);
        // log it
        $log.error(message, err, status);
        appCatch.send(message, err);
        // display it
        $msg.error(message);
        // stop any loaders
        $loader.stop();
      },


      // attempts to get a humanized response from an error.
      getErrorMessage: function(data, status) {
        // was this JSEND ERROR?
        if (api.isJSEND(data)) {
          var codeStr = api.getHttpCodeString(data.code);
          data.message = data.message || 'Whoops, an error has occurred.';
          if (data.message === codeStr)
            return data.message + ' (' + data.code + ')';
          else
            return data.message + ' (' + codeStr + ')';
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
        if(request && optionName && request.hasOwnProperty(optionName))
          return request[optionName];
        // return default
        var defaultRequest = angular.copy(API_REQUEST_DEFAULTS);
        if(defaultRequest && optionName && defaultRequest.hasOwnProperty(optionName))
          return defaultRequest[optionName];
        // this shouldn't happen... log it
        $log.error('Invalid $http Request Option sent: '+optionName);
        appCatch.send('Invalid $http Request Option sent: '+optionName);
        return false;
      },
      isJSEND:function(data) {
        return _.isObject(data) && data.hasOwnProperty('status') && (data.hasOwnProperty('data') || data.hasOwnProperty('code'));
      },


      // VALIDATION
      ensureInt: function(value) {
        return (_.isString(value)) ? parseInt(value):value;
      },
      ensureBool: function(value) {
        if (value === 'true' || value === 1 || value === '1')  return true;
        if (value === 'false' || value === 0 || value === '0') return false;
        return value;
      },
      ensureString: function(value) {  return '' + value; }
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
