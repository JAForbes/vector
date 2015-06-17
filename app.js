var update = function(){
    mouse.update()
    var origin = closest(points, { position: mouse.positions.click } )
    var target = closest(points, { position: mouse.positions.current } )

     if(!hovered_line) {
        if(target && target.distance < 15 ){
            hovered = target.point;


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

    var hover_target = hovered || hovered_line
    if(hover_target && mouse.is.click){

        if(!shift_key && !alt_key){
            selected = {}
        }
        if(alt_key){
            delete selected[hover_target.id]
        } else {
            selected[hover_target.id] = {
                id: hover_target.id,
                positions: {}
            }

            if( points[hover_target.id]) {
                selected[hover_target.id].positions = _.clone(hover_target.position)
            }
        }

    }
    if(mouse.is.click){
        _.each(selected, function(item, item_id){
            if(points[item_id]){
                item.positions.selected = _.clone(points[item_id].position)
            }
        })
    }

    if( mouse.is.down){
        _.each(selected, function(item, item_id){
            var p = points[item_id]
            var m = mouse.positions.current
            var d  = {
                x: mouse.positions.click.x - mouse.positions.current.x,
                y: mouse.positions.click.y - mouse.positions.current.y,
            }
            if(p){
                p.position.x = item.positions.selected.x - d.x
                p.position.y = item.positions.selected.y - d.y

            }
        })

    }
    if(!hovered && !hovered_line && mouse.is.release && Object.keys(selected).length == 0){
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

    if(mouse.is.release && !mouse.is.dragend && (!hovered_line && !hovered)){
        selected = {}
    }


}

var drawPoint = function(point){
        var style = state_types[states[point.id]]

        if(point.nVectors == 0 || point == hovered || selected[point.id] || style){


            if( selected[point.id] ){
                var d = 20
                con.fillStyle = "#B8FFF5"
                con.fillRect(point.position.x-d/2,point.position.y-d/2,d,d)
            }

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
        var style = state_types[states[vector.id]] || state_types["default"]
        var lineWidth = Number(style.lineWidth) * (vector == hovered_line ? 2 : 1)

        if( selected[vector.id] ){
            con.beginPath()
            con.strokeStyle = "#B8FFF5"
            con.lineWidth = _.max([lineWidth * 2.5,10])

            con.moveTo(a.x, a.y)
            con.lineTo(b.x,b.y)
            con.stroke()
        }

        con.beginPath()

        con.strokeStyle = style.strokeStyle
        con.lineWidth = lineWidth

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
        state_types = JSON.parse(localStorage.getItem("state_types")) || {"default" : { fillStyle: "#000000", strokeStyle:"#000000", lineWidth: 1 }}
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

var shift_key = false;
var alt_key = false;
window.onkeydown = function(e){
    if(!alt_key){
        alt_key = e.keyCode == 18
    }
    if(!shift_key){
        shift_key = e.keyCode == 16
    }

}
window.onkeyup = function(e){
    if(e.keyCode == 16){
        shift_key = false
    }
    if(e.keyCode == 18){
        alt_key = false
    }
}

var id_counter = 1
var vectors = {}
var points = {}
var state_types = {}
var state_type_order = {}
var states = {}

var selected = {};
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