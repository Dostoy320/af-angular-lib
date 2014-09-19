(function() {
  var myApp;

  myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.sentry', 'af.util', 'af.config']);

  myApp.service('api', function($window, $log, $msg, $loader, $sentry, $util, $config) {
    var api;
    return api = {

      /*
      execute:(req, onSuccess, onError) ->
        req.method ?= 'POST'
        $http(req)
          .success (data, status) ->
             * could still be an error response
            if status isnt 200 or (data and data.status and data.status isnt 'success')
              if onError then return onError(data, status, req)
              return api.handleApiError(data, status, req)
             * SUCCESS! return it?
            if onSuccess
              if data and data.hasOwnProperty('data') and data.hasOwnProperty('status')
                return onSuccess(data.data, status, req) # JSEND.. return data.data
              return onSuccess(data, status, req) # return everything
          .error (data, status) ->
            api.handleApiError(data, status, req)
       */
      handleApiError: function(data, status, req) {
        var message;
        message = api.getErrorMessage(data, status);
        if (req && req.data && req.data.password) {
          req.data.password = '********';
        }
        $sentry.error(message, {
          extra: req
        });
        $log.error(message, status);
        $msg.error(message);
        return $loader.stop();
      },
      getErrorMessage: function(data, status) {
        var codeStr, err;
        if (data && data.hasOwnProperty('message') && data.hasOwnProperty('code')) {
          codeStr = api.getHttpCodeString(data.code);
          if (data.message === codeStr) {
            return data.message + ' (' + data.code + ')';
          } else {
            return data.message + ' (' + codeStr + ')';
          }
        }
        if (_.isNumber(status) && api.isHttpCode(status)) {
          err = api.getHttpCodeString(status);
          if (status === 502) {
            err = 'Unable to communicate with server. Please check your internet connection.';
          }
          return err + ' (' + status + ')';
        }
        return data.message || data.code || data || status;
      },
      addDebugInfo: function(req) {
        req.data.debug = {
          url: $window.location.href,
          index: $config.getTenantIndex(),
          tenant: $config.getTenant(),
          env: $config.getEnv()
        };
        return req;
      },
      ensureInt: function(value) {
        if (_.isString(value)) {
          return parseInt(value);
        }
        return value;
      },
      ensureBool: function(value) {
        if (value === 'true' || 1) {
          return true;
        }
        if (value === 'false' || 0) {
          return false;
        }
        return value;
      },
      ensureString: function(value) {
        return '' + value;
      },
      standardResolve: function(defer, data) {
        return function(error) {
          if (error) {
            return defer.reject(error);
          } else {
            return defer.resolve(data);
          }
        };
      },
      standardAsyncErr: function(next, data, status) {
        return next(api.getErrorMessage(data, status));
      },
      isHttpCode: function(code) {
        return _.isString(api.getHttpCodeString(code));
      },
      getHttpCodeString: function(code) {
        var http_codes;
        http_codes = {
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
        if (http_codes.hasOwnProperty(code)) {
          return http_codes[code];
        }
        return code;
      }
    };
  });

}).call(this);
