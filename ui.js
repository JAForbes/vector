var ui = {

    init: function(){
        can.addEventListener("mousewheel", this.cycleStateType)
        btn_add_state_type.addEventListener("click", this.createStateType.bind(this))
        m.render(state_list, this.state_type_list(states, state_types))
    },

    //todo-james should be in a model?
    updateStateTypeName: function(state_types, prev, event){
        var el = event.srcElement

        //create or update the state type
        state_types[el.value] = typeof state_types[prev] != "undefined" ? state_types[prev] : clone(state_types["default"])
        delete state_types[prev]
        //update style state keys
        for(var key in states){
            var val = states[key]
            if( val == prev) {
                states[key] = el.value
            }
        }

        m.render(state_list, this.state_type_list(states, state_types))
    },

    updateStateTypeColor: function(state_type, value){
        state_type.strokeStyle = state_type.fillStyle = value
    },

    updateStateLineWidth: function(state_type, value){
        state_type.lineWidth = value
    },

    createStateType: function(event){
        state_types[""] = clone(state_types["default"])
        m.render(state_list, this.state_type_list(states, state_types))
    },

    cycleStateType: function(e){
        var target = hovered_line || hovered
        if(target){
            var direction = cmp(e.deltaY)
            var state_type_list = Object.keys(state_types)
            var current_state = typeof states[target.id] !== "undefined" ? states[target.id] : "default"
            var current_state_index = state_type_list.indexOf( current_state )
            states[target.id] = state_type_list[ (current_state_index + state_type_list.length + direction) % state_type_list.length]
        }
    },

    removeStateType: function(states, state_types, state_type_name, event){
        var button = event.srcElement

        delete state_types[state_type_name]

        //set back to default style state
        for(var key in states){
            var val = states[key]
            if( val == state_type_name) {
                delete states[key]
            }
        }
        m.render(state_list, this.state_type_list(states, state_types))
    },

    state_type_list: function(states, state_types){
      return Object.keys(state_types)
        .map(function(state_type_name, i){
          var state_type = state_types[state_type_name]

          var inputs = [
            m('input[type=text]', {
                value: state_type_name,
                oninput: this.updateStateTypeName.bind(this, state_types, state_type_name)
            }),
            m('input[type=color]', {
                value: state_type.strokeStyle,
                oninput: m.withAttr("value", this.updateStateTypeColor.bind(this, state_type))
            }),
            m('input[type=range]', {
                value: state_type.lineWidth,
                oninput: m.withAttr("value", this.updateStateLineWidth.bind(this,state_type)),
                max:10, min:1, step:1, placeholder:5
            }),
          ]
          return m("li",
            //Add a remove button after the first item
            i == 0 ?
                inputs :

                inputs.concat(
                    m('button', {
                        onclick: this.removeStateType.bind(this, states, state_types, state_type_name)
                    }, "X")
                )
          )

        },this)
    }
}