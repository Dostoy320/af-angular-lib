
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

  pluckUnique:function(array, key){
    return _.unique(_.pluck(array, key));
  },

  hasValue:function(value){
    return !_.isUndefined(value) && !_.isNull(value) && !_.isNaN(value) && value !== ''
  },

  // allows you to get a nested value from an object using dot notation.
  // eg: _getPathValue( { user:{name:'nate'} , 'user.name') => 'nate'
  getPathValue:function(object, path){
    if(!path) return null;
    var parts = (''+path).split('.');
    var parent = object;
    for(var i = 0; i < parts.length; i++){
      var nextPart = parts[i];
      if(!_.has(parent, nextPart)) return null;
      // keep drilling down
      parent = parent[nextPart];
    }
    return parent;
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