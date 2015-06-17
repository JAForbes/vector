var ui = {

    init: function(){
        can.addEventListener("mousewheel",
            this.cycleStateType.bind(this)
        )
        btn_add_state_type.addEventListener("click", this.createStateType.bind(this))
        m.render(state_list, this.state_type_list(states, state_types))
    },

    //todo-james should be in a model?
    updateStateTypeName: function(state_types, prev, event){
        var el = event.srcElement

        //create or update the state type
        state_types[el.value] = typeof state_types[prev] != "undefined" ? state_types[prev] : clone(state_types["default"])
        delete state_types[prev]

        //todo-james state_type_order is global
        state_type_order[el.value] = state_type_order[prev]
        delete state_type_order[prev]

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
        state_type_order[""] = (++id_counter)
        m.render(state_list, this.state_type_list(states, state_types))
    },

    cycleStateType: function(e){
        //todo-james not pure

        var target = _.first(_.toArray(selected)) || hovered_line || hovered || { id: "active_style"}
        var state_type_list = Object.keys(state_types)

        var current_state = typeof states[target.id] !== "undefined" ? states[target.id] : "default"
        var current_state_index = state_type_list.indexOf( current_state )

        var targets = _.isEmpty(selected) ? [target] : selected
        _.each(targets, function(target ){
            var direction = cmp(e.deltaY)
            states[target.id] = state_type_list[ (current_state_index + state_type_list.length + direction) % state_type_list.length]

        })
        m.render(state_list, this.state_type_list(states, state_types))

    },

    removeStateType: function(states, state_types, state_type_name, event){
        var button = event.srcElement

        delete state_types[state_type_name]
        delete state_type_order[state_type_name]

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
      return _.sortBy( _.keys(state_types), function(state_type_name){
            return state_type_order[state_type_name]
        })
        .map(function(state_type_name, i){
          var state_type = state_types[state_type_name]

          var inputs = [
            m('input[type=text]', {
                value: state_type_name,
                oninput: this.updateStateTypeName.bind(this, state_types, state_type_name),
                disabled: i == 0,
                class: state_type_name == states.active_style ? "selected" : ""
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