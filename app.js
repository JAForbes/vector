var can = document.createElement("canvas")
var con = can.getContext("2d")
document.body.appendChild(can)

var mouse = { x:0 , y:0, down: -2 , lastClick: { x:0, y:0 }}
    window.onmousemove = function(event){
        mouse.x = event.clientX
        mouse.y = event.clientY
    }
    window.onmousedown = function(){
        mouse.down = 1
        mouse.lastClick.x = mouse.x
        mouse.lastClick.y = mouse.y
    }
    window.onmouseup = function(){
        mouse.down = 0
    }
    mouse.update = function(){
        if(mouse.down > 0){
            mouse.down++
        } else {
            mouse.down--
        }

        if( mouse.down == mouse.RELEASED && Math.abs(mouse.x-mouse.lastClick.x) + Math.abs(mouse.y-mouse.lastClick.y) > 10 ){
            mouse.drag = true
        } else {
            mouse.drag = false
        }
    }
    mouse.RELEASED = -1
    mouse.CLICKED = 2

var closest = function(points, target){
    var origin
    var smallestD = Infinity
    points.forEach(function(point){
       var d = Math.sqrt(
        sq( point.x - target.x ) + sq(point.y - target.y)
       )
       if( d < smallestD){
           smallestD = d
           origin = point
       }
    })
    return [origin,smallestD]
}

var vectors = []
var points = []
var hovered = null;

var sq = function(val){ return val * val }
var update = function(){
    mouse.update()
    var origin = closest(points, mouse.lastClick)
    var target = closest(points, mouse)

     //hover
    if(target[0] && target[1] < 15 ){

        hovered = target[0];
    } else {
        hovered = null;
    }

    if(hovered && mouse.down > mouse.CLICKED && target[0]){
        target[0].x = mouse.x
        target[0].y = mouse.y
    }

    if(!hovered && mouse.down == mouse.RELEASED ){
        if(mouse.drag){
          
            origin[0] && target[0] && vectors.push(
                [origin[0],target[0]]
            )

        } else {
            points.push( {x: mouse.x, y: mouse.y} )   
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
