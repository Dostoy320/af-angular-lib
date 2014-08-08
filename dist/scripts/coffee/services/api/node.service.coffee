myApp = angular.module('af.node', ['af.api'])
myApp.service 'node', ($http, api, authManager) ->

  autoApplySession = true
  autoApplySessionPriority = null # passing ['amplify','url','window'] will specify the order the api looks for token

  node = {

    setAutoApplySession:(value) -> autoApplySession = value
    setAutoApplySessionPriority:(value) -> autoApplySessionPriority = value

    RoadmapNode:{
      serviceUrl:'/roadmap-node'
      execute:(method, params, onSuccess, onError) ->
        # all calls require tenant and sessionToken
        params ?= {}
        params.tenant ?= api.getTenantIndex()
        if autoApplySession then params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        # build request
        req =
          url: node.RoadmapNode.serviceUrl + method
          data: params
        req = api.addDebugInfo(req)
        api.execute(req, onSuccess, onError)

      # services
      save:(type, resource, onSuccess, onError) ->
        node.RoadmapNode.execute('/api/crud/save', {_type:type, resource:resource}, onSuccess, onError)

      find:(type, query, onSuccess, onError) ->
        node.RoadmapNode.execute('/api/crud/find', {_type:type, query:query}, onSuccess, onError)

      # return object... not array
      findOne:(type, query, onSuccess, onError) ->
        node.RoadmapNode.find(type, query, (data) ->
          if onSuccess
            if _.isArray(data) and data.length >= 1 then return onSuccess(data[0])
            onSuccess(data)
        , onError)

      deleteById:(type, id, onSuccess, onError) ->
        id = api.ensureInt(id)
        node.RoadmapNode.execute('/api/crud/delete', {_type:type, id:id}, onSuccess, onError)
    }

    Batch:{
      execute:(method, params, onSuccess, onError) ->
        node.RoadmapNode.execute('/api/batch'+method, params, onSuccess, onError)
    }

    QuickContent:{
      serviceUrl:'/quick-content'
      execute:(method, params, onSuccess, onError) ->
        # all calls require index and sessionToken
        params ?= {}
        params.index ?= api.getTenantIndex()
        if autoApplySession then params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        req =
          url: node.QuickContent.serviceUrl + method
          data: params
        req = api.addDebugInfo(req)
        api.execute(req, onSuccess, onError)

      mget:(body, onSuccess, onError) ->
        params = { type:'recommendations', body:body }
        node.QuickContent.execute('/mget', params, (data) ->
          if not onSuccess then return
          # try to move id onto source and return _source
          if data and data.docs
            data.docs = node.QuickContent.flatten(data.docs)
            onSuccess(data.docs)
          else
            onSuccess(data)
        , onError)

      search:(body, onSuccess, onError) ->
        params = { type:'recommendations', body:body }
        node.QuickContent.execute('/search', params, (data) ->
          if not onSuccess then return
          if data and data.hits and data.hits.hits
            data.hits.hits = node.QuickContent.flatten(data.hits.hits)
            onSuccess(data.hits)
          else
            onSuccess(data)
        , onError)

      flatten:(results) ->
        if not results or results.length is 0 then return []
        return _.map results, (row) ->
          item = {}
          if row._source then item = row._source
          if row.fields then item = row.fields
          # transfer _score and id
          if row._score and not item._score then item._score = row._score
          if row._id and not item.id then item.id = api.ensureInt(row._id)
          return item
    }


    ExploreDB:{
      serviceUrl:'/explore/db'
      execute:(method, params, onSuccess, onError) ->
        # all calls require tenant and sessionToken
        params ?= {}
        params.index ?= api.getTenantIndex()
        if autoApplySession then params.sessionToken ?= authManager.findSessionToken(autoApplySessionPriority)
        req =
          url: node.ExploreDB.serviceUrl + method
          data: params
        req = api.addDebugInfo(req)
        api.execute(req, onSuccess, onError)

      # services
      findByDate:(from, to, onSuccess, onError) ->
        node.ExploreDB.execute('/find-by-date', {from:from, to:to}, onSuccess, onError)

      findByEmail:(email, onSuccess, onError) ->
        node.ExploreDB.execute('/find-by-email', { email:email }, onSuccess, onError)

      save:(data, onSuccess, onError) ->
        node.ExploreDB.execute('/save', data, onSuccess, onError)
    }

  }

  return node