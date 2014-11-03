(function() {

  var myApp;

  myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.authManager', 'af.sentry', 'af.util', 'af.config']);

  myApp.service('api', function($window, $http, $log, $msg, authManager, $loader, $sentry, $util, $config) {

    var api = {

      // request options
      defaultRequest:{
        method:'POST',
        url:'',
        // options
        autoApplySession:true,  // should a sessionToken be added to all api calls automatically?
        autoApplyIndex:false,   // should the node db index to api calls automatically?
        urlEncode:false,        // send as application/x-www-form-urlencoded
        // response options
        logErrors:true,         // on error, log to sentry (or whatever)
        displayError:true,      // on error, display error to user
        loaderStop:true         // on error, stop loader
      },


      //
      // BASE CALL
      //
      // ALL api calls run through this function
      execute: function(request, onSuccess, onError) {
        request.method = request.method || 'POST';

        // slap some stuff on our requests
        request.debug = api.getDebugInfo();

        // auto add session?
        if(api.optionEnabled(request, 'autoApplySession')){
          request.data = request.data || {}
          request.data.sessionToken = authManager.findSessionToken()
        }

        // auto add index?
        if(api.optionEnabled(request, 'autoApplyIndex')){
          request.data = request.data || {}
          request.data.tenant = $config.index();
        }

        // if we want urlEncoded... deal with that
        if(api.optionEnabled(request, 'urlEncode')){
          // add urlencoded header
          request.headers = request.headers || {}
          if(!request.headers.hasOwnProperty('Content-Type'))
            request.headers['Content-Type'] = 'application/x-www-form-urlencoded'
          // data needs to be in string format
          if(request.data && !_.isString(request.data))
            request.data = $.param(request.data)
        }

        // execute the call
        $http(request)
          .success(function(data, status, headers, config) { api.responseHandler(data, status, request, onSuccess, onError); })
          .error(function(data, status, headers, config) {   api.responseHandler(data, status, request, onSuccess, onError); })
      },


      // ALL api responses pass through this function
      responseHandler:function(data, status, request, onSuccess, onError) {
        // remove passwords
        if (request && request.data && request.data.password) request.data.password = '********';
        if (request && request.password) request.password = '********';

        // is this response an error?
        var isSuccess = true;
        if (status !== 200) isSuccess = false;
        if (api.responseIsJSEND(data) && data.data.status !== 'success') isSuccess = false;

        // handle response
        if (isSuccess) {
          // SUCCESS!
          if (onSuccess) {
            if (api.responseIsJSEND(data)) data = data.data // strip status off response
            onSuccess(data, status, request)
          }
        } else {
          // ERROR - handle it
          if (onError) onError(data, status, request)
          api.handleApiError(data, status, request)
        }
      },


      optionEnabled:function(request, optionName){
        if(request.options && request.options.hasOwnProperty(optionName))
          return request.options[optionName]
        return api.defaultRequest[optionName]
      },

      //
      // PARAMETERS ADDED TO REQUEST
      //
      // add debugs info to requests (don't do on Java, Java could blow up)
      getDebugInfo: function() {
        return {
          url:    $window.location.href,
          index:  $config.index(),
          tenant: $config.tenant(),
          env:    $config.env()
        }
      },
      getOptions:function(options){
        return _.extend(api.defaultRequest, options || {})
      },

      /*
      // method to automatically add the users sessionToken to all calls
      autoAddSessionTokenToParams:function(params, options){
        var params = params || {}
        var options = options || {}
        if(params.sessionToken != null) return params; // do nothing if already passed

        // slap on a sessionToken?
        var userRequestedOn = options.autoApplySession === true
        var userRequestedOff = options.autoApplySession === false
        if (userRequestedOn || (api.defaultRequest.autoApplySession && !userRequestedOff))
          params.sessionToken = authManager.findSessionToken()
        return params
      },
      */
      /*
      // method to automatically add the users sessionToken to all calls
      autoAddIndexToParams:function(params, options){
        var params = params || {}
        var options = options || {}
        if(params.tenant != null) return params; // do nothing if already passed

        // slap on a sessionToken?
        var userRequestedOn = options.autoApplyIndex === true
        var userRequestedOff = options.autoApplyIndex === false
        if (userRequestedOn || (api.defaultRequest.autoApplyIndex && !userRequestedOff))
          params.tenant = $config.index()
        return params
      },
      */


      //
      // ERROR HANDLING
      //
      handleApiError: function(data, status, request) {
        // log error unless told not to
        if((request.hasOwnProperty('logError') && request.logErrors === true) || api.defaultRequest.logErrors)
          api.logApiError(data, status, request);

        // display message unless told not to
        if((request.hasOwnProperty('displayError') && request.displayError === true) || api.defaultRequest.displayError)
          $msg.error(api.getErrorMessage(data, status));

        // stop loaders unless told not to
        if((request.hasOwnProperty('loaderStop') && request.loaderStop === true) || api.defaultRequest.loaderStop)
          $loader.stop();
      },

      logApiError:function(data, status, request){
        // remove passwords
        if (request && request.data && request.data.password) request.data.password = '********';
        if (request && request.password) request.password = '********';
        console.log('LOGGING: ', request)
        // get message
        var message = api.getErrorMessage(data, status);
        $sentry.error(message, { extra: request });
        $log.error(message, status);
      },

      getErrorMessage: function(data, status) {
        // was this JSEND ERROR?
        if(data && data.hasOwnProperty('message') && data.hasOwnProperty('code')) {
          var codeStr = api.getHttpCodeString(data.code);
          if (data.message === codeStr) {
            return data.message + ' (' + data.code + ')';
          } else {
            return data.message + ' (' + codeStr + ')';
          }
        }
        if(_.isNumber(status) && api.isHttpCode(status)) {
          var err = api.getHttpCodeString(status);
          if (status === 502) err = 'Unable to communicate with server. Please check your internet connection.';
          return err + ' (' + status + ')';
        }
        // return whatever info we can
        return data.message || data.code || data || status;
      },



      //
      // UTIL
      //
      responseIsJSEND:function(data) {
        return _.isObject(data) && _.isObject(data.data) && data.data.hasOwnProperty('status');
      },


      ensureInt: function(value) {
        if (_.isString(value)) return parseInt(value);
        return value;
      },
      ensureBool: function(value) {
        if (value === 'true' || 1)  return true;
        if (value === 'false' || 0) return false;
        return value;
      },
      ensureString: function(value) {  return '' + value; },
      standardResolve: function(defer, data) {
        return function(error) {
          if (error) {
            return defer.reject(error);
          } else {
            return defer.resolve(data);
          }
        };
      },
      standardReject: function(defer) {
        return function(data, status, headers, config) {
          return defer.reject(api.getErrorMessage(data, status));
        };
      },
      isHttpCode: function(code) {
        return _.isString(api.getHttpCodeString(code));
      },
      getHttpCodeString: function(code) {
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
        if (http_codes.hasOwnProperty(code))
          return http_codes[code];
        return code;
      }
    };


    return api

  });

}).call(this);
