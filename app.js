var update = function(){
    mouse.update()
    var origin = closest(points, { position: mouse.positions.click } )
    var target = closest(points, { position: mouse.positions.current } )

     if(!hovered_line) {
        if(target && target.distance < 15 ){
            hovered = target.point;

            if(mouse.is.click){
                selected = hovered
            }
        } else {
            hovered = null;
        }
    }

    if(!hovered){
        var tolerance = tolerance = Math.PI/80
        hovered_line = null;
        each(function(vector){
            var isNear = point_near_vector( tolerance, mouse.positions.current ,standardise.vector(points, vector))
            if ( isNear ){
                hovered_line = vector
            }
        },vectors)

    }




    if(mouse.is.release){
        selected = null
    }
    if(selected && mouse.is.down){
        selected.position.x = mouse.positions.current.x
        selected.position.y = mouse.positions.current.y
    }
    if(!hovered && !hovered_line && mouse.is.release ){
        var created_id = null;

        if(mouse.is.dragend){

            created_id = origin.point && target.point &&
                add.vector( id_counter++, vectors, origin.point, target.point)

        } else {
            created_id = add.point(id_counter++, points, {x: mouse.positions.current.x, y: mouse.positions.current.y} )

        }
        if( created_id && states.active_style != "default") {
             states[created_id] = states.active_style
        }
    }

    if( mouse.is.doubleclick ){
        if( hovered ){
            //remove hovered
            remove.point( states, vectors, points, hovered )
        } else {
            //remove last added
            remove.point( states, vectors, points, target )
        }
        if( hovered_line) {
            remove.vector( states, vectors, hovered_line)
        }
    }

}

var drawPoint = function(point){
        var style = state_types[states[point.id]]

        if(point.nVectors == 0 || point == hovered || point == selected || style){
            style = style || state_types["default"]

            var d = 10 * (point == hovered ? 1.3 : 1)
            con.fillStyle = style.fillStyle


            con.fillRect(point.position.x-d/2,point.position.y-d/2,d,d)
        }

    }

var render = function(){
    can.width = window.innerWidth
    can.height = window.innerHeight

    each(function(vector){
        var a = points[vector.points[0]].position
        var b = points[vector.points[1]].position

        con.beginPath()
        var style = state_types[states[vector.id]] || state_types["default"]
        con.strokeStyle = style.strokeStyle
        con.lineWidth = Number(style.lineWidth) * (vector == hovered_line ? 2 : 1)

        con.moveTo(a.x, a.y)
        con.lineTo(b.x,b.y)
        con.stroke()
    }, vectors)

    each(drawPoint, points)

    //draw cursor last, so it is on top
    drawPoint({ id: "active_style", position: clone(mouse.positions.current) , nVectors: 0, vectors: {} })
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
          localStorage.setItem("states",JSON.stringify(states))
          localStorage.setItem("state_types",JSON.stringify(state_types))
          localStorage.setItem("state_type_order", JSON.stringify(state_type_order))
          localStorage.setItem("id_counter", id_counter )
          states.active_style = states.active_style || "default"
        }
    },
    load: function(){
        points = JSON.parse(localStorage.getItem("points")) || {}
        vectors = JSON.parse(localStorage.getItem("vectors")) || {}
        states = JSON.parse(localStorage.getItem("states")) || {}
        state_types = JSON.parse(localStorage.getItem("state_types")) || {"default" : { fillStyle: "black", strokeStyle:"black", lineWidth: 1 }}
        state_type_order = JSON.parse(localStorage.getItem("state_type_order")) || { "default": "state_" + (++id_counter) }
        id_counter = Number(localStorage.getItem("id_counter")) || id_counter
    },
    clear: function(){
        vectors = {}
        points = {}
        id_counter = 1
    }
}

var initStateOrder = function(){
    _.each(state_types, function(state_type, state_type_name){
      if(!state_type_order[state_type_name]){
        state_type_order[state_type_name] = "state_" + (++id_counter)
      }
    })
}


var id_counter = 1
var vectors = {}
var points = {}
var state_types = {}
var state_type_order = {}
var states = {}

var selected = null;
var hovered = null;
var hovered_line = null;

var can = document.createElement("canvas")

var con = can.getContext("2d")

document.body.appendChild(can)
mouse.config.manual_update = true
mouse.config.element = can
mouse.startListening()


document.addEventListener('DOMContentLoaded', function(){
    persistence.load()
    initStateOrder()
    ui.init()
    setInterval(persistence.save,1000)
    loop()
})