(function() {

angular.module('af.loader', ['af.event'])

  .service('$loader', function($event) {
    var $loader = {}, isLoading = false;
    return $loader = {
      start: function(options) {
        isLoading = true;
        return $event.shout($event.EVENT_loaderStart, options);
      },
      stop: function() {
        isLoading = false;
        return $event.shout($event.EVENT_loaderStop);
      },
      // util / quickies
      isLoading:function(){ return isLoading; },
      saving: function() { $loader.start('Saving');    },
      loading: function() { $loader.start('Loading');  },
      bar: function() { $loader.start({bar:true, mask:false});  },
      mask: function() { $loader.start({bar:false, mask:true});  }
    };
  })

  .directive('loaderHolder', function($event, $interval, $log) {
    return {
      restrict: 'A',
      scope: {},
      template: '<div class="ng-cloak">' +
                  '<div id="app-loader-bar" ng-cloak ng-if="loaderBar" class="ng-cloak progress progress-striped active">' +
                    '<div class="progress-bar" style="width:100%"></div>' +
                  '</div>' +
                  '<div id="app-loader-mask" ng-if="loadMask">' +
                    '<div class="loader-mask"></div>' +
                    '<div class="loader-text" ng-if="loaderText">' +
                      '<div class="loader-gear"><span fa-icon="gear" class="fa-spin fa-2x" style="line-height:20px; vertical-align: middle;"></span></div>' +
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
          if(!options || _.isString(options)){
            // if just text was passed in... enable mask & load bar...
            scope.loaderText = options || 'Loading';
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
