(function() {
  var myApp;

  myApp = angular.module('af.node', ['af.apiUtil']);

  myApp.service('node', function($http, apiUtil) {

    var node = {

      // so you dont have to inject $http in your controllers if you injected this service already..
      call: function(request) {
        return $http(request);
      },

      RoadmapNode: {
        serviceUrl: '/roadmap-node',
        // BASE
        createRequest:function(url, params, options){
          var request = apiUtil.request.create(options);
          request.url = node.RoadmapNode.serviceUrl + url;
          request.data = params || {};
          return request;
        },
        call:function(url, params, options){
          return node.call(this.createRequest(url, params, options));
        },

        // METHODS
        save: function(type, resource, options) {
          return this.call('/api/crud/save', {_type: type, resource: resource}, options);
        },
        find: function(type, query, options) {
          return this.call('/api/crud/find', {_type: type, query: query}, options);
        },
        findOne: function(type, query, options) {
          if(query) query.limit = 1; // we only want 1
          return this.find(type, query, options)
            .then(function(response){
              // we don't want an array... we want an object..
              response.data = (Object.isArray(response.data) && response.data.length >= 1) ? response.data[0]:null;
              return response;
            })
        },
        remove: function(type, idOrResource, options) {
          var id = Object.isObject(idOrResource) ? idOrResource.id : idOrResource;
          return this.call('/api/crud/remove', {_type: type, id:apiUtil.ensureInt(id)}, options);
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
