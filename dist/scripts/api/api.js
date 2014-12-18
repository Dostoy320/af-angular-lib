(function() {

  // this file was pulled out of api service because of circular dependency issues with httpInterceptor

  var myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.authManager']);

  // LOAD DEFAULTS
  myApp.constant('AF_API_CONFIG', {
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
    logErrors:true,               // on error, log to sentry (or whatever)
    displayErrors:true            // on error, display error to user
  });



  myApp.service('api', function($window, $log, $msg, AF_API_CONFIG, authManager, $loader, $q, $log) {

    var api = {

      // turning this on will allow you to
      // suppress error messages displayed by $http requests
      // and handle the them manually
      // don't forget to turn it back on!
      // HTTP errors will STILL BE LOGGED!
      suppressErrorMessages:false,

      //
      // REQUEST API
      //
      // creates a request... merges default request, with anything users passes in
      newRequest:function(options){
        return _.extend({}, AF_API_CONFIG, options);
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
      // response handlers
      //
      error:{
        handler:function(response){
          $loader.stop(); // stop loader on error
          // prevents same response from getting handled/logged twice by accident
          if(response.handled === true) return;

          var request = response.config;
          var data = response.data;
          var status = response.status;

          if(response.status !== 'InvalidLoginParameter') // don't console.log this
            $log.error('Whoops: ' + data, response);

          // log it?
          if(api.optionEnabled(request, 'logErrors'))
            api.error.log(response);

          // display it?
          if(api.optionEnabled(request, 'displayErrors') && !api.suppressErrorMessages)
            api.error.display(response);

          response.handled = true;
        },
        log:function(response){
          if(_.isString(response)) return appCatch.send(response);

          var request = response.config || {};

          // don't log credentials!!
          if (request.data && _.isString(request.data))
            request.data = request.data.replace(/(password=)[^\&]+/, 'password=********');
          else if (request.data && request.data.password)
            request.data.password = '********';

          // log it
          var extra = {};
          if(request.url)  extra.url = request.url;
          if(request.data) extra.data = request.data;
          appCatch.send(api.error.getMessage(response), extra);
        },
        display:function(response){
          $msg.error(api.error.getMessage(response))
        },
        // attempts to get a humanized response from an error.
        getMessage: function(response) {
          if(response.status === 502) return 'Unable to communicate with server. Please check your internet connection.';
          return response.data || api.getHttpCodeString(response.status);
        }
      },



      //
      //  PROMISE
      //
      // generally used when returning cached data instead of
      // making an ajax call
      newResolvedPromise:function(data){
        var defer = $q.defer();
        defer.resolve(data);
        return defer.promise;
      },
      // creates a rejection similar to an $http rejection
      // TODO : dont like these names?
      reject:function(status, reason, config){
        if(arguments.length == 1) reason = status;
        return $q.reject({
          status:status,
          data:reason,
          config:{}
        });
      },
      catcher:function(defer) {
        return function (response){
          api.error.handler(response);
          if(defer)
            return defer.reject(response);
          else
            return $q.reject(response);
        }
      },



      //
      // UTIL
      //
      isJSEND:function(data) {
        if(!_.object(data) || !_.has(data, 'status')) return false;
        if(_.isFunction(data.headers)) return false;
        if(_.has(data, 'code') && _.has(data, 'message')) return true;
        if(_.has(data, 'data')) return true;
        return false;
      },
      optionEnabled:function(request, optionName){
        if(request && _.isObject(request) && request.hasOwnProperty(optionName))
          return request[optionName];
        return false;
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
      ensureString: function(value) {
        return '' + value;
      },


      // HTTP CODES
      isHttpCode: function(code) {
        return _.isString(api.getHttpCodeString(code));
      },
      getHttpCodeString: function(code) {
        if (http_codes.hasOwnProperty(code)) return http_codes[code];
        return code;
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
