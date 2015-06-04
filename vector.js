var add = {

    vector: function(uid, vectors, a, b){
        var id = "vector_" + uid

        if( a != b ){
            //create vector
            vectors[id] = { id: id, points: [a.id, b.id] }

            //create a look up for this vector on the points
            a.vectors[id] = b.vectors[id] = id
            a.nVectors++
            b.nVectors++
            return id
        }

    },

    point: function( uid, points, position ){
        var id = "point_" + uid
        points[id] = { id: id, position: position, vectors: {}, nVectors: 0 }
        return id
    }
}

var remove = {

    vector: function(vectors, v){
        //accept id or vector object
        v = v.id && v || vectors[v]

        var id = v.id

        //remove vector lookup from points
        v.points.forEach(function(point_id){
            delete points[point_id].vectors[id]
            points[point_id].nVectors--
        })

        //remove vector from vectors collection
        delete vectors[v.id]
    },

    point: function(vectors, points, point){
        each(remove.vector.bind(null, vectors),point.vectors)
        delete points[point.id]
    }
}
