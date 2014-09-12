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
