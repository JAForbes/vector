var can = document.createElement("canvas")
var con = can.getContext("2d")
document.body.appendChild(can)

mouse.config.manual_update = true
mouse.startListening()

//todo-james use a qtree or something later
var closest = function(points, target){
    var origin
    var shortestDistance = Infinity
    points.forEach(function(point){
       var d = Math.sqrt(
        sq( point.x - target.x ) + sq(point.y - target.y)
       )
       if( d < shortestDistance){
           shortestDistance = d
           origin = point
       }
    })
    return { point: origin, distance: shortestDistance }
}

var vectors = []
var points = []
var selected = null;
var hovered = null;

var sq = function(val){ return val * val }
var update = function(){
    mouse.update()

    var origin = closest(points, mouse.positions.click)
    var target = closest(points, mouse.positions.current)


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
        selected.x = mouse.positions.current.x
        selected.y = mouse.positions.current.y
    }

    if(!hovered && mouse.is.release ){
        if(mouse.is.dragend){

            origin.point && target.point && vectors.push(
                [origin.point,target.point]
            )

        } else {
            points.push( {x: mouse.positions.current.x, y: mouse.positions.current.y} )
        }
    }

    if( mouse.is.doubleclick){
        if( hovered ){
            //remove hovered
            points.splice( points.indexOf(hovered), 1)


            vectors.filter(function(vector, i){
                return vector.indexOf(hovered) > -1
            })
            .forEach(function(vector){
                vectors.splice( vectors.indexOf(vector), 1)
            })

        } else {
            //remove last added
            points.pop()
        }
    }



}

var render = function(){
    can.width = window.innerWidth
    can.height = window.innerHeight

    points.forEach(function(point){
        con.fillStyle = hovered == point && "aqua" || "black"
        con.fillRect(point.x-5,point.y-5,10,10)
    })
    vectors.forEach(function(vector){
        var a = vector[0]
        var b = vector[1]

        con.beginPath()
        con.moveTo(a.x, a.y)
        con.lineTo(b.x,b.y)
        con.stroke()
    })
}

var loop = function(){
    update()
    render()
    requestAnimationFrame(loop)
}
loop()
