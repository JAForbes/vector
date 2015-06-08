var systems = {}

systems.closestToTarget = function(){
    var sqrt = Math.sqrt
    var sq = _.partialRight(Math.pow,2)

    _.each( C("Target"), function(target, target_id){

        var getPosition = C.bind(C, "Position")
        var target_position = C("Position", target_id)
        var position_ids = Object.keys( C(target.type) )
            .filter( getPosition )

        var closest_id = _.min( position_ids, function(id){
            return distance( target_position, getPosition(id) )
        })

        var isValidType = closest_id != target_id && closest_id != Infinity

        if( isValidType ) {
            target.closest = closest_id
        }
    })
}

systems.mouseTargets = function(){
    if ( _.isEmpty( C("Mouse") ) ) {
        C({ Mouse: {}, MouseCurrent: {}, Position: {x:0 , y:0}, Target: { type: "Point" } })
        C({ Mouse: {}, MouseClick: {}, Position: {x:0, y:0}, Target: { type: "Point"} })
    }

    var current_id = Object.keys( C("MouseCurrent") )[0]
    var click_id = Object.keys( C("MouseClick") )[0]

    var current_position = C("Position",current_id)
    var click_position = C("Position", click_id)

    current_position.x = mouse.positions.current.x
    current_position.y = mouse.positions.current.y

    click_position.x = mouse.positions.click.x
    click_position.y = mouse.positions.click.y
}