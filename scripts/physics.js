//physics.js

const R_1 = 20; //radius within which the timestep for physics calculations is reduced by factor of 10
const R_2 = 2;	//timestep reduced by another factor of 10
const R_3 = 0.2; //etc

const MAX_DEPTH = 10; //maximum depth for recursion in building quadtree

//coupling 'matrix' will be updated via UI
let coupling = {
	a: {a: 1, b: 1, c: 1},
	b: {a: 1, b: -100, c: 1},
	c: {a: 1, b: 1, c: 1}
}




//Functions for calculating forces between things
//this will include the variable timestep stuff

function calculateDistance(particle, otherThing){
	let dX = otherThing.pos.x - particle.pos.x;
	let dY = otherThing.pos.y - particle.pos.y;
	
	let d_sq = Math.pow(dX,2) + Math.pow(dY,2);
	let d = Math.sqrt(d_sq);
	
	let d_pack = [d, d_sq, dX, dY];
	return d_pack;
}


function calculateForce(particle, otherThing){
	
	//need distance, and components
	let dists = calculateDistance(particle, otherThing);
	let k = coupling[particle.species][otherThing.species];

	let q1 = particle.charge;
	let q2 = otherThing.charge;
	
	//if(dists[0] < R_1) {steps = steps*10; console.log('inside R1');}
	//if(dists[0] < R_2) {steps = steps*10; console.log('inside R2');}
	//if(dists[0] < R_3) {steps = steps*10; console.log('inside R3');}
	let F_mag = k*q1*q2/dists[1];
		
	let F = {
		x : F_mag*(dists[2]/dists[0]),
		y : F_mag*(dists[3]/dists[0])
	}
	
			
	particle.acc.x += F.x/particle.mass;
	particle.acc.y += F.y/particle.mass;
	
	otherThing.acc.x -= F.x/otherThing.mass;
	otherThing.acc.y -= F.y/otherThing.mass;
		
	
}

function doForces(){  //this will be replaced by the BHA force calculations
	//for each particle,
	//go through own species list
	for(let sp in particles){
		let list = particles[sp].list;
		for(let i = 0, l = list.length; i < l; i++){
			let thisP = list[i];
			if(!thisP.dead){
				for(let j = 1; j < l; j++){
					if(i != j){
						let thatP = list[j];
						if(!thatP.dead){
							calculateForce(thisP, thatP);
						}
					}
				}
			}
		}	
	}
	//go through each other species' lists
	
}

function already(particle){
	
}
//F = coupling*q_1*q_2/(dist^2);
//direction of force? Calculate unit components ahead of time (compX = dX/dist, compY = dY/dist - same as cosA, sinA)








//Functions for constructing the quadtree for each particle species


function calculateCoM(particleList){
	let CoM = {x:0, y:0, m:0, q:0};
	
	//calculate total mass (and charge, while we're at it)
	for(let i = 0, l = particleList.length; i < l; i++){
		CoM.m += particleList[i].mass;
		CoM.q += particleList[i].charge;
	}
	
	//centre of mass position = weighted sum of positions (average position of mass)
	//CoMx =    thisX*(thisMass/TotalMass)
	//CoMy = 	thisY*(thisMass/TotalMass)
	
	for(let i = 0, l = particleList.length; i < l; i++){
		let p = particleList[i];
		CoM.x += p.pos.x*p.mass;
		CoM.y += p.pos.y*p.mass;
	}
	
	CoM.x = CoM.x/CoM.m;
	CoM.y = CoM.y/CoM.m;
	
	return CoM;
}

function calculateBoundingBox(particleList, CoM){
	
	
	if(!CoM){
		CoM = calculateCoM(particleList);
	}
	
	//find most extreme x and y positions in the particleList
	//then reference these to the CoM
	bBox = {
		xMin: 0,
		xMax: 0,
		yMin: 0, 
		yMax: 0
	}
	
	for(let i = 0, l = particleList.length; i < l; i++){
		let p = particleList[i];
		if(!p.dead){
		
		if(i == 0){
			bBox.xMin = p.pos.x;
			bBox.xMax = p.pos.x;
			bBox.yMin = p.pos.y;
			bBox.yMax = p.pos.y;
		} else {
			if(p.pos.x < bBox.xMin){bBox.xMin = p.pos.x;} 
			else if(p.pos.x > bBox.xMax){bBox.xMax = p.pos.x;}

			if(p.pos.y < bBox.yMin){bBox.yMin = p.pos.y;} 
			else if(p.pos.y > bBox.yMax){bBox.yMax = p.pos.y;} 		
			}
		}
	}
	
	//bBox.xMin -= CoM.x;
	//bBox.xMax -= CoM.x;
	//bBox.yMin -= CoM.y;
	//bBox.yMax -= CoM.y;
	bBox.width = bBox.xMax - bBox.xMin;
	bBox.height = bBox.yMax - bBox.yMin;
	
	return bBox;
	
}

function isThisMyNode(particle, node){
	
	if(particle.pos.x >= node.bounds.xMin && particle.pos.x <= node.bounds.xMax){
		if(particle.pos.y >= node.bounds.yMin && particle.pos.y <= node.bounds.yMax){
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}



function buildTree(species){
	
	
	let trunk = {
		bounds: calculateBoundingBox(particles[species].list),	
		list: [],
		CoM: {x:0,y:0,m:0,q:0},
		nodes: {UL: {}, UR: {}, LL: {}, LR: {}},
		charge: 0
	}
	
	//now cram each particle into the tree structure
	for(let i = 0, l = particles[species].list.length; i < l; i++){
		addParticle(particles[species].list[i], trunk);
	}
	
	console.log(trunk);
}

function addParticle(p, node){
	//STEP 1. Is the particle inside the bounds of this node?
	if(p.pos.x >= node.bounds.xMin && p.pos.x <= node.bounds.xMax && p.pos.y >= node.bounds.yMin && p.pos.y <= node.bounds.yMax){
		//add to the node's list of particles
		node.list.push(p);  //later - calculate total charge, mass and CoM of this node
		
		//STEP 2. Will this particle be alone in the node?
		if(node.list.length == 1){
			//we're done.
		} else if(node.list.length == 2){
			//great. now we gotta make some sub-nodes and try to put each of the existing particles in those too
			let halfWidth = 0.5*node.bounds.width;
			let halfHeight = 0.5*node.bounds.height;
			for(nd in node.nodes){
				let thisNode = node.nodes[nd];
				thisNode.list = [];
				thisNode.nodes = {UL: {}, UR: {}, LL: {}, LR: {}};
				switch(nd){
					case 'UL':
						thisNode.bounds = {xMin:node.bounds.xMin, xMax: node.bounds.xMin + halfWidth, yMin:node.bounds.yMin, yMax: node.bounds.yMin + halfHeight};
						break;					
					case 'UR':
						thisNode.bounds = {xMin:node.bounds.xMin + halfWidth, xMax: node.bounds.xMax, yMin:node.bounds.yMin, yMax: node.bounds.yMin + halfHeight};
						break;
					case 'LL':
						thisNode.bounds = {xMin:node.bounds.xMin, xMax: node.bounds.xMin + halfWidth, yMin:node.bounds.yMin + halfHeight, yMax: node.bounds.yMax};
						break;					
					case 'LR':
						thisNode.bounds = {xMin:node.bounds.xMin + halfWidth, xMax: node.bounds.xMax, yMin:node.bounds.yMin + halfHeight, yMax: node.bounds.yMax};
						break;
					default:
						break;
				}
				
				console.log(node.nodes);
				thisNode.bounds.width = thisNode.bounds.xMax - thisNode.bounds.xMin;
				thisNode.bounds.height = thisNode.bounds.yMax - thisNode.bounds.yMin;
				
			}
			
			//see which node a particle should go into, then try to put it into that node.
			for(let i = 0; i < node.list.length; i++){
				let this_p = node.list[i];
				for(nd in node.nodes){
					if(isThisMyNode(this_p, node.nodes[nd])){
						addParticle(this_p, node.nodes[nd]);
						break;
					}
				}	
			}
		} else if(node.list.length > 2){
			//glorious. we can now see if the particle will fit in any of the sub-nodes --> recursion
			for(nd in node.nodes){
					if(isThisMyNode(p, node.nodes[nd])){
					addParticle(p, node.nodes[nd]);
					break;
				}
			}	
		}
		
		node.CoM = calculateCoM(node.list);
		node.charge = node.CoM.q;
	}
}

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

 



