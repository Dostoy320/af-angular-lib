
;
(function() {

  // this file was pulled out of api service because of circular dependency issues with httpInterceptor

  var myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.authManager']);

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



  myApp.service('api', function($window, $log, $msg, API_REQUEST_DEFAULTS, authManager, $loader, $log, $q) {



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
          index:  appEnv.index(),
          tenant: appEnv.tenant(),
          env:    appEnv.env()
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
          appCatch.error(message, { request:request.data, headers:request.headers, debug:data.debug });
        else
          appCatch.error(message, request.data);
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

;
(function() {

  var myApp = angular.module('af.httpInterceptor', ['af.api', 'af.authManager']);

  myApp.factory("httpInterceptor", function($q, $injector, api, authManager) {

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
          if(!request.data.tenant) request.data.tenant = appEnv.index();
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

;
(function() {

  var myApp = angular.module('af.java', ['af.api']);

  myApp.service('java', function($http, api, $q) {

    var java = {

      // so you don't have to inject $http in your controllers if you injected this service already..
      call: function(request) { return $http(request); },

      //
      // ROADMAP SERVICE
      //
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        // BASE
        call:function(url, params, options){
          return java.call(this.createRequest(url, params, options));
        },
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = {
            method: 'POST',
            url: java.RoadmapService.serviceUrl + url,
            data: params || {}
          }
          // merge with default request options
          return api.createRequest(request, options)
        },

        // METHODS
        invoke: function(params) {
          return this.call('/invoke', params);
        }
      },




      //
      // AUTH SERVICE
      //
      AuthService: {
        serviceUrl: '/RoadmapService',
        // BASE
        call:function(url, params, options){
          return java.call(this.createRequest(url, params, options));
        },
        // creates standard request object for this service
        createRequest:function(url, params, options){
          var request = {
            method: 'POST',
            url: java.AuthService.serviceUrl + url,
            data: params,
            // options
            urlEncode:true
          }
          // merge with default request options
          return api.createRequest(request, options)
        },


        // METHODS
        login: function(username, password) {
          var options = {
            autoApplySession:false,
            displayErrors:false
          }
          return this.call('/login', { username: username, password: password }, options)
        },
        logout: function(options) {
          return this.call('/logout', null, options);
        },
        loadsession: function(sessionToken, options) {
          return this.call('/loadsession', {sessionToken: sessionToken}, options);
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
        */
      }
    };
    return java;
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.node', ['af.api', 'af.authManager']);

  myApp.service('node', function($http, api, $q) {

    var node = {

      // so you dont have to inject $http in your controllers if you injected this service already..
      call: function(request) { return $http(request); },

      RoadmapNode: {
        serviceUrl: '/roadmap-node',
        // BASE
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
          return this.call('/api/crud/save', {_type: type, resource: resource}, options);
        },
        find: function(type, query, options) {
          return this.call('/api/crud/find', {_type: type, query: query}, options);
        },
        findOne: function(type, query, options) {
          query.limit = 1; // we only want 1
          return node.RoadmapNode.find(type, query, options)
            .then(function(response){
              if (_.isArray(response.data) && response.data.length >= 1)
                response.data = response.data[0]
              else
                response.data = null
              return response
            })
        },
        remove: function(type, resource) {
          var id = _.isObject(resource) ? resource.id : resource;
          return this.call('/api/crud/remove', {_type: type, id:api.ensureInt(id)});
        }
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
            params.index = appConfig.index();
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
            params.index = appConfig.getTenantIndex();
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
angular.module('ui.bootstrap.dropdown', [])

.constant('dropdownConfig', {
  openClass: 'open'
})

.service('dropdownService', ['$document', function($document) {
  var openScope = null;

  this.open = function( dropdownScope ) {
    if ( !openScope ) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if ( openScope && openScope !== dropdownScope ) {
        openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function( dropdownScope ) {
    if ( openScope === dropdownScope ) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeDropdown = function( evt ) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    var toggleElement = openScope.getToggleElement();
    if ( evt && toggleElement && toggleElement[0].contains(evt.target) ) {
        return;
    }

    openScope.$apply(function() {
      openScope.isOpen = false;
    });
  };

  var escapeKeyBind = function( evt ) {
    if ( evt.which === 27 ) {
      openScope.focusToggleElement();
      closeDropdown();
    }
  };
}])

.controller('DropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'dropdownService', '$animate', function($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
  var self = this,
      scope = $scope.$new(), // create a child scope so we are not polluting original one
      openClass = dropdownConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

  this.init = function( element ) {
    self.$element = element;

    if ( $attrs.isOpen ) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }
  };

  this.toggle = function( open ) {
    return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.getToggleElement = function() {
    return self.toggleElement;
  };

  scope.focusToggleElement = function() {
    if ( self.toggleElement ) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function( isOpen, wasOpen ) {
    $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

    if ( isOpen ) {
      scope.focusToggleElement();
      dropdownService.open( scope );
    } else {
      dropdownService.close( scope );
    }

    setIsOpen($scope, isOpen);
    if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
      toggleInvoker($scope, { open: !!isOpen });
    }
  });

  $scope.$on('$locationChangeSuccess', function() {
    scope.isOpen = false;
  });

  $scope.$on('$destroy', function() {
    scope.$destroy();
  });
}])

.directive('dropdown', function() {
  return {
    controller: 'DropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init( element );
    }
  };
})

.directive('dropdownToggle', function() {
  return {
    require: '?^dropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if ( !dropdownCtrl ) {
        return;
      }

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if ( !element.hasClass('disabled') && !attrs.disabled ) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});

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


  //
  // ANGULAR wrapper for appConfig
  //
  var myApp = angular.module('af.filters', []);

  // plural filter for config
  myApp.filter('plural', function($config) {
    return function(value){
      return appConfig.makePlural(value)
    }
  })
  // label filter
  myApp.filter('label', function($config) {
    return function(path, makePlural){
      return appConfig.get(path, makePlural)
    }
  })

}).call(this);

;

;
(function() {

  var myApp = angular.module('af.authManager', ['af.util']);

  myApp.constant('AUTH_MANAGER_CONFIG', {
    tokenPriority:['url', 'cache', 'window']
  });

  myApp.service('authManager', function($util, AUTH_MANAGER_CONFIG) {

    //
    // SESSION/USER CACHE
    //
    var loggedInUser = amplify.store('loggedInUser') // for easy reference

    var auth = {

      // finds sessionToken based on priority
      sessionToken: function() {
        // default priority, looks in this class first, then URL, then checks amplify and finally window.sessionToken
        var token = null;
        _.each(AUTH_MANAGER_CONFIG.tokenPriority, function(place) {
          if (token) return;
          switch (place) {
            case 'url':     token = $util.GET('sessionToken'); break;
            case 'cache':   token = amplify.store('sessionToken'); break;
            case 'window':  token = window.sessionToken; break;
          }
        });
        return token;
      },

      // return object if null to prevent auth.user().firstName from blowing up.
      user:function(){ return auth.loggedIn() ? loggedInUser : {} },

      userId:function(){
        if(auth.loggedIn()) return null;
        auth.user()['userId']
      },
      userEmail:function(){
        if(auth.loggedIn()) return null;
        auth.user()['email']
      },


      // is logged in?
      loggedIn: function() { return auth.sessionToken() && loggedInUser && loggedInUser.userId;  },



      //
      // SET
      //
      setSessionToken: function(sessionToken) {
        amplify.store('sessionToken', sessionToken, 86400000); // 1 day
      },
      setLoggedInUser: function(user) {
        user.displayName = $util.createDisplayName(user);      // adds a displayName to the user
        loggedInUser = user;
        amplify.store('loggedInUser', loggedInUser, 86400000); // 1 day
      },


      //
      // DESTROY
      //
      logout:function(){ auth.clear(); },
      clear: function() {
        amplify.store('loggedInUser', null);
        amplify.store('sessionToken', null);
        loggedInUser = null;
      },



      //
      // ROLES
      //
      // ENUMS
      Role_Admin:'Role_Admin',                              // has access to everything
      Role_RoadmapUserAdmin:'Role_RoadmapUserAdmin',        // can edit/create users
      Role_RoadmapContentAdmin:'Role_RoadmapContentAdmin',  // can edit content
      Role_AccessKeyManager:'Role_AccessKeyManager',        // can view/edit other users data

      hasRole: function(role) {
        if (!auth.loggedIn()) return false;
        return _.contains(auth.user().authorities, role);
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

      isAdmin: function() { return auth.hasAnyRole([auth.Role_Admin, auth.Role_RoadmapUserAdmin, auth.Role_RoadmapContentAdmin]); },
      isCoach: function() {
        return auth.hasAnyRole([auth.Role_AccessKeyManager]);
      }


    };

    return auth;
  });

}).call(this);

;

;
(function() {
  var myApp;

  myApp = angular.module('af.event', []);

  myApp.service('$event', function($rootScope, $log) {
    var logEvent, service;

    logEvent = function(type, eventName, data) {
      var suppress = [service.EVENT_loaderStart, service.EVENT_loaderStop, service.EVENT_msgClear];
      if (_.indexOf(suppress, eventName) === -1) {
        if(data) return $log.debug('$event:' + eventName, data);
        $log.debug('$event.' + type + ': ' + eventName);
      }
    };

    return service = {

      EVENT_loaderStart: 'Loader.start',
      EVENT_loaderStop: 'Loader.stop',
      EVENT_msgClear: 'Msg.clear',
      EVENT_msgShow: 'Msg.show',

      shout: function(eventName, data) {
        logEvent('shout', eventName, data);
        return $rootScope.$broadcast(eventName, data);
      },
      broadcast: function($scope, eventName, data) {
        logEvent('broadcast', eventName, data);
        return $scope.$broadcast(eventName, data);
      },
      emit: function($scope, eventName, data) {
        logEvent('emit', eventName, data);
        return $scope.$emit(eventName, data);
      }
    };
  });

}).call(this);

;
(function() {

  var myApp = angular.module('af.loader', ['af.event']);

  myApp.service('$loader', function($event) {
    var srv, isRunning = false;
    srv = {
      start: function(options) {
        isRunning = true;
        return $event.shout($event.EVENT_loaderStart, options);
      },
      stop: function() {
        isRunning = false;
        return $event.shout($event.EVENT_loaderStop);
      },

      // util / quickies
      isLoading:function(){ return isRunning; },
      saving: function() { srv.start('Saving...');    },
      loading: function() { srv.start('Loading...');  },
      bar: function() { srv.start({bar:true, mask:false});  },
      mask: function() { srv.start({bar:false, mask:true});  }
    };
    return srv;
  });

  myApp.directive('loaderHolder', function($event) {
    return {
      restrict: 'A',
      scope: {},
      template: '<div class="ng-cloak">' +
                  '<div id="app-loader-bar" ng-cloak ng-show="loaderBar" class="ng-cloak progress progress-striped active">' +
                    '<div class="progress-bar" style="width:100%"></div>' +
                  '</div>' +
                  '<div id="app-loader-mask" ng-show="loadMask">' +
                    '<div class="loader-mask"></div>' +
                    '<div class="loader-text">' +
                      '<i class="icon-spinner icon-spin icon-3x"></i> &nbsp;<p ng-show="loaderText" ng-bind="loaderText"></p>' +
                    '</div>' +
                  '</div>' +
                '</div>',
      link: function(scope, element, attrs) {
        scope.loaderBar = null;
        scope.loadMask = null;
        scope.loaderText = null;
        scope.start = function(options) {
          if(_.isString(options)){
            scope.loaderText = options
            scope.loadMask = true
            scope.loaderBar = true
          } else if(_.isObject(options)){
            scope.loaderText = options.hasOwnProperty('text') ? options.text : ''
            scope.loadMask = options.hasOwnProperty('mask') ? options.mask : scope.loaderText // show mask if text
            scope.loaderBar = options.hasOwnProperty('bar') ? options.bar : true
          }
        };
        scope.stop = function() {
          scope.loaderBar = scope.loaderText = scope.loadMask = null;
        };
        scope.$on($event.EVENT_loaderStart, function(event, txt) {
          scope.start(txt);
        });
        scope.$on($event.EVENT_loaderStop, scope.stop);
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
        type = type || 'warning'

        if (!_.isBoolean(closable)) closable = true;
        if (!_.isNumber(delay) || delay < msg.minVisible) delay = 0;
        if (!closable && delay === 0) delay = 3;

        msg.shownAt = new Date().getTime();

        return $event.shout($event.EVENT_msgShow, {
          message: message,
          type: type,
          delay: delay,
          closable: closable
        });
      },

      clear: function(force) {
        var now = new Date().getTime();
        if (force || (msg.shownAt && (now - msg.shownAt) > msg.minVisible))
          return $event.shout($event.EVENT_msgClear);
      },

      alert: function(message, closable, delay) {   return msg.show(message, 'warning', closable, delay); },
      error: function(message, closable, delay) {   return msg.show(message, 'danger',  closable, delay); },
      info: function(message, closable, delay) {    return msg.show(message, 'info',    closable, delay); },
      success: function(message, closable, delay) { return msg.show(message, 'success', closable, delay); }
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

  
  //
  // SIMPLE WRAPPER AROUND AMPLIFY.STORE TO ALLOW NAME SPACING...
  //
  var myApp = angular.module('af.storage', []);

  myApp.constant('STORAGE_PREFIX', 'myApp');

  myApp.service('$storage', function(STORAGE_PREFIX) {

    var prefix = STORAGE_PREFIX + '_';

    var service = {

      store: function(key, value, options) {

        // save/get key
        if(key){
          if(options){
            if(_.isObject(options) && options.hasOwnProperty('expires')) options = expires;
            if(_.isNumber(options)) options = { expires: options }
          }
          return amplify.store(prefix + key, value, options);

        // return all data related to this app
        } else {
          var allData = {}
          _.each(amplify.store(), function(value, key){
            if(key.indexOf(prefix) === 0)
              allData[key] = value;
          })
          return allData;
        }
      },

      clear: function(key) {
        _.each(amplify.store(), function(value, key) {
          if (service.isAppData(key)) {
            return amplify.store(key, null);
          }
        });
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

  var myApp = angular.module('af.util', []);

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

  myApp.service('$util', function($window, $location) {

    var util = {

      GET: function(key) {
        // quick check to see if key is even in url at all...
        if($location.absUrl().indexOf(key) < 0) return null;

        var vars = $location.search();
        var search = $window.location.search;
        if (search) {
          var params = search.split('&');
          _.each(params, function(param, i) {
            var parts;
            parts = param.replace('#', '').replace('/', '').replace('?', '').split('=');
            return vars[parts[0]] = decodeURIComponent(parts[1]);
          });
        }
        if (key) {
          if (vars[key]) return vars[key];
          if (vars[key.toLowerCase()]) return vars[key.toLowerCase()];
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

      // creates a displayName for our user
      createDisplayName:function(user){
        if(!user) return '';

        // return preferred name if it exists...
        var preferredDisplayName = appConfig.get('preferredDisplayName')
        if(preferredDisplayName && user[preferredDisplayName])
          return user[preferredDisplayName];

        // return name
        if(user.firstName && user.lastName)
          return user.firstName + ' ' + user.lastName;
        // return whatever we can about this user
        return user.firstName || user.lastName || user.nameOfPractice || user.username || user.userId || '';
      },

      format: {
        date: function(value, format, inputType) {
          if (!value) return '';
          if (!inputType) inputType = "utc";
          if (moment) {
            if(!format) format = appConfig.get('app.dateFormat') || 'MM/DD/YY';
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

    return util;
  });

}).call(this);
