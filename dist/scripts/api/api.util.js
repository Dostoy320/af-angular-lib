(function() {

angular.module('af.apiUtil', ['af.msg', 'af.loader'])

  // DEFAULT HTTP REQUEST OPTIONS
  .constant('HTTP_REQUEST_OPTIONS', {
    disableHttpInterceptor:false, // disable the http interceptor completely
    // request options:
    method:'POST',
    url:'',
    urlEncode:false,              // send as application/x-www-form-urlencoded
    // response options:
    logErrors:true,               // on error, log to sentry (or whatever)
    displayErrors:true            // on error, display error to user
  })



  .service('apiUtil', function($window, $log, $msg, HTTP_REQUEST_OPTIONS, $loader, $q) {

    var apiUtil = {

      // turning this on will allow you to
      // suppress error messages displayed by $http requests
      // and handle the them manually
      // don't forget to turn it back on!
      // HTTP errors will STILL BE LOGGED!
      suppressErrorMessages:false,


      //
      // REQUEST
      //
      request:{
        // creates a request... merges default request, with anything users passes in
        defaults:function(){
          return _.clone(HTTP_REQUEST_OPTIONS);
        },
        // debug info object for requests
        debugInfo: function() {
          return {
            url: $window.location.href,
            env: appEnv.env()
          }
        },
        isFile:function(request){
          // if end of our request contains a period.. probably not an api request
          if(!request || !request.url) return false;
          return request.url.substr(request.url.length - 5).indexOf('.') >= 0
        },
        optionEnabled:function(request, optionName){
          if(_.isObject(request) && _.has(request, optionName))
            return request[optionName];
          return false;
        },
        urlEncode:function(request){
          // add urlencoded header
          request.headers = request.headers || {};
          _.extend(request.headers, {'Content-Type':'application/x-www-form-urlencoded'});
          // data needs to be in string format
          if(!_.isString(request.data)) request.data = $.param(request.data);
          return request;
        }
      },


      //
      // RESPONSE
      //
      response:{
        // response = {status,data,headers}
        // jsend =    {status,data} or {status, message, code}
        isJSEND:function(responseOrData) {
          if(!_.isObject(responseOrData) || !_.has(responseOrData, 'status'))
            return false;

          // get the actual data if its a http response
          var data = responseOrData;
          if(_.isFunction(responseOrData.headers))
            data = responseOrData.data;

          // check for our two jsend formats
          if(_.has(data, 'code') && _.has(data, 'message')) return true;
          if(_.has(data, 'data')) return true;
          return false;
        }

      },


      //
      // ERRORS
      //
      error:{
        // Basic Error Handler.
        // This is typically automatically called by a
        // httpInterceptor, or manually.. if your not using it.
        handler:function(response){
          // stop any loaders on error
          $loader.stop();

          // only handle this once
          if(response.handled === true) return;

          var request = response.config;
          var data = response.data;
          var status = response.status;

          // log it with appTrack
          if(apiUtil.request.optionEnabled(request, 'logErrors'))
            apiUtil.error.logger(response);

          // don't log these ones to console...
          if(response.status !== 'InvalidLoginParameter' &&  response.status !== 'InvalidSession')
            $log.error('Whoops!', data, response);

          // display it?
          if(apiUtil.request.optionEnabled(request, 'displayErrors') && !apiUtil.suppressErrorMessages)
            apiUtil.error.display(response);

          // store the fact we handled it.
          response.handled = true;
        },
        logger:function(response){
          if(!response) return appCatch.send('Unable To Log. No Response');

          // if its a string.. just send that.
          if(_.isString(response)) return appCatch.send(response);

          var request = response.config || {};
          // don't log credentials!!
          if (_.isString(request.data))
            request.data = request.data.replace(/(password=)[^\&]+/, 'password=********');
          else if (_.isObject(request.data) && _.has(request.data, 'password'))
            request.data.password = '********';

          // log it with some info about the request that failed
          var extra = {
            url:request.url || '',
            data:request.data || ''
          };
          appCatch.send(apiUtil.error.getMessage(response), extra);
        },
        display:function(response){
          $msg.error(apiUtil.error.getMessage(response))
        },
        // attempts to get a humanized response from an error.
        getMessage: function(response) {
          if(response.status === 502)
            return 'Unable to communicate with server. Please check your internet connection.';
          if(response.status === 503 && (response.body+'').indexOf('Application Error') >= 0)
            return 'Service Unavailable. An Application Error Has occurred. Please try again.';
          return response.data || response.statusText || apiUtil.getHttpCodeString(response.status);
        }
      },


      //
      //  PROMISE
      //
      promise:{
        // quickly return resolved data
        resolvedPromise:function(data){
          var defer = $q.defer();
          defer.resolve(data);
          return defer.promise;
        },
        // creates a rejection similar to an $http rejection
        // data and defer are optional
        rejectedPromise:function(status, data, defer){
          var response = {
            status:status,
            data:data,
            config:{}
          };
          if(arguments.length == 1)
            response.data = status;
          if(arguments.length == 2 && _.isFunction(data)){
            // data a defer
            response.data = status;
            defer = data;
          }
          return apiUtil.promise.reject(response, defer);
        },
        reject:function(response, defer){
          if(defer) return defer.reject(response);
          return $q.reject(response);
        },
        catcher:function(response){
          apiUtil.error.handler(response);
          return apiUtil.promise.reject(response);
        }
      },




      //
      // UTIL
      //
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
        return _.isString(apiUtil.getHttpCodeString(code));
      },
      getHttpCodeString: function(code) {
        if(_.has(http_codes, code)) return http_codes[code];
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

    return apiUtil;

  });

}).call(this);
