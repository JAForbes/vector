var cmp = function(n){
  return n > 0 ?  1 :
         n < 0 ? -1 :
         0
}

var each = function(visitor, obj){
    for(var key in obj){
        visitor(obj[key], key, obj)
    }
    return obj
}

var clone = function(object){
    var r = {}
    each(function(val, key){
        r[key] = val
    },object)
    return r
}

//todo-james use a qtree or something later
var closest = function(points, target){
    var origin
    var shortestDistance = Infinity
    each(function(point){

       var d = Math.sqrt(
        sq( point.position.x - target.position.x ) + sq(point.position.y - target.position.y)
       )
       if( d < shortestDistance){
           shortestDistance = d
           origin = point
       }
    }, points)
    return { point: origin, distance: shortestDistance }
}


var sq = function(val){ return val * val }