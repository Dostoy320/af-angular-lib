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
      saving: function() { srv.start('Saving');    },
      loading: function() { srv.start('Loading');  },
      bar: function() { srv.start({bar:true, mask:false});  },
      mask: function() { srv.start({bar:false, mask:true});  }
    };
    return srv;
  })

  .directive('loaderHolder', function($event, $interval) {
    return {
      restrict: 'A',
      scope: {},
      template: '<div class="ng-cloak">' +
                  '<div id="app-loader-bar" ng-cloak ng-show="loaderBar" class="ng-cloak progress progress-striped active">' +
                    '<div class="progress-bar" style="width:100%"></div>' +
                  '</div>' +
                  '<div id="app-loader-mask" ng-show="loadMask">' +
                    '<div class="loader-mask"></div>' +
                    '<div class="loader-text" ng-show="loaderText">' +
                      '<div class="loader-gear"><span fa-icon="gear" class="fa-spin fa-2x" style="line-height:20px; vertical-align: middle;"></span></div>' +
                      '<span class="icon-spinner icon-spin icon-3x"></span> &nbsp;' +
                      '<span ng-bind="loaderText"></span><span>...</span>' +
                    '</div>' +
                  '</div>' +
                '</div>',
      link: function(scope, element, attrs) {
        scope.dots = 3;
        scope.loaderBar = null;
        scope.loadMask = null;
        scope.loaderText = null;

        var timer = null;
        var addDots = function(){
          scope.dots += 1;
          if(scope.dots == 4) scope.dots = 0;
        }
        var clearTick = function(){
          if(timer) $interval.cancel(timer);
        }
        var startTick = function(){
          clearTick();
          if(!scope.loaderText) return;
          scope.loaderText.replace('\.','');
          if(scope.loaderText.substr(scope.loaderText.length - 3) == '...')
            scope.loaderText = scope.loaderText.substring(0, scope.loaderText.length - 3);
          addDots();
          timer = $interval(addDots, 600);
        }

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
          startTick();
        };
        scope.stop = function() {
          scope.loaderBar = scope.loaderText = scope.loadMask = null;
          clearTick();
        };
        scope.$on($event.EVENT_loaderStart, function(event, txt) {
          scope.start(txt);
        });
        scope.$on($event.EVENT_loaderStop, scope.stop);

        // kill any timer on destroy
        element.on('$destroy', clearTick);
      }
    };
  })

}).call(this);
