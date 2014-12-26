(function() {
  var myApp;

  myApp = angular.module('af.node', ['af.apiUtil']);

  myApp.service('node', function($http, apiUtil) {

    var node = {

      // so you don't have to inject $http in your controllers if you injected this service already..
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
    };
    return node;
  });

}).call(this);
