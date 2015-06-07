var ui = {
    init: function(){
        /* state_list, can, */
        state_list.addEventListener("click", this.removeStateType)
        can.addEventListener("mousewheel", this.changeStateType)
        btn_add_state_type.addEventListener("click", this.addStateElement.bind(null, null, null, null))
        state_list.addEventListener('input', this.onInput.bind(this))
    },

    onTextInput: function(event){
        var input = event.srcElement
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
    },

    onInput: function(event){
        var input = event.srcElement

        var li = input.parentElement
        if(input.type == "text") {
           this.onTextInput(event)
        } else {
            //colour and stroke width
            var key = li.childNodes[1].value
            var state_type = state_types[key]
            state_type.fillStyle = state_type.strokeStyle = li.childNodes[3].value
            state_type.lineWidth = li.childNodes[5].value
        }

    },

    addStateElement: function(key, colour, lineWidth){
        var state_node = state_template_item.cloneNode(true)
        state_node.id=""
        key = key || ""
        key == "default" && (state_node.childNodes[1].disabled = true) && (state_node.childNodes[1].readonly = true)
        key && (state_node.childNodes[1].value = key)
        key && state_node.setAttribute("data-previous", key)
        colour && (state_node.childNodes[3].value = colour)
        lineWidth && (state_node.childNodes[5].value = lineWidth)

        //input
        state_list.appendChild(state_node)

        //initialize state types in case colour, or stroke is edited by a name is given
        state_types[key] = typeof state_types[key] != "undefined" ? state_types[key] : clone(state_types["default"])
    },

    changeStateType: function(e){
        if(hovered_line){
            var direction = cmp(e.deltaY)
            var state_type_list = Object.keys(state_types)
            var current_state = typeof states[hovered_line.id] !== "undefined" ? states[hovered_line.id] : "default"
            var current_state_index = state_type_list.indexOf( current_state )
            states[hovered_line.id] = state_type_list[ (current_state_index + state_type_list.length + direction) % state_type_list.length]
        }
    },

    removeStateType: function(event){
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
                    delete states[key]
                }
            }

        }
    }
}