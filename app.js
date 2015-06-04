var can = document.createElement("canvas")
var con = can.getContext("2d")
document.body.appendChild(can)

mouse.config.manual_update = true
mouse.startListening()

var id_counter = 1;
var uid = function(prefix){
    return [prefix] + id_counter++
}

var each = function(visitor, obj){
    for(var key in obj){
        visitor(obj[key], key, obj)
    }
    return obj
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



/*
    vectors = {
        <id> : { id: <id> , points: [<id>,<id>] }
    }
*/
var vectors = {}
/*
    points = {
        <id> : { id: <id> , position: { x,y} , vectors: { <id> : true, <id> : true, ... }, nVectors: 0 }
    }
*/
var points = {}

var add = {

    init: function(vectors, points){
        //create a shorthand stateful API
        //where vectors, and points don't need to be passed in
        this.vector = this._vector.bind(null, vectors)
        this.point = this._point.bind(null, points)
    },

    //public vector: (a,b)
    _vector: function(vectors, a, b){
        var id = uid("vector_")

        //create vector
        vectors[id] = { id: id, points: [a.id, b.id] }

        //create a look up for this vector on the points
        a.vectors[id] = b.vectors[id] = id
        a.nVectors++
        b.nVectors++
        return id
    },

    //public point: (position)
    _point: function( points, position ){
        var id = uid("point_")
        points[id] = { id: id, position: position, vectors: {}, nVectors: 0 }
        return id
    }
}

var remove = {

    init: add.init,

    //public vector: ( vector || vector.id )
    _vector: function(vectors, v){
        //accept id or vector object
        v = v.id && v || vectors[v]

        var id = v.id

        //remove vector lookup from points
        v.points.forEach(function(point_id){
            delete points[point_id].vectors[id]
            points[point_id].nVectors--
        })

        //remove vector from vectors collection
        delete vectors[v.id]
    },

    //public point: ( point )
    _point: function(points, point){
        each(remove.vector,point.vectors)
        delete points[point.id]
    }
}

var selected = null;
var hovered = null;

var sq = function(val){ return val * val }
var update = function(){
    mouse.update()

    var origin = closest(points, { position: mouse.positions.click } )
    var target = closest(points, { position: mouse.positions.current } )


    if(target && target.distance < 15 ){
        hovered = target.point;

        if(mouse.is.click){
            selected = hovered
        }
    } else {
        hovered = null;
    }

    if(mouse.is.release){
        selected = null
    }
    if(selected && mouse.is.down){
        selected.position.x = mouse.positions.current.x
        selected.position.y = mouse.positions.current.y
    }

    if(!hovered && mouse.is.release ){
        if(mouse.is.dragend){

            origin.point && target.point &&
                add.vector( origin.point, target.point)

        } else {
            add.point( {x: mouse.positions.current.x, y: mouse.positions.current.y} )

        }
    }

    if( mouse.is.doubleclick ){
        if( hovered ){
            //remove hovered
            remove.point( hovered )

        } else {
            //remove last added
            remove.point( target )
        }
    }

}

var render = function(){
    can.width = window.innerWidth
    can.height = window.innerHeight * 0.8

    each(function(point){
        if(point.nVectors == 0 || point == hovered || point == selected){
            con.fillStyle = selected == point ? "red" :
            hovered == point ? "aqua" :
            "black"

            con.fillRect(point.position.x-5,point.position.y-5,10,10)
        }

    }, points)
    each(function(vector){
        var a = points[vector.points[0]].position
        var b = points[vector.points[1]].position

        con.beginPath()
        con.moveTo(a.x, a.y)
        con.lineTo(b.x,b.y)
        con.stroke()
    }, vectors)
}

var loop = function(){
    update()
    render()
    requestAnimationFrame(loop)
}

var save = function(){
    if(id_counter > 1){
      localStorage.setItem("points",JSON.stringify(points))
      localStorage.setItem("vectors",JSON.stringify(vectors))
      localStorage.setItem("id_counter", id_counter )
    }
}


var load = function(){

    points = JSON.parse(localStorage.getItem("points"))
    vectors = JSON.parse(localStorage.getItem("vectors"))
    id_counter = 1 + Number(localStorage.getItem("id_counter")) || id_counter

}
load()

setInterval(save,1000)
add.init(vectors,points)
remove.init(vectors,points)
loop()
