
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