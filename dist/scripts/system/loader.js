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
