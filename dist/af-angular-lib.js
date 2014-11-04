
;
(function() {

  // this file was pulled out of api service because of circular dependency issues with httpInterceptor

  var myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.authManager', 'af.sentry', 'af.config']);

  // LOAD DEFAULTS
  myApp.constant('API_REQUEST_DEFAULTS', {
    method:'POST',
    url:'',
    // options
    autoApplySession:true,  // should a sessionToken be added to ALL api calls automatically?
    autoApplyIndex:false,   // should the node db index to ALL api calls automatically?
    urlEncode:false,        // send as application/x-www-form-urlencoded
    // response options
    logErrors:true,         // on error, log to sentry (or whatever)
    displayErrors:true,     // on error, display error to user
    loaderStop:true,        // on error, call $loader.stop()
    disableHttpInterceptor:false // turn off to disable any http interceptor
  });

  myApp.service('api', function($window, $log, $msg, API_REQUEST_DEFAULTS, authManager, $loader, $sentry, $config) {

    var api = {

      // creates a request... merges default request, with anything users passes in
      // generally this: createRequest(request, overrides)
      createRequest:function(){
        return _.extend({}, API_REQUEST_DEFAULTS, arguments[0], arguments[1], arguments[2])
      },

      optionEnabled:function(request, optionName){
        if(request && request.hasOwnProperty(optionName))
          return request[optionName]
        return API_REQUEST_DEFAULTS[optionName]
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

      //
      // ERROR HANDLING
      //
      handleApiError: function(data, status, request) {
        // log error unless told not to
        if((request.hasOwnProperty('logErrors') && request.logErrors === true) || API_REQUEST_DEFAULTS.logErrors)
          api.logApiError(data, status, request);

        // display message unless told not to
        if((request.hasOwnProperty('displayErrors') && request.displayErrors === true) || API_REQUEST_DEFAULTS.displayErrors)
          $msg.error(api.getErrorMessage(data, status));

        // stop loaders unless told not to
        if((request.hasOwnProperty('loaderStop') && request.loaderStop === true) || API_REQUEST_DEFAULTS.loaderStop)
          $loader.stop();
      },

      logApiError:function(data, status, request) {
        // remove password!!!
        if (!request) request = {}
        if (request.data && _.isString(request.data)){
          request.data = request.data.replace(/(password=)[^\&]+/, 'password=********');
        } else {
          if (request.data && request.data.password) request.data.password = '********';
        }
        // get message
        var message = api.getErrorMessage(data, status);
        $sentry.error(message, { extra: request });
        $log.warn(message, status);
      },

      getErrorMessage: function(data, status) {
        // was this JSEND ERROR?
        if (data && data.hasOwnProperty('message') && data.hasOwnProperty('code')) {
          var codeStr = api.getHttpCodeString(data.code);
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



      //
      // UTIL
      //
      responseIsJSEND:function(data) {
        return _.isObject(data) && data.hasOwnProperty('status') && (data.hasOwnProperty('data') || data.hasOwnProperty('code'));
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

;
/*
(function() {

  // this file was pulled out of api service because of circular dependency issues with httpInterceptor

  var myApp = angular.module('af.apiUtil', ['af.msg', 'af.loader', 'af.authManager', 'af.sentry', 'af.util', 'af.config']);

  // LOAD DEFAULTS
  myApp.constant('API_REQUEST_DEFAULTS', {
    method:'POST',
    url:'',
    // options
    autoApplySession:true,  // should a sessionToken be added to ALL api calls automatically?
    autoApplyIndex:false,   // should the node db index to ALL api calls automatically?
    urlEncode:false,        // send as application/x-www-form-urlencoded
    // response options
    logErrors:true,         // on error, log to sentry (or whatever)
    displayErrors:true,     // on error, display error to user
    loaderStop:true,        // on error, call $loader.stop()
    disableHttpInterceptor:false // turn off to disable any http interceptor
  });

  myApp.service('apiUtil', function($window, $log, $msg, API_REQUEST_DEFAULTS, authManager, $loader, $sentry, $util, $config) {

    var apiUtil = {

      mergeRequest:function(request, overrides){
        return _.extend({}, API_REQUEST_DEFAULTS, request , overrides || {})
      },

      optionEnabled:function(request, optionName){
        if(request && request.hasOwnProperty(optionName))
          return request[optionName]
        return API_REQUEST_DEFAULTS[optionName]
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

      //
      // ERROR HANDLING
      //
      handleApiError: function(data, status, request) {
        // log error unless told not to
        if((request.hasOwnProperty('logErrors') && request.logErrors === true) || API_REQUEST_DEFAULTS.logErrors)
          apiUtil.logApiError(data, status, request);

        // display message unless told not to
        if((request.hasOwnProperty('displayErrors') && request.displayErrors === true) || API_REQUEST_DEFAULTS.displayErrors)
          $msg.error(apiUtil.getErrorMessage(data, status));

        // stop loaders unless told not to
        if((request.hasOwnProperty('loaderStop') && request.loaderStop === true) || API_REQUEST_DEFAULTS.loaderStop)
          $loader.stop();
      },

      logApiError:function(data, status, request) {
        // remove password!!!
        if (!request) request = {}
        if (request.data && _.isString(request.data)){
          request.data = request.data.replace(/(password=)[^\&]+/, 'password=********');
        } else {
          if (request.data && request.data.password) request.data.password = '********';
        }
        // get message
        var message = apiUtil.getErrorMessage(data, status);
        $sentry.error(message, { extra: request });
        $log.warn(message, status);
      },

      getErrorMessage: function(data, status) {
        // was this JSEND ERROR?
        if (data && data.hasOwnProperty('message') && data.hasOwnProperty('code')) {
          var codeStr = apiUtil.getHttpCodeString(data.code);
          if (data.message === codeStr) {
            return data.message + ' (' + data.code + ')';
          } else {
            return data.message + ' (' + codeStr + ')';
          }
        }
        if (_.isNumber(status) && apiUtil.isHttpCode(status)) {
          var err = apiUtil.getHttpCodeString(status);
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
        return _.isObject(data) && data.hasOwnProperty('status') && (data.hasOwnProperty('data') || data.hasOwnProperty('code'));
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
          return defer.reject(apiUtil.getErrorMessage(data, status));
        };
      },
      isHttpCode: function(code) {
        return _.isString(apiUtil.getHttpCodeString(code));
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


    return apiUtil

  });

}).call(this);
*/
;
(function() {

  var myApp = angular.module('af.httpInterceptor', ['af.api', 'af.sentry', 'af.msg']);

  myApp.factory("httpInterceptor", function($q, $injector, api, authManager, $window, $config) {

    var interceptor = {

      request: function(request) {
        // is this interceptor enabled?
        if(api.optionEnabled('disableHttpInterceptor')) return request;

        // don't monkey with requests that have a period in them (files)
        if(request.url && request.url.indexOf('.') >= 0) return request;

        // slap some stuff on our requests
        request.method = request.method || 'POST';
        request.debug = api.getDebugInfo();
        if (request.optionEnabled(request, 'autoApplySession')) {
          request.data = request.data || {}
          request.data.sessionToken = authManager.findSessionToken()
        }
        if (api.optionEnabled(request, 'autoApplyIndex')) {
          request.data = request.data || {}
          request.data.tenant = $config.index();
        }

        // if we want urlEncoded... deal with that
        if (api.optionEnabled(request, 'urlEncode')) {
          // add urlencoded header
          request.headers = request.headers || {}
          if (!request.headers.hasOwnProperty('Content-Type'))
            request.headers['Content-Type'] = 'application/x-www-form-urlencoded'
          // data needs to be in string format
          if (request.data && !_.isString(request.data))
            request.data = $.param(request.data)
        }
        return request;
      },

      response: function(response) {
        // is this interceptor enabled?
        if(api.optionEnabled('disableHttpInterceptor')) return response;

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

        // deal with error
        api.handleApiError(response.data, response.status, response.config);
        return $q.reject(response);
      }
    };
    return interceptor;
  });

}).call(this);

;
(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api, $q) {

    var java = {

      // so you dont have to inject $http in your controllers if you injected this service already..
      call: function(request) { return $http(request); },

      //
      // ROADMAP SERVICE
      //
      RoadmapService: {
        serviceUrl: '/RoadmapService',

        // BASE
        // execute shortcut, when you have no options...
        call:function(url, params, onSuccess, onError){
          var request = java.RoadmapService.createRequest(url, params)
          java.call(request, onSuccess, onError);
        },

        // creates standard request object for this service
        createRequest:function(url, params, options){
          params = api.autoAddSessionTokenToParams(params, options)
          var defaultRequest = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + url,
            data: params || {}
          }
          return _.extend(defaultRequest, options || {})
        },

        // METHODS
        invoke: function(params, request, onSuccess, onError) {
          return java.RoadmapService.call('/invoke', params, request, onSuccess, onError);
        }
      },




      //
      // AUTH SERVICE
      //
      AuthService: {
        serviceUrl: '/RoadmapService',
        // BASE
        call:function(url, params){
          return java.call(this.createRequest(url, params));
        },
        // creates standard request object for this service
        createRequest:function(url, params, overrides){
          var request = {
            method: 'POST',
            url: java.AuthService.serviceUrl + url,
            data: params,
            // options
            urlEncode:true
          }
          // merge with default request options
          return api.createRequest(request, overrides)
        },


        // METHODS
        login: function(username, password) {
          var request = this.createRequest('/login', { username: username, password: password })
          request.autoApplySession = false;
          request.displayErrors = false;
          return java.execute(request);
        }
        /*

        UNTESTED

        ,
        logout: function(onSuccess, onError) {
          this.call('/logout', onSuccess, onError);
        },
        validatesession:function(sessionToken) {
          var params = {};
          if (sessionToken) params.sessionToken = sessionToken;
          this.call('/validatesession', params);
        },
        createtoken: function(loginAsUserId, expiresOn, url) {
          var params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          this.call('/createtoken', params);
        },
        updatetoken: function(tokenString, url) {
          this.call('/updatetoken', {tokenString: tokenString, url: url});
        },
        loadtoken: function(token) {
          var request = java.AuthService.createRequest('/loadtoken', {token: token}, {autoApplySession:false})
          api.call(request, {token: token});
        },
        changepassword: function(userId, currentPassword, newPassword) {
          var params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          this.call('/changepassword', params);
        },
        getuserfromuserid: function(userId) {
          this.call('/getuserfromuserid', {userId: userId});
        },
        loadsession: function(sessionToken) {
          this.call('/loadsession', {sessionToken: sessionToken});
        }
        */
      }
    };
    return java;
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.node', ['af.api', 'af.authManager', 'af.config']);

  myApp.service('node', function($http, api, $q) {

    var node = {

      // so you dont have to inject $http in your controllers if you injected this service already..
      call: function(request) { return $http(request); },

      RoadmapNode: {
        serviceUrl: '/roadmap-node',
        // execute shortcut for basic calls
        call:function(url, params, options){
          return node.call(this.createRequest(url, params, options));
        },
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = {
            method: 'POST',
            url: node.RoadmapNode.serviceUrl + url,
            data: params,
            // options
            autoApplyIndex:true
          }
          // merge with default request options
          return api.createRequest(request, options)
        },


        // METHODS
        save: function(type, resource, options) {
          return node.RoadmapNode.call('/api/crud/save', {_type: type, resource: resource}, options);
        },

        find: function(type, query, options) {
          return node.RoadmapNode.call('/api/crud/find', {_type: type, query: query}, options);
        },


        findOne: function(type, query, options) {
          query.limit = 1;
          return node.RoadmapNode.find(type, query, options)
            .then(function(response){
              // success
              if (_.isArray(response.data) && response.data.length >= 1)
                response.data = response.data[0]
              return response.data
            })

          /*
          return this.find(type, query, function(data) {
            if (onSuccess) {
              if (_.isArray(data) && data.length >= 1) {
                return onSuccess(data[0]);
              }
              return onSuccess(null);
            }
          }, onError);
          */
        }
        /*
        remove: function(type, id, onSuccess, onError) {
          id = api.ensureInt(id);
          return node.RoadmapNode.execute('/api/crud/remove', {
            _type: type,
            id: id
          }, onSuccess, onError);
        }
        */
      }

      /*
      Batch: {
        execute: function(method, params, onSuccess, onError) {
          return node.RoadmapNode.execute('/api/batch' + method, params, onSuccess, onError);
        }
      },


      QuickContent: {
        serviceUrl: '/quick-content',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params == null) {
            params = {};
          }
          if (params.index == null) {
            params.index = $config.index();
          }
          if (autoApplySession) {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          req = {
            url: node.QuickContent.serviceUrl + method,
            data: params
          };
          req = api.addDebugInfo(req);
          return api.execute(req, onSuccess, onError);
        },
        mget: function(body, onSuccess, onError) {
          var params;
          params = {
            type: 'recommendations',
            body: body
          };
          return node.QuickContent.execute('/mget', params, function(data) {
            if (!onSuccess) {
              return;
            }
            if (data && data.docs) {
              data.docs = node.QuickContent.flatten(data.docs);
              return onSuccess(data.docs);
            } else {
              return onSuccess(data);
            }
          }, onError);
        },
        search: function(body, onSuccess, onError) {
          var params;
          params = {
            type: 'recommendations',
            body: body
          };
          return node.QuickContent.execute('/search', params, function(data) {
            if (!onSuccess) {
              return;
            }
            if (data && data.hits && data.hits.hits) {
              data.hits.hits = node.QuickContent.flatten(data.hits.hits);
              return onSuccess(data.hits);
            } else {
              return onSuccess(data);
            }
          }, onError);
        },
        flatten: function(results) {
          if (!results || results.length === 0) {
            return [];
          }
          return _.map(results, function(row) {
            var item;
            item = {};
            if (row._source) {
              item = row._source;
            }
            if (row.fields) {
              item = row.fields;
            }
            if (row._score && !item._score) {
              item._score = row._score;
            }
            if (row._id && !item.id) {
              item.id = api.ensureInt(row._id);
            }
            return item;
          });
        }
      },
      ExploreDB: {
        serviceUrl: '/explore/db',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params == null) {
            params = {};
          }
          if (params.index == null) {
            params.index = $config.getTenantIndex();
          }
          if (autoApplySession) {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          req = {
            url: node.ExploreDB.serviceUrl + method,
            data: params
          };
          req = api.addDebugInfo(req);
          return api.execute(req, onSuccess, onError);
        },
        findByDate: function(from, to, onSuccess, onError) {
          return node.ExploreDB.execute('/find-by-date', {
            from: from,
            to: to
          }, onSuccess, onError);
        },
        findByEmail: function(email, onSuccess, onError) {
          return node.ExploreDB.execute('/find-by-email', {
            email: email
          }, onSuccess, onError);
        },
        save: function(data, onSuccess, onError) {
          return node.ExploreDB.execute('/save', data, onSuccess, onError);
        }
      }
      */
    };
    return node;
  });

}).call(this);

;

;
(function() {
  var myApp;

  myApp = angular.module('af.bsIcons', []);

  myApp.directive('bsIcon', function() {
    return {
      scope: {
        icon: '@bsIcon',
        color: '@bsIconColor'
      },
      link: function(scope, element, attrs) {
        element.addClass('ng-show-inline glyphicon glyphicon-' + scope.icon);
        if (scope.color) {
          return element.css('color', scope.color);
        }
      }
    };
  });

  myApp.directive("faIcon", function() {
    return {
      scope: {
        icon: '@faIcon',
        color: '@faIconColor'
      },
      link: function(scope, element, attrs) {
        element.addClass('ng-show-inline fa fa-' + scope.icon);
        if (scope.color) {
          return element.css('color', scope.color);
        }
      }
    };
  });

}).call(this);

;

;
(function() {

  var myApp = angular.module('af.authManager', ['af.util']);

  myApp.service('authManager', function($util) {

    var auth;

    return auth = {

      sessionTokenPriority:['app', 'url', 'amplify', 'window'],

      //
      // SESSION/USER CACHE
      //
      loggedInUser: amplify.store("loggedInUser"), // username, firstName, lastName, email, nameOfPractice and email
      sessionToken: amplify.store('sessionToken'),

      loggedIn: function() {
        return auth.sessionToken && auth.loggedInUser && auth.loggedInUser.userId;
      },
      clearUser: function() {
        amplify.store('loggedInUser', null);
        amplify.store('sessionToken', null);
        auth.loggedInUser = null;
        auth.sessionToken = null;
      },
      setSessionToken: function(sessionToken) {
        auth.sessionToken = sessionToken;
        amplify.store('sessionToken', sessionToken);
      },
      setLoggedInUser: function(sessionToken, userId, userName, userEmail, authorities) {
        auth.setSessionToken(sessionToken);
        auth.loggedInUser = {
          userId: userId,
          userName: userName,
          userEmail: userEmail,
          authorities: authorities
        };
        amplify.store('loggedInUser', auth.loggedInUser);
      },
      // finds sessionToken based on priority
      findSessionToken: function(priority) {
        // default priority, looks in this class first, then URL, then checks amplify and finally window.sessionToken
        if (!priority) priority = auth.sessionTokenPriority;
        var token = null;
        _.each(priority, function(place) {
          if (token) return;
          switch (place) {
            case 'app':     token = auth.sessionToken; break;
            case 'amplify': token = amplify.store('sessionToken'); break;
            case 'url':     token = $util.GET('sessionToken'); break;
            case 'window':  token = window.sessionToken;
          }
        });
        return token;
      },

      
      //
      // ROLE CHECKS
      //
      hasRole: function(role) {
        if (!auth.loggedIn()) return false;
        return _.contains(auth.loggedInUser.authorities, role);
      },
      hasAnyRole: function(array) {
        var matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) matched += 1;
        });
        return matched > 0;
      },
      hasAllRoles: function(array) {
        var matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) matched += 1;
        });
        return array.length === matched;
      },

      isAdmin: function() { return auth.hasAnyRole(['Role_Admin', 'Role_RoadmapUserAdmin', 'Role_RoadmapContentAdmin']); },
      isCoach: function() { return auth.hasAnyRole(['Role_AccessKeyManager']); }

    };
  });

}).call(this);

;

;
(function() {
  var myApp = angular.module('af.config', []);

  //
  // plural filter for config
  //
  myApp.filter('plural', function() {
    return function(value) {
      if(!value) return value;
      if(!_.isString(value)) return value;
      var lastChar = value.charAt(value.length - 1).toLowerCase();
      var lastTwoChar = value.slice(value.length - 2).toLowerCase();
      // special cases...
      if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
      if (lastTwoChar === 'ch') return value + 'es';
      return value + 's';
    };
  })
  // label filter
  myApp.filter('configLabel', function($config) {
    return function(path, makePlural) {
      var val = $config.get(path, makePlural)
      return val;
    };
  })



  //
  // config exposed from server
  //
  myApp.service('$config', function($window, $filter) {

    var getPathValue = function(object, path) {
      var parts = path.split('.');
      if (parts.length === 1) return object[parts[0]];
      var child = object[parts.shift()];
      if (!child) return child;
      return getPathValue(child, parts.join('.'));
    };

    // the service
    var config = {
      // gets a value from our config
      // accepts a string value, eg:('label.app.name')
      get: function(path, makePlural) {
        var pluralValue, value;
        if (!$window.config) return null;
        if (!path) return $window.config; // return whole config if no path
        value = getPathValue($window.config, path);
        if (makePlural) {
          pluralValue = getPathValue($window.config, path + '_plural');
          if(pluralValue) return pluralValue;
          return $filter('plural')(value);
        }
        return value;
      },

      tenant: function() {    return appEnv.tenant(); },
      env: function() {       return appEnv.env(); },
      index: function() {     return appEnv.index(); },
      subDomain: function() { return appEnv.subDomain(); }
    };
    return config;
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.event', []);

  myApp.service('$event', function($rootScope, $log) {
    var logEvent, service;
    logEvent = function(eventName, data) {
      var suppress;
      suppress = [service.EVENT_loaderStart, service.EVENT_loaderStop, service.EVENT_msgClear];
      if (_.indexOf(suppress, eventName) === -1) {
        return $log.info('EVENT FIRED: ' + eventName, data);
      }
    };
    return service = {
      EVENT_logout: 'Auth.logout',
      EVENT_login: 'Auth.login',
      EVENT_loaderStart: 'Loader.start',
      EVENT_loaderStop: 'Loader.stop',
      EVENT_msgClear: 'Msg.clear',
      EVENT_msgShow: 'Msg.show',
      shout: function(eventName, data) {
        logEvent(eventName, data);
        return $rootScope.$broadcast(eventName, data);
      },
      broadcast: function($scope, eventName, data) {
        logEvent(eventName, data);
        return $scope.$broadcast(eventName, data);
      },
      emit: function($scope, eventName, data) {
        logEvent(eventName, data);
        return $scope.$emit(eventName, data);
      }
    };
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.loader', ['af.event']);

  myApp.service('$loader', function($event) {
    var srv;
    srv = {
      start: function(txt) {
        return $event.shout($event.EVENT_loaderStart, txt);
      },
      stop: function() {
        return $event.shout($event.EVENT_loaderStop);
      },
      save: function() {
        return $event.shout($event.EVENT_loaderStart, 'Saving...');
      },
      load: function() {
        return $event.shout($event.EVENT_loaderStart, 'Loading...');
      }
    };
    return srv;
  });

  myApp.directive('loaderHolder', function($event) {
    return {
      restrict: 'A',
      scope: {},
      template: '<div class="ng-cloak">' + '<div id="app-loader-bar" ng-cloak ng-show="loaderBar" class="ng-cloak progress progress-striped active">' + '<div class="progress-bar" style="width:100%"></div>' + '</div>' + '<div id="app-loader-mask" ng-show="loadMask">' + '<div class="loader-mask"></div>' + '<div class="loader-text">' + '<i class="icon-spinner icon-spin icon-3x"></i> &nbsp;<p ng-show="loaderText" ng-bind="loaderText"></p>' + '</div>' + '</div>' + '</div>',
      link: function(scope, element, attrs) {
        scope.loaderBar = null;
        scope.loadMask = null;
        scope.loaderText = null;
        scope.start = function(txt) {
          scope.loaderText = _.isString(txt) ? txt : null;
          scope.loadMask = _.isBoolean(txt) || scope.loaderText ? true : false;
          return scope.loaderBar = true;
        };
        scope.stop = function() {
          return scope.loaderBar = scope.loaderText = scope.loadMask = null;
        };
        scope.$on($event.EVENT_loaderStart, function(event, txt) {
          return scope.start(txt);
        });
        return scope.$on($event.EVENT_loaderStop, scope.stop);
      }
    };
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.modal', ['af.event']);

  myApp.constant('DEFAULT_MODAL_PATH', 'src/views/templates/generic.modal.view.php');

  myApp.service("$modal", function($event, DEFAULT_MODAL_PATH) {
    var service;
    service = {
      url: null,
      modalScope: null,
      parentScope: null,
      open: function(url, parentScope, modalScope) {
        service.url = url;
        service.modalScope = modalScope;
        service.parentScope = parentScope;
        if (!service.url) {
          service.url = DEFAULT_MODAL_PATH;
        }
        return $event.shout("Modal.open", {
          url: service.url,
          parentScope: service.parentScope,
          modalScope: modalScope
        });
      },
      close: function(data) {
        service.url = null;
        return $event.shout("Modal.close", data);
      },
      getModalScope: function() {
        return service.modalScope;
      },
      getParentScope: function() {
        return service.parentScope;
      },
      updateModalScope: function(scope) {
        return service.modalScope = scope;
      }
    };
    return service;
  });

  myApp.directive("modalHolder", function($modal, $timeout) {
    return {
      restrict: "A",
      scope: {},
      template: "<div id=\"modalHolder\" class=\"ng-cloak\" ng-show=\"modalURL\">" + "<div class=\"modal fade\" ng-click=\"close()\" style=\"display:block\">" + "<div class=\"modal-dialog\" ng-click=\"stopClickThrough($event)\" ng-include=\"modalURL\"></div>" + "</div>" + "<div class=\"modal-backdrop fade\" ng-click=\"close()\"></div>" + "</div>",
      link: function(scope, element, attrs) {
        scope.modalURL = $modal.url;
        scope.close = function() {
          $('body').removeClass('modal-open');
          $("#modalHolder").children().removeClass("in");
          return scope.modalURL = null;
        };
        scope.$on("Modal.open", function() {
          scope.modalURL = $modal.url;
          $('body').addClass('modal-open');
          return $timeout(function() {
            return $("#modalHolder").children().addClass("in");
          }, 50);
        });
        scope.$on("Modal.close", scope.close);
        return scope.stopClickThrough = function(event) {
          return event.stopImmediatePropagation();
        };
      }
    };
  });

  myApp.GenericModalCtrl = myApp.controller('GenericModalCtrl', function($scope, $modal) {

    /*
    Example usage
    $modal.open('client/views/analyzers/client.profitability.settings.php', {
      clickClose:() ->
        modalScope = $modal.getScope()
         * do something
        $modal.close()
    })
     */
    var defaultController, init;
    defaultController = {
      title: 'Are you sure?',
      body: 'Are you sure you wish to continue?',
      closeBtnLabel: 'Close',
      confirmBtnLabel: null,
      showbuttons: true,
      clickClose: function() {
        return $modal.close();
      },
      clickConfirm: function() {
        return $modal.close();
      },
      run: function() {
        var foo;
        return foo = 'override this';
      }
    };
    init = function() {
      _.extend($scope, defaultController, $modal.getModalScope());
      return $modal.updateModalScope($scope);
    };
    init();
    return $scope.run();
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.msg', ['af.event']);

  myApp.service('$msg', function($event) {
    var msg;
    return msg = {
      shownAt: null,
      minVisible: 3,
      show: function(message, type, closable, delay) {
        if (type == null) {
          type = 'warning';
        }
        if (!_.isBoolean(closable)) {
          closable = true;
        }
        if (!_.isNumber(delay) || delay < msg.minVisible) {
          delay = 0;
        }
        if (!closable && delay === 0) {
          delay = 3;
        }
        msg.shownAt = new Date().getTime();
        return $event.shout($event.EVENT_msgShow, {
          message: message,
          type: type,
          delay: delay,
          closable: closable
        });
      },
      clear: function(force) {
        var now;
        now = new Date().getTime();
        if (force || (msg.shownAt && (now - msg.shownAt) > msg.minVisible)) {
          return $event.shout($event.EVENT_msgClear);
        }
      },
      alert: function(message, closable, delay) {
        return msg.show(message, 'warning', closable, delay);
      },
      error: function(message, closable, delay) {
        return msg.show(message, 'danger', closable, delay);
      },
      info: function(message, closable, delay) {
        return msg.show(message, 'info', closable, delay);
      },
      success: function(message, closable, delay) {
        return msg.show(message, 'success', closable, delay);
      }
    };
  });

  myApp.directive('msgHolder', function($timeout, $window, $event) {
    var timer;
    timer = null;
    return {
      restrict: 'A',
      template: '<div class="app-alert" class="ng-cloak" style="position:fixed; top:0; left:0; right:0;">' + '<div class="animate-alert-animation container" ng-show="visible">' + '<div class="alert" ng-class="cssClass">' + '<button type="button" class="close" ng-show="closable" ng-click="clear()">×</button>' + '<span ng-bind-html="message"></span>' + '</div>' + '</div>' + '</div>',
      link: function(scope, element, attrs) {
        scope.message = null;
        scope.type = null;
        scope.closable = null;
        scope.visible = false;
        scope.show = function(message, type, closable, delay) {
          scope.message = message;
          scope.closable = closable;
          scope.cssClass = type ? 'alert-' + type : 'alert-warning';
          if (scope.closable) {
            scope.cssClass += ' alert-dismissable';
          }
          scope.visible = true;
          if (timer) {
            $timeout.cancel(timer);
          }
          if (_.isNumber(delay) && delay > 0) {
            return timer = $timeout(function() {
              return scope.clear();
            }, delay * 1000);
          }
        };
        scope.clear = function() {
          scope.visible = false;
          if (timer) {
            return $timeout.cancel(timer);
          }
        };
        scope.$on($event.EVENT_msgShow, function(event, data) {
          return scope.show(data.message, data.type, data.closable, data.delay);
        });
        return scope.$on($event.EVENT_msgClear, scope.clear);
      }
    };
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.storage', []);

  myApp.constant('STORAGE_PREFIX', 'myApp');

  myApp.service('$storage', function(STORAGE_PREFIX) {
    var service;
    service = {
      _prefix: STORAGE_PREFIX + '_',
      _prefixPersistent: 'p_' + STORAGE_PREFIX,
      store: function(key, value, expires) {
        return amplify.store(this._prefix + key, value, {
          expires: expires
        });
      },
      persist: function(key, value, expires) {
        return amplify.store(this._prefixPersistent + key, value, {
          expires: expires
        });
      },
      all: function() {
        var appData;
        appData = {};
        _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key) || service.isPersistantAppData(key)) {
            return appData[key] = value;
          }
        });
        return appData;
      },
      clear: function(key) {
        return _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key)) {
            return amplify.store(key, null);
          }
        });
      },
      nuke: function() {
        return _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key) || service.isPersistantAppData(key)) {
            return amplify.store(key, null);
          }
        });
      },
      isAppData: function(key) {
        return key.indexOf(this._prefix) === 0;
      },
      isPersistantAppData: function(key) {
        return key.indexOf(this._prefixPersistent) === 0;
      }
    };
    return service;
  });

}).call(this);

;

;
(function() {
  var myApp;

  myApp = angular.module('af.apply', []);

  myApp.factory('apply', function($rootScope) {
    return function() {
      if (!$rootScope.$$phase) {
        return $rootScope.$apply();
      }
    };
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.sentry', ['af.authManager', 'af.config']);

  myApp.constant('SENTRY_ENABLED', true);

  myApp.service('$sentry', function($log, $window, authManager, $config, SENTRY_ENABLED) {
    var sentryIsLoaded, service;
    sentryIsLoaded = function() {
      if (!SENTRY_ENABLED) {
        return false;
      }
      if (typeof Raven === "undefined") {
        return false;
      }
      if (authManager && authManager.loggedInUser) {
        Raven.setUser({
          id: authManager.loggedInUser.userId,
          email: authManager.loggedInUser.userEmail
        });
      } else {
        Raven.setUser();
      }
      return true;
    };
    service = {
      error: function(name, extra, tags) {
        return service.message(name, extra, tags);
      },
      message: function(name, extra, tags) {
        var options;
        if (!sentryIsLoaded()) {
          return $log.info('Sentry Not loaded. Unable to send message: ' + name);
        }
        options = {
          extra: extra || {},
          tags: tags || {}
        };
        options.extra.url = $window.location.url;
        options.tags.env = $config.getEnv();
        options.tags.app = $config.getApp();
        options.tags.tenant = $config.getTenant();
        return Raven.captureMessage(name, options);
      },
      exception: function(error) {
        if (!sentryIsLoaded()) {
          return $log.info('Sentry Not loaded. Unable to send exception');
        }
        return Raven.captureException(error);
      }
    };
    return service;
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.track', ['af.authManager']);

  myApp.constant('TRACK_ENABLED', true);

  myApp.service('$track', function($log, authManager, TRACK_ENABLED) {
    var init, service;
    init = function() {
      if (!TRACK_ENABLED) {
        return false;
      }
      if (typeof mixpanel === 'undefined') {
        return false;
      }
      if (authManager.loggedInUser) {
        mixpanel.identify(authManager.loggedInUser.userId);
      }
      return true;
    };
    service = {
      event: function(name, options) {
        if (!init()) {
          return $log.info('Mixpanel Not loaded. Unable to track event: ' + name);
        }
        return mixpanel.track(name, options);
      },
      register: function(options) {
        if (!init()) {
          return $log.info('Mixpanel Not loaded. Unable to Register', options);
        }
        return mixpanel.register(options);
      },
      unregister: function(string) {
        if (!init()) {
          return $log.info('Mixpanel Not loaded. Unable to Unregister: ' + string);
        }
        return mixpanel.unregister(string);
      }
    };
    return service;
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.util', ['af.config']);

  Number.prototype.formatNumber = function(precision, decimal, seperator) {
    var i, j, n, s;
    n = this;
    precision = (isNaN(precision = Math.abs(precision)) ? 0 : precision);
    decimal = (decimal === undefined ? "." : decimal);
    seperator = (seperator === undefined ? "," : seperator);
    s = (n < 0 ? "-" : "");
    i = parseInt(n = Math.abs(+n || 0).toFixed(precision)) + "";
    j = ((j = i.length) > 3 ? j % 3 : 0);
    return s + (j ? i.substr(0, j) + seperator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + seperator) + (precision ? decimal + Math.abs(n - i).toFixed(precision).slice(2) : "");
  };

  myApp.service('$util', function($window, $location, $config) {
    var util;
    return util = {
      GET: function(key) {
        var params, search, vars;
        vars = $location.search();
        search = $window.location.search;
        if (search) {
          params = search.split('&');
          _.each(params, function(param, i) {
            var parts;
            parts = param.replace('#', '').replace('/', '').replace('?', '').split('=');
            return vars[parts[0]] = decodeURIComponent(parts[1]);
          });
        }
        if (key) {
          if (vars[key]) {
            return vars[key];
          }
          if (vars[key.toLowerCase()]) {
            return vars[key.toLowerCase()];
          }
          return null;
        }
        return vars;
      },
      postToUrl: function(url, params, newWindow, method) {
        var date, form, winName;
        if (!_.isBoolean(newWindow)) {
          newWindow = true;
        }
        method = method || 'post';
        form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", url);
        _.each(params, function(value, key) {
          var hiddenField, type;
          type = typeof value;
          if (type === 'function' || type === 'object') {
            return;
          }
          hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", value);
          return form.appendChild(hiddenField);
        });
        if (newWindow) {
          date = new Date();
          winName = 'af_postWindow' + date.getTime();
          window.open('', winName);
          form.target = winName;
          document.body.appendChild(form);
          form.submit();
          return document.body.removeChild(form);
        } else {
          document.body.appendChild(form);
          return form.submit();
        }
      },
      format: {
        date: function(value, format, inputType) {
          if (!value) {
            return '';
          }
          if (!inputType) {
            inputType = "utc";
          }
          if (moment) {
            if (!format) {
              format = $config.get('app.dateFormat') || 'MM/DD/YY';
            }
            if (typeof value === 'string') {
              switch (inputType.toLowerCase()) {
                case 'utc':
                  inputType = "YYYY-MM-DDTHH:mm:ss ZZ";
                  break;
                case 'asp':
                  inputType = null;
              }
              return moment(value, inputType).format(format);
            } else {
              return moment(value).format(format);
            }
          }
          return value;
        },
        number: function(value, precision) {
          return parseFloat(value).formatNumber(precision);
        },
        currency: function(value, precision) {
          return '$' + util.format.number(value, precision);
        },
        percent: function(value, precision) {
          return util.format.number(value * 100, precision) + '%';
        }
      }
    };
  });

}).call(this);
