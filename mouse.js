var mouse = {

    startListening: function(options){

        options = options || this

        var prepare = options.prepare
        var sequence = options.sequence

        options._state.listeners = [
            [
                "mousemove",
                prepare(options._saveEventPosition, [options.positions.current] )
            ],
            [
                "mousedown",
                sequence(
                    prepare(options._saveEventPosition, [options.positions.click] ),
                    prepare(options._set, [options._state, "down", 1] )
                )
            ],
            [
                "mouseup",
                prepare(options._set, [options._state, "down", 0] )
            ]
        ]

        var listener = options._state.listener = options.config.element

        options._state.listeners.forEach(function(listener_config){
            window.addEventListener.apply(listener, listener_config)
        })

        options.update = prepare( options._update, [options.config, options._state, options.is])
        if( !options.config.manual_update ){
            options._state.update_interval_id = setInterval(  options.update, options.config.update_frequency )
        }
    },

    stopListening: function(options){
        options = options || this

        options._state.listeners.forEach(function(listener_config){
            window.removeEventListener.apply(options._state.listener, listener_config)
        })
        clearInterval( options._state.update_interval_id )
    },

    _update: function(config, state, is){


        var pos = {
            current : mouse.positions.current,
            click : mouse.positions.click
        }

        is.down = state.down > 0
        is.release = state.down == 0
        is.click = state.down == 1
        is.initialised = is.initialised || (pos.current.x + pos.current.y + pos.click.x + pos.click.y) < Infinity

        is.drag = is.down && is.initialised && Math.abs(pos.current.x-pos.click.x) + Math.abs(pos.current.y-pos.click.y) > config.min_drag_distance

        is.dragend = is.dragstarted && is.release
        if( is.dragend ){
            is.dragstarted = null
        }
        var now = new Date().getTime()
        if( is.drag && !is.dragstarted){
            is.dragstarted = now
        }
        if( !is.drag && !is.dragended){
            is.dragended = now
        }
        is.dragstart = is.dragstarted == now
        if(is.dragstart){
            is.dragended = null
        }
        state.down += is.down ? 1 : -1

    },

    config: {
        element: window,
        manual_update: false,
        min_drag_distance: 10,
        update_frequency: 0
    },

    is: {
        click: false,
        down: false,
        release: false,
        drag: false,
        dragend: false,
    },

    _state: {
        //-2 means the mouse was release one frame ago
        //avoids triggering any states of interest
        down: -2,
        update_interval_id: -1
    },

    positions: {
        current: { x:Infinity , y: Infinity},
        click: { x:Infinity, y: Infinity},
    },

    _saveEventPosition: function(position, event){
        position.x = event.clientX
        position.y = event.clientY
    },

    _set: function(target, property, value){
        target[property] = value
    },

    sequence: function(f, g){
        return function(){
            arguments[0] = f.apply(null, arguments)
            arguments[0] = g.apply(null, arguments)

            return arguments[0]
        }
    },

    prepare: function(fn, args){ return function(){
        var newArgs = args.slice()
        for(var i = 0; i < arguments.length; i++){
            newArgs.push( arguments[i])
        }
        return fn.apply( null, newArgs)
    }}
}