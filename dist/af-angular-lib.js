
;
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
          if(response.status === 502) return 'Unable to communicate with server. Please check your internet connection.';
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

;

;
(function() {

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
  })

}).call(this);

;
(function() {


  angular.module('af.bsIcons', [])

  .directive('bsIcon', function() {
    return {
      compile:function(elm, attrs){
        angular.element(elm).addClass('ng-show-inline glyphicon glyphicon-' + attrs.bsIcon);
      }
    };
  })

  .directive("faIcon", function() {
    return {
      compile: function(elm, attrs) {
        angular.element(elm).addClass('ng-show-inline fa fa-' + attrs.faIcon);
      }
    };
  })

}).call(this);

;

;
(function() {


//
// ANGULAR wrapper for appConfig
//
angular.module('af.filters', [])

  // plural filter for config
  .filter('plural', function($config) {
    return function(value){
      return appTenant.makePlural(value)
    }
  })

  // label filter
  .filter('label', function($config) {
    return function(path, makePlural){
      return appTenant.get(path, makePlural)
    }
  })

}).call(this);

;

;
(function() {

angular.module('af.event', [])

  .service('$event', function($rootScope, $log) {
    var logEvent, service;

    logEvent = function(type, eventName, data) {
      var suppress = [service.EVENT_loaderStart, service.EVENT_loaderStop, service.EVENT_msgClear];
      if (!_.contains(suppress, eventName))
        $log.debug('$event.' + type + ': ' + eventName, data);
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
  })

}).call(this);

;
(function() {

angular.module('af.help', ['af.event', 'af.modal'])

  .constant('$HELP_CONFIG', {
    genericHelpPath:'src/views/templates/generic.help.view.html'
  })

  .service("$help", function($event) {
    var service;
    service = {
      isOpen:false,
      controller:{ title:null, body:null },
      open: function(title, body) {
        service.controller.title = title;
        service.controller.body = body;
        $event.shout("Help.open", service.controller);
        service.isOpen = true;
      },
      close: function(data) {
        if(!service.isOpen) return;
        service.isOpen = false;
        $event.shout("Help.close");
      }
    };
    return service;
  })

  .directive("helpHolder", function($modal, $timeout, $HELP_CONFIG) {
    return {
      restrict: "A",
      scope: {},
      template: '<div id="helpHolder" class="ng-cloak" ng-if="url">' +
                  '<div class="modal fade" ng-click="close()" style="display:block; z-index:1042;">' +
                    '<div class="modal-dialog" ng-click="stopClickThrough($event)" ng-include="url"></div>' +
                  '</div>' +
                  '<div class="modal-backdrop fade" style="bottom:0; z-index: 1041;" ng-click="close()"></div>' +
                '</div>',
      link: function(scope, element, attrs) {
        scope.close = function() {
          $('body').removeClass('modal-open');
          $("#helpHolder").children().removeClass("in");
          return scope.url = null;
        };
        scope.$on("Help.open", function(event, controller) {
          scope.url = $HELP_CONFIG.genericHelpPath;
          scope.title = controller.title;
          scope.body = controller.body;
          $('body').addClass('modal-open');
          $timeout(function() {
            $("#helpHolder").children().addClass("in");
          }, 50);
        });
        scope.$on("Help.close", scope.close);
        scope.stopClickThrough = function(event) {
          event.stopImmediatePropagation();
        };
      }
    };
  })

  .controller('GenericHelpCtrl', function($scope, $help) {
    var defaultController = {
      title:null,
      body:null,
      closeBtnLabel:'Close',
      clickClose: function() { return $help.close(); }
    };
    _.extend($scope, defaultController, $help.controller);
  })


}).call(this);

;
(function() {

angular.module('af.loader', ['af.event'])

  .service('$loader', function($event) {
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
  })

  .directive('loaderHolder', function($event) {
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
            scope.loaderText = options;
            scope.loadMask = true;
            scope.loaderBar = true;
          } else if(_.isPlainObject(options)){
            scope.loaderText = options.hasOwnProperty('text') ? options.text : '';
            scope.loadMask = options.hasOwnProperty('mask') ? options.mask : scope.loaderText; // show mask if text
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
  })

}).call(this);

;
(function() {

angular.module('af.modal', ['af.event'])

  .constant('$MODAL_CONFIG', {
    genericModalPath:'src/views/templates/generic.modal.view.html'
  })

  .service("$modal", function($event, $MODAL_CONFIG) {
    var service;
    service = {
      isOpen:false,
      url: null,
      controller: null,
      size:null,
      open: function(url, ctrl, size) {
        service.url = url;
        service.controller = ctrl;
        service.size = size; // lg, md, sm
        if (!service.url) service.url = $MODAL_CONFIG.genericModalPath;
        $event.shout("Modal.open", {
          url: service.url,
          controller: service.controller,
          size: service.size
        });
        service.isOpen = true;
      },
      close: function(data) {
        if(!service.isOpen) return;
        $event.shout("Modal.close", data);
        service.isOpen = false;
        service.url = null;
        service.size = null;
        service.controller = null;
      },
      message:function(title, body){
        var ctrl = { title:null, body:''};
        if(arguments.length == 1) {
          ctrl.body = title;
        } else {
          ctrl.title = title;
          ctrl.body = body;
        }
        service.open($MODAL_CONFIG.genericModalPath, ctrl);
      }
    };
    return service;
  })

  .directive("modalHolder", function($modal, $timeout) {
    return {
      restrict: "A",
      scope: {},
      template: '<div id="modalHolder" class="ng-cloak" ng-show="modalURL">' +
                  '<div class="modal fade" ng-click="close()" style="display:block">' +
                    '<div class="modal-dialog" ng-click="stopClickThrough($event)" ' +
                      'ng-include="modalURL" ng-class="size"></div>' +
                  '</div>' +
                  '<div class="modal-backdrop fade" style="bottom:0; z-index: 1039;" ng-click="close()"></div>' +
                '</div>',
      link: function(scope, element, attrs) {
        scope.modalURL = $modal.url;
        scope.size = null;
        scope.close = function() {
          $('body').removeClass('modal-open');
          $("#modalHolder").children().removeClass("in");
          return scope.modalURL = null;
        };
        scope.$on("Modal.open", function() {
          scope.modalURL = $modal.url;
          scope.size = null;
          if($modal.size){
            switch($modal.size){
              case 'lg': scope.size = {'modal-lg':true}; break;
              case 'md': scope.size = {'modal-md':true}; break;
              case 'sm': scope.size = {'modal-sm':true}; break;
            }
          }
          $('body').addClass('modal-open');
          $timeout(function() {
            $("#modalHolder").children().addClass("in");
          }, 50);
        });
        scope.$on("Modal.close", scope.close);
        scope.stopClickThrough = function(event) {
          event.stopImmediatePropagation();
        };
      }
    };
  })

  .controller('GenericModalCtrl', function($scope, $modal) {

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
      _.extend($scope, defaultController, $modal.controller);
      //return $modal.updateModalScope($scope);
    };
    init();
    return $scope.run();
  });

}).call(this);

;
(function() {

angular.module('af.msg', ['af.event'])

  .service('$msg', function($event) {
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
  })

  .directive('msgHolder', function($timeout, $window, $event) {
    var timer = null;
    return {
      restrict: 'A',
      template: '<div id="app-alert" class="ng-cloak">' +
                  '<div class="app-alert-container container" ng-show="visible">' +
                    '<div class="alert" ng-class="cssClass">' +
                      '<button type="button" class="close" ng-show="closable" ng-click="clear()">×</button>' +
                      '<span ng-bind-html="message"></span>' +
                    '</div>' +
                  '</div>' +
                '</div>',
      link: function(scope, element, attrs) {
        scope.message = null;
        scope.type = null;
        scope.closable = null;
        scope.visible = false;
        scope.show = function(message, type, closable, delay) {
          scope.message = message;
          scope.closable = closable;
          scope.cssClass = type ? 'alert-' + type : 'alert-warning';
          if (scope.closable)
            scope.cssClass += ' alert-dismissable';
          scope.visible = true;

          // clear after delay
          if (timer) $timeout.cancel(timer);
          if (_.isNumber(delay) && delay > 0) {
            timer = $timeout(function() {
              scope.clear();
            }, delay * 1000);
          }
        };
        scope.clear = function() {
          scope.visible = false;
          if (timer) $timeout.cancel(timer);
        };
        scope.$on($event.EVENT_msgShow, function(event, data) {
          console.log('MESSAGE HEARD!');
          scope.show(data.message, data.type, data.closable, data.delay);
        });
        return scope.$on($event.EVENT_msgClear, scope.clear);
      }
    };
  })

}).call(this);

;
(function() {

  
  //
  // SIMPLE WRAPPER AROUND AMPLIFY.STORE TO ALLOW NAME SPACING...
  //
angular.module('af.storage', [])

  .constant('STORAGE_PREFIX', 'myApp')

  .service('$storage', function(STORAGE_PREFIX, $log) {

    var sessionData = {};

    // ensure options are in correct format: { expires:x }
    var checkOptions = function(options){
      if(_.isNumber(options)) return { expires:options };
      if(_.isObject(options) && _.has(options, 'expires')) return options;
      return null;
    };

    var service = {

      // data stored with prefix pertaining to a particular application only
      store:function(key, value, options){
        if(key) return amplify.store(STORAGE_PREFIX + '_' + key, value, checkOptions(options));
        // get all data
        var appData = {};
        var storedData = amplify.store();
        storedData.each(function(value, key){
          if (service.isAppData(key)) appData[key] = value;
        });
        return appData;
      },

      // data that will be gone if page refreshed.
      session:function(key, value){
        if(arguments.length == 0) return sessionData;
        if(arguments.length == 1) return sessionData[key];
        sessionData[key] = value;
      },

      clear: function() {
        sessionData = {};
        _.keys(amplify.store(), function(key, value){
          if(service.isAppData(key)) amplify.store(key, null);
        });
      },

      isAppData:function(key){ return key.indexOf(STORAGE_PREFIX+'_') === 0; }

    };

    return service;
  })

}).call(this);

;

;
(function() {

  angular.module('af.apply', [])

  .factory('apply', function($rootScope) {
    return function() {
      if (!$rootScope.$$phase) {
        return $rootScope.$apply();
      }
    };
  });

}).call(this);

;

_.mixin({

  // merges two arrays based on a common property
  // Example:
  // array1: [{userId:1, firstName:'Bob'}]
  // array2: [{userId:1, lastName:'Smith'}]
  // _.mergeByKey(array1, array2, 'userId') ---> [{userId:1, firstName:'Bob', lastName:'Smith'}]
  mergeByKey: function (arrayOne, arrayTwo, arrayOneKey, arrayTwoKey){
    var merged = [];
    // merge by id if none provided
    if(!arrayOneKey) arrayOneKey = 'id';
    if(!arrayTwoKey) arrayTwoKey = arrayOneKey;
    // merge
    _.each(arrayOne, function(arrayOneItem){
      _.each(arrayTwo, function(arrayTwoItem){
        if (arrayOneItem.hasOwnProperty(arrayOneKey) &&
            arrayTwoItem.hasOwnProperty(arrayTwoKey) &&
            arrayOneItem[arrayOneKey] === arrayTwoItem[arrayTwoKey]){
          merged.push(_.extend({}, arrayOneItem, arrayTwoItem))
        }
      })
    });
    return merged;
  },


  //
  // COMMA SEPARATED ID JUNK
  //
  commaSeparate:function(array){
    if(!array || !_.isArray(array) || array.length == 0) return '';
    return ','+array.join(',')+',';
  },
  commaSeparateDecode:function(string){
    if(!string || !_.isString(string)) return [];
    // remove empty items
    var items = _.reject(string.split(','), function(item){
      return (item === '');
    });
    // convert to numbers
    return _.map(items, function(item){ return parseFloat(item); })
  }

});
;
(function() {

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

  angular.module('af.util', [])
  .service('$util', function($window, $location) {

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
        var preferredDisplayName = appTenant.get('preferredDisplayName')
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
