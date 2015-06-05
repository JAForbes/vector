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

var render = function(){
    can.width = window.innerWidth
    can.height = window.innerHeight

    each(function(vector){
        var a = points[vector.points[0]].position
        var b = points[vector.points[1]].position

        con.beginPath()
        var style = state_types[states[vector.id]] || state_types["default"]
        con.strokeStyle = vector == hovered_line ? "red" : style.strokeStyle
        con.lineWidth = style.lineWidth

        con.moveTo(a.x, a.y)
        con.lineTo(b.x,b.y)
        con.stroke()
    }, vectors)

    each(function(point){
        var style = state_types[states[point.id]]

        if(point.nVectors == 0 || point == hovered || point == selected || style){
            style = style || state_types["default"]

            con.fillStyle = selected == point ? "red" :
            hovered == point ? "aqua" : style.fillStyle


            con.fillRect(point.position.x-5,point.position.y-5,10,10)
        }

    }, points)
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
          localStorage.setItem("id_counter", id_counter )
        }
    },
    load: function(){
        points = JSON.parse(localStorage.getItem("points")) || {}
        vectors = JSON.parse(localStorage.getItem("vectors")) || {}
        states = JSON.parse(localStorage.getItem("states")) || {}
        state_types = JSON.parse(localStorage.getItem("state_types")) || {"default" : { fillStyle: "black", strokeStyle:"black", lineWidth: 1 }}

        id_counter = Number(localStorage.getItem("id_counter")) || id_counter
    },
    clear: function(){
        vectors = {}
        points = {}
        id_counter = 1
    }
}


var id_counter = 1
var vectors = {}
var points = {}
var state_types = {}
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

var addStateElement = function(key, colour, lineWidth){
    var state_node = state_template_item.cloneNode(true)
    state_node.id=""

    //key == "default" && (state_node.childNodes[1].disabled = true) && (state_node.childNodes[1].readonly = true)
    key && (state_node.childNodes[1].value = key)
    key && state_node.setAttribute("data-previous", key)
    colour && (state_node.childNodes[3].value = colour)
    lineWidth && (state_node.childNodes[5].value = lineWidth)
    state_list.appendChild(state_node)
}
document.addEventListener('DOMContentLoaded',function(){

    persistence.load()
    each(function(state, key){
        addStateElement(key, state.fillStyle, state.lineWidth)
    },state_types)
    setInterval(persistence.save,1000)
    loop()

    state_list.addEventListener("click",function(event){
        var button = event.srcElement
        var li = button.parentElement
        var keyEl = li.childNodes[1]
        var prev = li.getAttribute("data-previous")

        if(button.type == "submit"){
            li.remove()
            delete state_types[prev]

            //set back to default style state
            for(var key in states){
                var val = states[key]
                if( val == prev) {
                    states[key] = input.value

                    delete states[key]
                }
            }

        }

    })

    //state list view logic
    state_list.addEventListener('input',function(event){
      var input = event.srcElement

      var li = input.parentElement
      if(input.type == "text") {

        var li = input.parentElement
        var last_li = state_list.childNodes[state_list.childNodes.length-1]
        var second_last_li =state_list.childNodes[state_list.childNodes.length-2]
        var isEmpty = input.value.length == 0

        if(li == last_li){
            if(!isEmpty){
              addStateElement()
            }
        }


        var prev = li.getAttribute("data-previous")
        //code behind
        if(!isEmpty){
            //update key
            state_types[input.value] = state_types[prev] || clone( state_types["default"] )
            delete state_types[prev]

            //todo-james not very performance friendly, but we're optimizing for rendering not input change

            //update style state keys
            for(var key in states){
                var val = states[key]
                if( val == prev) {
                    states[key] = input.value
                }
            }

            li.setAttribute("data-previous", input.value)
        }

      } else {
        var key = li.childNodes[1].value
        var state_type = state_types[key]
        state_type.fillStyle = state_type.strokeStyle = li.childNodes[3].value
        state_type.lineWidth = li.childNodes[5].value
      }

    })


})