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


var standardise = {
    point: function(point){
        return point.position
    },
    vector: function(points, vector){
        return [
            points[vector.points[0]].position,
            points[vector.points[1]].position
        ]
    }
}

//todo-james handle some degree of error

var point_on_vector = function(std_point, std_vector){
    return point_near_vector(std_point, std_vector, 0)
}

var point_near_vector = function(tolerance, std_point, std_vector){

    var a = std_vector[0]
    var b = std_vector[1]
    var x = std_point

    var ab_dx = b.x - a.x
    var ab_dy = b.y - a.y

    var ax_dx = x.x - a.x
    var ax_dy = x.y - a.y

    var t = Math.atan2(ab_dy, ab_dx)
    var xt = Math.atan2(ax_dy, ax_dx)

    var sameAngle = Math.abs( t - xt ) < tolerance

    var ab_d_sq = ab_dx * ab_dx + ab_dy * ab_dy
    var ax_d_sq = ax_dx * ax_dx + ax_dy * ax_dy

    return sameAngle && ax_d_sq <= ab_d_sq
}