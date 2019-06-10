//physics.js

const R_1 = 20; //radius within which force calculations are not performed (avoid excessive accelerations)
const R_1_SQ = Math.pow(R_1,2);


const MAX_DEPTH = 25; //maximum depth for recursion in building quadtree
const S_D_THRESHOLD = 0.5; //value of s/d below which the CoM of a node can be used for force calculation. S is the width of the node, d is the distance of a particle to the node's CoM.
const S_D_THRESHOLD_SQ = Math.pow(S_D_THRESHOLD,2);
const COUPLING_VALUES = [-1000, -500, -100, -50, -10, 0, 10, 50, 100, 500, 1000];
const MASS_VALUES = [1, 2, 5, 10, 100, 500, 1000, 10000];
const CHARGE_VALUES = [0, 1, 2, 5, 10, 100, 500, 1000, 10000];

direct_calc = false;
bha_calc = true;

let nodeList = {a: [], b: [], c: []};

//coupling 'matrix' will be updated via UI
let coupling = {
	a: {a: -1000, b: 1000, c: 50},
	b: {a: 1000, b: -1000, c: 50},
	c: {a: 50, b: 50, c: 250}
}

let	masses = {
	a: 10,
	b: 10,
	c: 10
}
let	charges = {
	a: 1,
	b: 1,
	c: 1		
}



function convertButtonValue(btnValue, values){
	return values[btnValue];
}

function convertValueToButton(value, values){
	return values.indexOf(value);
}




//Functions for calculating forces between things
//this will include the variable timestep stuff

function calculateDistance(particle, otherThing){
	let dX = 0;
	let dY = 0;
	if(otherThing.type == 'node'){
		dX = otherThing.CoM.x - particle.pos.x;
		dY = otherThing.CoM.y - particle.pos.y;
	} else {
		dX = otherThing.pos.x - particle.pos.x;
		dY = otherThing.pos.y - particle.pos.y;
	}

	/*if(isNaN(dX)){
	console.log('corrupted distances');
		console.log('particle: ' + particle.pos.x + ', otherThing: ' + otherThing.pos.x);
	console.log('species: ' + particle.species + ', otherThing type: ' + otherThing.type);
	if(otherThing.type == 'particle'){console.log('otherParticle species: ' + otherThing.species);}		
	}*/
	
	let d_sq = Math.pow(dX,2) + Math.pow(dY,2);
	
	let d_pack = [d_sq, dX, dY];
	return d_pack;
}


function calculateForce(particle, otherThing, dists){
	//need distance, and components
	let sp1 = particle.species;
	let sp2 = otherThing.species;
	let k = coupling[sp1][sp2];
	
	if(k != 0 && particle.charge != 0 && otherThing.charge != 0){
		if(!dists){dists = calculateDistance(particle, otherThing);}

		

		let q1 = particle.charge;
		let	q2 = otherThing.charge;
		let d = Math.sqrt(dists[0]);
		let F_mag = k*q1*q2/dists[0];
	
		let F = {
			x : F_mag*(dists[1]/d),
			y : F_mag*(dists[2]/d)
		}
		
		particle.acc.x += F.x/particle.mass;
		particle.acc.y += F.y/particle.mass;

		if(otherThing.type != 'node' && direct_calc){
			otherThing.acc.x -= F.x/otherThing.mass;
			otherThing.acc.y -= F.y/otherThing.mass;
		}
	}
}

function doForces(){  //this will be replaced by the BHA force calculations
	if(direct_calc){
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
		//TODO: go through each other species' lists
	} else
		
	if(bha_calc){
		for(let sp in particles){
			let thisList = particles[sp].list;
			if(thisList.length > 0){
				for(let i = 0, l = thisList.length; i < l; i++){
					let p = thisList[i];
					if(!p.dead){
						for(let ps in particles){
							let thisNodes = nodeList[ps];
							if(thisNodes.length > 1){
								buildInteractionList(p, thisNodes[thisNodes.length - 1]);
							} else if(thisNodes[thisNodes.length - 1].list.length == 1 && p.species != ps) {
								//calculate forces directly
								let p2 = thisNodes[thisNodes.length - 1].list[0];
								let dists = calculateDistance(p, p2);
								let pack = {thing: p2, dists: dists};
								p.interactionList.push(pack);
							}
						}
					}
				}
				for(let i = 0, l = particles[sp].list.length; i < l; i++){
					let p = particles[sp].list[i];
					if(!p.dead){
						for(let j = 0, s = p.interactionList.length; j < s; j++){
							if(p.interactionList[j].dists[0] > R_1_SQ){
								calculateForce(p, p.interactionList[j].thing, p.interactionList[j].dists);
							}
						}
					}
				}			
			}
		}		
	}
}


function buildInteractionList(particle, node){	//build list of nodes and other particles for a particle to interact with (BHA mode)
	if(coupling[particle.species][node.species] != 0){
		if(node.list.length > 0){
			if(!(node.list.length == 1 && node.list[0] == particle)){ //the case where the one thing in the node is the particle in question
				let dists = calculateDistance(particle, node);
				if((node.bounds.width*node.bounds.height)/dists[0] < S_D_THRESHOLD_SQ){ //if CoM of this node is 'far enough' away, add to interaction list
					//console.log('far enough away');
					let pack = {thing: node, dists: dists};
					particle.interactionList.push(pack);
				} else {
					//console.log('too close, going deeper..');
					//go to the next depth of nodes, and do the same thing...
					if(node.nodes){ //if there are deeper nodes...
						for(let i = 0, l = node.nodes.length; i < l; i++){
							buildInteractionList(particle, node.nodes[i]);
						}
					} else {
					//this node has no deeper nodes. there could be any number of particles here!
						let thisList = node.list;
						for(let i = 0, l = node.list.length; i < l; i++){
							//console.log('reached bottom of nodes');
							let p = node.list[i];
							if(p != particle){
								let dists = calculateDistance(particle, p);
								let pack = {thing: p, dists: dists};
								particle.interactionList.push(pack);
							}
						}
					}	
				}
			}
		}
	} 
};




//Functions for constructing the quadtree for each particle species


function calculateCoM(particleList){

	let l = particleList.length;
	let CoM = {x:0, y:0, m:0, q:0};

	let p = particleList[0];
	CoM.m = p.mass*l;
	CoM.q = p.charge*l;
	//calculate total mass (and charge, while we're at it)

	
	//centre of mass position = weighted sum of positions (average position of mass)
	//CoMx =    thisX*(thisMass/TotalMass)
	//CoMy = 	thisY*(thisMass/TotalMass)
	
	for(let i = 0; i < l; i++){
		let p = particleList[i];
		CoM.x += p.pos.x;
		CoM.y += p.pos.y;
	}
	
	CoM.x = CoM.x/l;
	CoM.y = CoM.y/l;
	
	return CoM;
}

function calculateBoundingBox(particleList){
	
	//find most extreme x and y positions in the particleList
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
	//just the one tree, actually
	
	nodeList[species] = []; //tidy this up later with a 'retire nodes' approach (avoid GC operations)
	
	let trunk = {
		visible: true,
		species: species,
		type: 'node',
		bounds: calculateBoundingBox(particles[species].list),	
		list: [],
		CoM: {x:0,y:0,m:0,q:0},
		charge: 0,
		depth: 0,
		sub_depth:0
	}
	
	//now cram each particle into the tree structure
	for(let i = 0, l = particles[species].list.length; i < l; i++){
		let p = particles[species].list[i];
		if(!p.dead){
			addParticle(particles[species].list[i], trunk);
		}	
	}
	
	nodeList[species].push(trunk);
}



function addParticle(p, node){
	//STEP 1. Is the particle inside the bounds of this node?
	if(isThisMyNode(p, node)){
		//add to the node's list of particles
		node.list.push(p); 
		//STEP 2. Will this particle be alone in the node?
		if(node.list.length == 1 || node.depth >= MAX_DEPTH){
			//we're done.
		} else if(node.list.length == 2){
			//great. now we gotta make some sub-nodes and try to put each of the existing particles in those too
			node.visible = false;
			let halfWidth = 0.5*node.bounds.width;
			let halfHeight = 0.5*node.bounds.height;
			node.nodes = [{}, {}, {}, {}];
			for(let i = 0, l = node.nodes.length; i < l; i++){
				let thisNode = node.nodes[i];
				thisNode.species = p.species;
				thisNode.visible = true;
				thisNode.type = 'node';
				thisNode.list = [];
				thisNode.depth = node.depth + 1;
				thisNode.sub_depth = i;
				switch(i){
					case 0:
						thisNode.bounds = {xMin:node.bounds.xMin, xMax: node.bounds.xMin + halfWidth, yMin:node.bounds.yMin, yMax: node.bounds.yMin + halfHeight};
						break;					
					case 1:
						thisNode.bounds = {xMin:node.bounds.xMin + halfWidth, xMax: node.bounds.xMax, yMin:node.bounds.yMin, yMax: node.bounds.yMin + halfHeight};
						break;
					case 2:
						thisNode.bounds = {xMin:node.bounds.xMin, xMax: node.bounds.xMin + halfWidth, yMin:node.bounds.yMin + halfHeight, yMax: node.bounds.yMax};
						break;					
					case 3:
						thisNode.bounds = {xMin:node.bounds.xMin + halfWidth, xMax: node.bounds.xMax, yMin:node.bounds.yMin + halfHeight, yMax: node.bounds.yMax};
						break;
					default:
						break;
				}
				thisNode.CoM = {x:0, y:0, q:0, m:0};
				thisNode.CoM.x = node.bounds.xMin + 0.5*node.bounds.width;
				thisNode.CoM.y = node.bounds.yMin + 0.5*node.bounds.height;		
				
				thisNode.bounds.width = thisNode.bounds.xMax - thisNode.bounds.xMin;
				thisNode.bounds.height = thisNode.bounds.yMax - thisNode.bounds.yMin;
				nodeList[p.species].push(thisNode);
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
		if(node.list.length > 0){
		node.CoM = calculateCoM(node.list);
		node.charge = node.CoM.q;
		}
	}
}


 



