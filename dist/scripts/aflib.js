
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
(function() {
  var myApp;

  myApp = angular.module('af.datePicker', ['af.config']);

  myApp.directive('datePicker', function($parse, $timeout, $config) {
    return {
      require: 'ngModel',
      restrict: 'A',
      replace: true,
      transclude: false,
      compile: function(element, attrs) {
        var html, modelAccessor, newElm;
        modelAccessor = $parse(attrs.ngModel);
        html = '<input type="text" id="' + attrs.id + '" readonly="true"></input>';
        newElm = $(html);
        element.replaceWith(newElm);
        return function(scope, element, attrs, controller) {
          var config, datePickerConfig, defaultConfig, handleChange, updateUI;
          config = {};
          if (scope[attrs.datePickerConfig]) {
            config = scope[attrs.datePickerConfig];
          }
          if (scope[attrs.datePickerFormat]) {
            config = scope[attrs.datePickerFormat];
          } else if ($config.get('app.dateFormatDatePicker')) {
            config.dateFormat = $config.get('app.dateFormatDatePicker');
          }
          handleChange = function() {
            var date;
            date = new Date(element.datepicker('getDate'));
            return scope.$apply(function(scope) {
              return modelAccessor.assign(scope, date);
            });
          };
          updateUI = function() {
            return $timeout(function() {
              $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next span').text('').addClass('glyphicon glyphicon-chevron-right');
              $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev span').text('').addClass('glyphicon glyphicon-chevron-left');
              return element.blur();
            }, 5);
          };
          defaultConfig = {
            inline: true,
            changeMonth: true,
            changeYear: true,
            selectOtherMonths: true,
            showOtherMonths: true,
            onChangeMonthYear: updateUI,
            prevText: '',
            nextText: '',
            onClose: function() {
              handleChange();
              $('.afDateInputModal').unbind('click');
              return $('.afDateInputModal').remove();
            },
            beforeShow: function() {
              updateUI();
              $('#ui-datepicker-div').after('<div class="afDateInputModal modal-backdrop fade in"></div>');
              return $('.afDateInputModal').click(function() {
                return element.datepicker("show");
              });
            }
          };
          datePickerConfig = _.defaults(config, defaultConfig);
          element.datepicker(datePickerConfig);
          scope.$watch(modelAccessor, function(newValue, oldValue) {
            var newDate;
            if (!newValue) {
              return $.datepicker._clearDate(element);
            }
            if (moment && moment.isMoment(newValue)) {
              newDate = newValue.toDate();
            } else {
              newDate = new Date(newValue);
            }
            return element.datepicker('setDate', newDate);
          });
          return scope.$on('$destroy', function() {
            element.datepicker("destroy");
            return element.removeClass("hasDatepicker").removeAttr('id');
          });
        };
      }
    };
  });

}).call(this);

;

;
(function() {
  var myApp;

  myApp = angular.module('af.authManager', ['af.util']);

  myApp.service('authManager', function($util) {
    var auth;
    return auth = {
      loggedInUser: {
        userName: amplify.store("userName"),
        userId: amplify.store("userId"),
        userEmail: amplify.store("userEmail"),
        authorities: amplify.store("authorities")
      },
      sessionToken: amplify.store('sessionToken'),
      clearUser: function() {
        amplify.store('username', null);
        amplify.store('userId', null);
        amplify.store('userEmail', null);
        amplify.store('authorities', null);
        amplify.store('sessionToken', null);
        auth.loggedInUser.username = null;
        auth.loggedInUser.userId = null;
        auth.loggedInUser.userEmail = null;
        auth.loggedInUser.authorities = null;
        return auth.sessionToken = null;
      },
      setSessionToken: function(token) {
        amplify.store('sessionToken', token);
        return auth.sessionToken = token;
      },
      setLoggedInUser: function(user) {
        var fields;
        fields = _.pick(user, 'userName', 'userId', 'userEmail', 'authorities');
        auth.loggedInUser = fields;
        return _.each(fields, function(field) {
          return amplify.store(field, user[field]);
        });
      },
      findSessionToken: function(priority) {
        var token;
        token = null;
        if (!priority) {
          priority = ['app', 'amplify', 'url', 'window'];
        }
        _.each(priority, function(place) {
          if (token) {
            return;
          }
          switch (place) {
            case 'app':
              token = auth.sessionToken;
              break;
            case 'amplify':
              token = amplify.store('sessionToken');
              break;
            case 'url':
              token = $util.GET('sessionToken');
              break;
            case 'window':
              token = window.sessionToken;
          }
          return token;
        });
        return token;
      },
      hasRole: function(role) {
        if (!auth.loggedIn()) {
          return false;
        }
        return _.contains(auth.loggedInUser.authorities, role);
      },
      hasAnyRole: function(array) {
        var matched;
        matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) {
            return matched += 1;
          }
        });
        return matched > 0;
      },
      hasAllRoles: function(array) {
        var matched;
        matched = 0;
        _.each(array, function(role) {
          if (auth.hasRole(role)) {
            return matched += 1;
          }
        });
        return array.length === matched;
      },
      isAdmin: function() {
        return auth.hasAnyRole(['Role_Admin', 'Role_RoadmapUserAdmin', 'Role_RoadmapContentAdmin']);
      },
      isManager: function() {
        return auth.hasAnyRole(['Role_AccessKeyManager']);
      },
      loggedIn: function() {
        return auth.sessionToken && auth.loggedInUser.userId;
      }
    };
  });

}).call(this);

;

;

;
(function() {
  var myApp;

  myApp = angular.module('af.api', ['af.msg', 'af.loader', 'af.sentry', 'af.util', 'af.config']);

  myApp.service('api', function($http, $window, $log, $msg, $loader, $sentry, $util, $config) {
    var api;
    return api = {
      execute: function(req, onSuccess, onError) {
        if (req.method == null) {
          req.method = 'POST';
        }
        return $http(req).success(function(data, status) {
          if (status !== 200 || (data && data.status && data.status !== 'success')) {
            if (onError) {
              return onError(data, status, req);
            }
            return api.handleApiError(data, status, req);
          }
          if (onSuccess) {
            if (data && data.hasOwnProperty('data') && data.hasOwnProperty('status')) {
              return onSuccess(data.data, status, req);
            }
            return onSuccess(data, status, req);
          }
        }).error(function(data, status) {
          return api.handleApiError(data, status, req);
        });
      },
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

;
(function() {
  var myApp;

  myApp = angular.module('af.java', ['af.api', 'af.authManager']);

  myApp.service('java', function($http, api, authManager) {
    var autoApplySession, autoApplySessionPriority, java;
    autoApplySession = true;
    autoApplySessionPriority = null;
    java = {
      setAutoApplySession: function(value) {
        return autoApplySession = value;
      },
      setAutoApplySessionPriority: function(value) {
        return autoApplySessionPriority = value;
      },
      RoadmapService: {
        serviceUrl: '/RoadmapService',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (autoApplySession) {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          req = {
            url: java.RoadmapService.serviceUrl + method,
            data: params
          };
          return api.execute(req, onSuccess, onError);
        },
        invoke: function(params, onSuccess, onError) {
          return java.RoadmapService.execute('/invoke', params, onSuccess, onError);
        }
      },
      AuthService: {
        serviceUrl: '/RoadmapService',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (autoApplySession && method !== 'login' && method !== 'loadtoken') {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          req = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            url: java.AuthService.serviceUrl + method,
            data: $.param(params)
          };
          return api.execute(req, onSuccess, onError);
        },
        login: function(username, password, onSuccess, onError) {
          var params;
          params = {
            username: username,
            password: password
          };
          return java.AuthService.execute('/login', params, onSuccess, onError);
        },
        logout: function(onSuccess, onError) {
          return java.AuthService.execute('/logout', {}, onSuccess, onError);
        },
        validatesession: function(sessionToken, onSuccess, onError) {
          var params;
          params = {};
          if (sessionToken) {
            params.sessionToken = sessionToken;
          }
          return java.AuthService.execute('/validatesession', params, onSuccess, onError);
        },
        createtoken: function(loginAsUserId, expiresOn, url, onSuccess, onError) {
          var params;
          params = {
            loginAsUserId: loginAsUserId,
            expiresOn: expiresOn,
            url: url
          };
          return java.AuthService.execute('/createtoken', params, onSuccess, onError);
        },
        updatetoken: function(tokenString, url, onSuccess, onError) {
          var params;
          params = {
            tokenString: tokenString,
            url: url
          };
          return java.AuthService.execute('/updatetoken', params, onSuccess, onError);
        },
        loadtoken: function(token, onSuccess, onError) {
          return java.AuthService.execute('/loadtoken', {
            token: token
          }, onSuccess, onError);
        },
        changepassword: function(userId, currentPassword, newPassword, onSuccess, onError) {
          var params;
          params = {
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
          };
          return java.AuthService.execute('/changepassword', params, onSuccess, onError);
        },
        getuserfromuserid: function(userId, onSuccess, onError) {
          return java.AuthService.execute('/getuserfromuserid', {
            userId: userId
          }, onSuccess, onError);
        },
        loadsession: function(sessionToken, onSuccess, onError) {
          return java.AuthService.execute('/loadsession', {
            sessionToken: sessionToken
          }, onSuccess, onError);
        }
      }
    };
    return java;
  });

}).call(this);

;
(function() {
  var myApp;

  myApp = angular.module('af.node', ['af.api', 'af.authManager', 'af.config']);

  myApp.service('node', function($http, api, authManager, $config) {
    var autoApplySession, autoApplySessionPriority, node;
    autoApplySession = true;
    autoApplySessionPriority = null;
    node = {
      setAutoApplySession: function(value) {
        return autoApplySession = value;
      },
      setAutoApplySessionPriority: function(value) {
        return autoApplySessionPriority = value;
      },
      RoadmapNode: {
        serviceUrl: '/roadmap-node',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params == null) {
            params = {};
          }
          if (params.tenant == null) {
            params.tenant = $config.getTenantIndex();
          }
          if (autoApplySession) {
            if (params.sessionToken == null) {
              params.sessionToken = authManager.findSessionToken(autoApplySessionPriority);
            }
          }
          req = {
            url: node.RoadmapNode.serviceUrl + method,
            data: params
          };
          req = api.addDebugInfo(req);
          return api.execute(req, onSuccess, onError);
        },
        save: function(type, resource, onSuccess, onError) {
          return node.RoadmapNode.execute('/api/crud/save', {
            _type: type,
            resource: resource
          }, onSuccess, onError);
        },
        find: function(type, query, onSuccess, onError) {
          return node.RoadmapNode.execute('/api/crud/find', {
            _type: type,
            query: query
          }, onSuccess, onError);
        },
        findOne: function(type, query, onSuccess, onError) {
          return node.RoadmapNode.find(type, query, function(data) {
            if (onSuccess) {
              if (_.isArray(data) && data.length >= 1) {
                return onSuccess(data[0]);
              }
              return onSuccess(null);
            }
          }, onError);
        },
        remove: function(type, id, onSuccess, onError) {
          id = api.ensureInt(id);
          return node.RoadmapNode.execute('/api/crud/remove', {
            _type: type,
            id: id
          }, onSuccess, onError);
        }
      },
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
            params.index = $config.getTenantIndex();
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
    };
    return node;
  });

}).call(this);

;

;
(function() {
  var myApp;

  myApp = angular.module('af.config', []);

  myApp.constant('DEV_DOMAINS', {
    localhost: 'alpha2',
    dev: 'alpha2'
  });

  myApp.service('$config', function($window, $log, DEV_DOMAINS) {
    var app, config, getPathValue, pluralize;
    app = null;
    pluralize = function(value) {
      var lastChar, lastTwoChar;
      if (!value) {
        return value;
      }
      lastChar = value.charAt(value.length - 1).toLowerCase();
      lastTwoChar = value.slice(value.length - 2).toLowerCase();
      if (lastChar === 'y') {
        return value.slice(0, value.length - 1) + 'ies';
      }
      if (lastTwoChar === 'ch') {
        return value + 'es';
      }
      return value + 's';
    };
    getPathValue = function(object, path) {
      var child, parts;
      parts = path.split('.');
      if (parts.length === 1) {
        return object[parts[0]];
      }
      child = object[parts.shift()];
      if (!child) {
        return child;
      }
      return getPathValue(child, parts.join('.'));
    };
    config = {
      get: function(path, makePlural) {
        var pluralValue, value;
        if (!$window.config) {
          return null;
        }
        if (!path) {
          return $window.config;
        }
        if (path.indexOf('.') === -1) {
          path = 'label.' + path;
        }
        value = getPathValue($window.config, path);
        if (makePlural) {
          pluralValue = getPathValue($window.config, path + '_plural');
          if (pluralValue) {
            return pluralValue;
          }
          return pluralize(value);
        }
        return value;
      },
      getTenant: function() {
        return config.get('app.tenant');
      },
      getEnv: function() {
        var env, subDomain;
        env = 'prod';
        subDomain = config.getSubDomain();
        if (subDomain.indexOf('alpha') > -1) {
          return 'dev';
        }
        if (subDomain.indexOf('-dev') > -1) {
          return 'dev';
        }
        _.each(DEV_DOMAINS, function(devNodeIndex, devDomain) {
          if (subDomain === devDomain) {
            return env = 'dev';
          }
        });
        return env;
      },
      getTenantIndex: function() {
        var index, subDomain;
        index = config.getTenant();
        subDomain = config.getSubDomain();
        if (subDomain.indexOf('-dev') > -1) {
          subDomain = subDomain.split("-dev").shift();
        }
        switch (subDomain) {
          case 'alpha':
            index = 'alpha';
            break;
          case 'alpha2':
            index = 'alpha2';
            break;
          case 'waddell':
            index = 'wr';
            break;
          case 'tdai':
            index = 'td';
        }
        _.each(DEV_DOMAINS, function(devNodeIndex, devDomain) {
          if (subDomain === devDomain) {
            return index = devNodeIndex;
          }
        });
        return index;
      },
      getSubDomain: function() {
        return window.location.host.split('.').shift().toLowerCase();
      },
      setApp: function(app) {
        return app = app;
      },
      getApp: function() {
        var parts;
        if (app) {
          return app;
        }
        parts = $window.location.pathname.split('/');
        if (parts.length >= 2) {
          app = parts[1].toLowerCase();
        }
        return app;
      },
      getTheme: function() {
        var themeCss;
        themeCss = $('head link#themeCSS');
        if (themeCss.length !== 1) {
          $log.info('Cannot find the theme CSS file with id="themeCSS" to deterime theme.');
          return 'blue';
        }
        return themeCss.attr('href').split('/').pop().slice(0, -4).split('-')[1];
      },
      theme: {
        textSuccess: '#dff0d8',
        textWarning: '#fcf8e3',
        textDanger: '#f2dede',
        textInfo: '#d9edf7',
        getPrimaryColor: function() {
          var theme;
          theme = config.getTheme();
          switch (theme) {
            case 'blue':
              return '#336699';
            case 'green':
              return '#00b624';
          }
          $log.info('$config.theme.getThemePrimaryColor(): Theme Not Found. Default Primary Color Used.');
          return '#336699';
        },
        getSecondaryColor: function() {
          var theme;
          theme = config.getTheme();
          switch (theme) {
            case 'blue':
              return '#666';
            case 'green':
              return '#666';
          }
          $log.info('$config.getThemeSecondaryColor(): Theme Not Found. Default Secondary Color Used.');
          return '#666';
        }
      }
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
