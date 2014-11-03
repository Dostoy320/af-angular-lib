(function() {

  var myApp;

  myApp = angular.module('af.apiUtil', ['af.msg', 'af.loader', 'af.sentry', 'af.util', 'af.config']);

  myApp.service('apiUtil', function($window, $log, $msg, $loader, $sentry, $util, $config) {
    var apiUtil = {

      // add debugs info to requests (don't do on Java, Java could blow up)
      addDebugInfo: function(req) {
        req.data.debug = {
          url: $window.location.href,
          index: $config.getTenantIndex(),
          tenant: $config.getTenant(),
          env: $config.getEnv()
        };
        return req;
      },


      //
      //
      // ERROR HANDLING
      handleApiError: function(data, status, headers, config) {
        var message, newData, queries, request;
        request = _.omit(config || {}, 'transformRequest', 'transformResponse');
        message = apiUtil.getErrorMessage(data, status);
        // convert urlEncoded to json
        if (request.headers && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          newData = {};
          queries = (request.data + '').split("&");
          _.each(queries, function(part, i) {
            var temp;
            temp = queries[i].split('=');
            if (temp.length = 2) {
              return newData[temp[0]] = temp[1];
            }
          });
          request.data = newData;
        }

        // strip password
        if (request && request.data && request.data.password) request.data.password = '********';

        // log and display to user
        $sentry.error(message, { extra: request });
        $log.error(message, status);
        $msg.error(message);
        return $loader.stop();
      },


      getErrorMessage: function(data, status) {
        var codeStr, err;
        if (data && data.hasOwnProperty('message') && data.hasOwnProperty('code')) {
          codeStr = apiUtil.getHttpCodeString(data.code);
          if (data.message === codeStr) {
            return data.message + ' (' + data.code + ')';
          } else {
            return data.message + ' (' + codeStr + ')';
          }
        }
        if (_.isNumber(status) && apiUtil.isHttpCode(status)) {
          err = apiUtil.getHttpCodeString(status);
          if (status === 502) {
            err = 'Unable to communicate with server. Please check your internet connection.';
          }
          return err + ' (' + status + ')';
        }
        return data.message || data.code || data || status;
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
      standardReject: function(defer) {
        return function(data, status, headers, config) {
          return defer.reject(apiUtil.getErrorMessage(data, status));
        };
      },
      isHttpCode: function(code) {
        return _.isString(apiUtil.getHttpCodeString(code));
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


    return apiUtil

  });

}).call(this);
