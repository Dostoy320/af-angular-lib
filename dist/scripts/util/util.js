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

    var $util = null;
    return $util = {

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
        if (!_.isBoolean(newWindow))
          newWindow = true;
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
        } else {
          document.body.appendChild(form);
          form.submit();
        }
        return document.body.removeChild(form);
      },

      // creates a displayName for our user
      createDisplayName:function(user){
        if(!user) return '';
        // return preferred name if it exists...
        //var preferredDisplayName = appTenant.get('settings.preferredDisplayName');
        //if(preferredDisplayName && user[preferredDisplayName])
        //  return user[preferredDisplayName];
        // return name
        if(user.firstName && user.lastName)
          return user.firstName + ' ' + user.lastName;
        // return whatever we can about this user
        return user.firstName || user.lastName || user.nameOfPractice || user.username || user.userId || '';
      },

      protocolAndHost:function(){
        return $window.location.protocol+'//'+$window.location.host;
      },

      string: {
        nl2br: function (str) {
          if (!str || typeof str != 'string') return str;
          return str.replace(/\n\r?/g, '<br />');
        }
      },

      format: {
        date: function(value, format, inputType) {
          if (!value) return '';
          if (!inputType) inputType = "utc";
          if (moment) {
            if(!format) format = appTenant.get('settings.date.format') || 'MM/DD/YY';
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
          return '$' + $util.format.number(value, precision);
        },
        percent: function(value, precision) {
          return $util.format.number(value * 100, precision) + '%';
        },
        targetValue:function(value, type, precision){
          switch((''+type).toLowerCase()){
            case 'hours':
            case 'number':    return $util.format.number(value, precision);
            case 'currency':  return $util.format.currency(value, precision);
            case 'percent':   return $util.format.percent(value, precision);
            case 'textarea':  return $util.string.nl2br(value);
            case 'text':      return value;
          }
          return value;
        }
      }
    };
  });

}).call(this);
