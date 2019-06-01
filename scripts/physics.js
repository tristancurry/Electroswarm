//physics.js

//Functions for calculating forces between things
//this will include the variable timestep stuff



//Functions for constructing the quadtree for each particle species

//for each particle species, do the bh quadtree thing as usual
//this will handle self-attraction/repulsion as normal

//then: how to deal with the cross-over?
//we already will have the space neatly stratified for each species
//for each particle,
////'add it' to a copy of the quadtree for another species
////this will give it an 'interaction list' to work against
////while avoiding the need to rebuild the tree


//so for each particle, there is...
//an interaction list due to particles of the same species (determined for all particles of a species when the quadtree is built)
//interaction lists due to particles of each other species

//so build each quadtree first (cycle through particle lists for species a, b and c)
//then build interaction list for each particle
////start at trunk: is this particle FAR ENOUGH from the average position of charge (in this case, all charges?)
////if not, go to next level of space-division. For each node, same question!
////if yes, add this nodes' position(or distance) and total charge to this particle's interaction list
////keep doing this until the limit of the recursion has been encountered or there's nothing else to interact with.
////with own species - avoid self-interaction
////with other species - 

//so the extra impost, compared with a single BHA, is just the creation of two additional, independent quadtrees.


//once each particle has its interaction list, then carry out the force calculations
//F = coupling*q_1*q_2/(dist^2);
//direction of force? Calculate unit components ahead of time (compX = dX/dist, compY = dY/dist - same as cosA, sinA)
k
 



