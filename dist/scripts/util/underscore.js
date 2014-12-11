_.mixin({

  mergeByKey: function (arrayOne, arrayTwo, arrayOneKey, arrayTwoKey){
    var merged = [];
    if(!arrayOneKey) arrayOneKey = 'id';
    if(!arrayTwoKey) arrayTwoKey = arrayOneKey;
    // merge
    _.each(arrayOne, function(arrayOneItem){
      _.each(arrayTwo, function(arrayTwoItem){
        if (arrayOneItem.hasOwnProperty(arrayOneKey) &&
            arrayTwoItem.hasOwnProperty(arrayTwoKey) &&
            arrayOneItem[arrayOneKey] === arrayTwoItem[arrayTwoKey]){
          merged.push(_.extend(arrayOneItem, arrayTwoItem))
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