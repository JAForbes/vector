
We render our UI by iterating over our data structures.
The problem is, the data is a (unordered) hash.  Editing a key
changes the order of an element in the UI

This branch is going to try using an ECS to handle the data structure/serialization
And solve the problem of keys changing.


