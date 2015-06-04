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


var sq = function(val){ return val * val }
var update = function(){
    mouse.update()
    var origin = closest(points, { position: mouse.positions.click } )
    var target = closest(points, { position: mouse.positions.current } )


    var tolerance = tolerance = Math.PI/50
    hovered_line = null;
    each(function(vector){
        var isNear = point_near_vector( tolerance, mouse.positions.current ,standardise.vector(points, vector))
        if ( isNear ){
            hovered_line = vector
        }
    },vectors)

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
                add.vector( id_counter++, vectors, origin.point, target.point)

        } else {
            add.point(id_counter++, points, {x: mouse.positions.current.x, y: mouse.positions.current.y} )

        }
    }

    if( mouse.is.doubleclick ){
        if( hovered ){
            //remove hovered
            remove.point( vectors, points, hovered )

        } else {
            //remove last added
            remove.point( vectors, points, target )
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
        con.strokeStyle = vector == hovered_line ? "red" : "black"

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

var persistence = {
    save: function(){
        if(id_counter > 1){
          localStorage.setItem("points",JSON.stringify(points))
          localStorage.setItem("vectors",JSON.stringify(vectors))
          localStorage.setItem("id_counter", id_counter )
        }
    },
    load: function(){
        points = JSON.parse(localStorage.getItem("points"))
        vectors = JSON.parse(localStorage.getItem("vectors"))
        id_counter = Number(localStorage.getItem("id_counter")) || id_counter
    },
    clear: function(){
        vectors = {}
        points = {}
        id_counter = 1
    }
}

var vectors = {}
var points = {}
var selected = null;
var hovered = null;
var hovered_line = null;

var can = document.createElement("canvas")
var con = can.getContext("2d")
document.body.appendChild(can)

mouse.config.manual_update = true
mouse.config.element = can
mouse.startListening()
persistence.load()
setInterval(persistence.save,1000)
loop()