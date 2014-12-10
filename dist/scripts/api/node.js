(function() {
  var myApp;

  myApp = angular.module('af.node', ['af.api', 'af.authManager']);

  myApp.service('node', function($http, api, $q) {

    var node = {

      // so you dont have to inject $http in your controllers if you injected this service already..
      call: function(request, callback) {
        $http(request).success(function(data){
          if(callback) callback(null, data)
        }).error(function(error){
          if(callback) callback(error)
        });
      },

      RoadmapNode: {
        serviceUrl: '/roadmap-node',
        // BASE
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
        call:function(url, params, callback, options){
          node.call(this.createRequest(url, params, options), callback);
        },

        // METHODS
        save: function(type, resource, callback, options) {
          this.call('/api/crud/save', {_type: type, resource: resource}, callback, options);
        },
        find: function(type, query, callback, options) {
          this.call('/api/crud/find', {_type: type, query: query}, callback, options);
        },
        findOne: function(type, query, callback, options) {
          if(query) query.limit = 1; // we only want 1
          this.find(type, query, function(err, data){
            if(err && callback) return callback(err);
            if(err) return;
            // just return the data.. not an array
            data = (_.isArray(data) && data.length >= 1) ? data[0]:null;
            if(callback) callback(null, data)
          }, options)
        },
        remove: function(type, idOrRresource, callback, options) {
          var id = _.isObject(idOrRresource) ? idOrRresource.id : idOrRresource;
          this.call('/api/crud/remove', {_type: type, id:api.ensureInt(id)}, callback, options);
        }
      }


      /*
      Batch: {
        execute: function(method, params, callback) {
          return node.RoadmapNode.execute('/api/batch' + method, params, callback);
        }
      },


      QuickContent: {
        serviceUrl: '/quick-content',
        execute: function(method, params, callback) {
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
          return api.execute(req, callback);
        },
        mget: function(body, callback) {
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
        search: function(body, callback) {
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
        execute: function(method, params, callback) {
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
          return api.execute(req, callback);
        },
        findByDate: function(from, to, callback) {
          return node.ExploreDB.execute('/find-by-date', {
            from: from,
            to: to
          }, callback);
        },
        findByEmail: function(email, callback) {
          return node.ExploreDB.execute('/find-by-email', {
            email: email
          }, callback);
        },
        save: function(data, callback) {
          return node.ExploreDB.execute('/save', data, callback);
        }
      }
      */
    };
    return node;
  });

}).call(this);
