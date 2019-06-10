//main.js - main program code - may handle the BH quadtrees along with everything else


//globals

const PARTICLE_SIZE = 5; //default particle size in pixels
const TRI_HEIGHT_FACTOR = Math.sqrt(3)/2;
const SQU_SIZE_FACTOR = 1;

const COLOURS = {
	a: 'rgb(255,0,255)',
	b: 'rgb(255,255,0)',
	c: 'rgb(0,255,255)'	
}

const COLOUR_A = 'rgb(255,0,255)';
const COLOUR_B = 'rgb(255,255,0)';
const COLOUR_C = 'rgb(0,255,255)';

const WALL_DAMPING = 0.5;

let WALLS = true;

let showCoM = {a:true, b:true, c:true, g:true};
let FOLLOW_COM = true;

let paused = false;

let nextSelectedSpecies = 'b';
let selectedSpecies = 'b';

let spawnQuantity = 1;

let showParticles = {a:true, b:true, c:true};
let showTree = {a:true, b:true, c:true};
let simpleRender = true;
let showBounding = false;
let newMass = {a: false, b: false, c:false};
let newCharge = {a: false, b: false, c:false};




//establish canvas contexts and variables
const canvas0 = document.getElementById('canvas0');
const ctx0 = canvas0.getContext('2d');
//ctx0.globalCompositeOperation = 'screen';

const height = canvas0.height;
const width = canvas0.width;


const canvas_a = document.createElement('canvas');
const ctx_a = canvas_a.getContext('2d' , {alpha: false});
canvas_a.width = canvas0.width;
canvas_a.height = canvas0.height;

const canvas_b = document.createElement('canvas');
const ctx_b = canvas_b.getContext('2d', {alpha: false});
canvas_b.width = canvas0.width;
canvas_b.height = canvas0.height;

const canvas_c = document.createElement('canvas');
const ctx_c = canvas_c.getContext('2d', {alpha: false});
canvas_c.width = canvas0.width;
canvas_c.height = canvas0.height;

const canvas_bha = document.createElement('canvas');
const ctx_bha = canvas_bha.getContext('2d', {alpha: false});
canvas_bha.width = canvas0.width;
canvas_bha.height = canvas0.height;

const canvas_bhb = document.createElement('canvas');
const ctx_bhb = canvas_bhb.getContext('2d', {alpha: false});
canvas_bhb.width = canvas0.width;
canvas_bhb.height = canvas0.height;

const canvas_bhc = document.createElement('canvas');
const ctx_bhc = canvas_bhc.getContext('2d', {alpha: false});
canvas_bhc.width = canvas0.width;
canvas_bhc.height = canvas0.height;

const canvas_p = document.createElement('canvas');
const ctx_p = canvas_p.getContext('2d', {alpha:false});
ctx0.imageSmoothingEnabled = false;
canvas_p.width = 128;
canvas_p.height = 128;

let particles = {
	a: {
		species: 'a',
		list: [],
		dead: false,
		ctx: ctx_a,
		ctx_bh: ctx_bha
	},
	b: {
		species: 'b',
		list: [],
		dead: false,
		ctx: ctx_b,
		ctx_bh: ctx_bhb
	},
	c: {
		species: 'c',
		list: [],
		dead: false,
		ctx: ctx_c,
		ctx_bh: ctx_bhc
	}
};



let deadParticles = false;
let deadParticles_a = false;
let deadParticles_b = false;
let deadParticles_c = false;



	
	
	
//modify a value if it exceeds limits
function constrain(n, min, max){
	if(n > max){n = max;} else if(n < min){n = min;}
	return n;	
}


const Particle = function(species, pos_x, pos_y, vel_x, vel_y) {
	this.species = species;
	this.pos = {x: pos_x, y: pos_y};
    this.vel = {x: vel_x, y: vel_y};
	this.acc = {x: 0, y: 0};
	this.rot = 2*Math.random() - 4;
	this.ang = 0;
	this.dead = false;
	this.interactionList = [];
	this.mass = masses[species];
	this.charge = charges[species];
    return this;
};


function createParticle(particles_obj){
	let spreadX = 200;
	let randX = 2*spreadX*Math.random() - spreadX;
	let spreadY = Math.sqrt(spreadX*spreadX - randX*randX);
	let randY = 2*spreadY*Math.random() - spreadY;
	let k = coupling[particles_obj.species][particles_obj.species];
	let r = Math.sqrt(randX*randX  + randY*randY);
	let vel = (10*k*spawnQuantity/r)/60;
	let velX = -(randY/r)*vel;
	let velY = (randX/r)*vel
	let p = new Particle(particles_obj.species, globalCoM.x + randX , globalCoM.y + randY, velX, velY);
	
	if(particles_obj.dead){
	//Make use of 'dead' particles in particle list first, rather than always adding new ones
	//search particle list for particles that are 'dead'
	let found = false;
	for(let i = 0, l = particles_obj.list.length; i < l; i++){
		let thisParticle = particles_obj.list[i];
		if(thisParticle.dead){
			particles_obj.list[i] = p;
			found = true;
			break;
		}
	}
	//if there were no holes found in the particle list, push the new one to the list
	if(!found){particles_obj.list.push(p);}
	} else {
		particles_obj.list.push(p);
	}
	

}


function createParticles(n, particles_obj){
	let p_o = null;
	for(let i = 0; i < n; i++){
		if(!particles_obj){
			let dice = Math.ceil(6*Math.random());
				if(dice < 3){
					p_o = particles.a;
				} else if (dice < 5) {
					p_o = particles.b;
				} else {
					p_o = particles.c;
				}
		
		} else {
			p_o = particles_obj
		}
		createParticle(p_o);
	}
}


function killAllParticles(){
	for(let sp in particles){
		for(let i = 0, l = particles[sp].list.length; i < l; i++){
			particles[sp].list[i].dead = true;
		}
	}
}

function killParticles(n, species){
	//get the list of particles to kill from
	//assemble a list of all of the still-living particles
	//constrain n to the length of that list
	//kill those particles
	if(n > 0){
		let theDoomed = [];
		if(species != 'all'){
			let particlesList = particles[species].list;

			//go through list and collect living particles
			for(let i = 0, l = particlesList.length; i < l; i++){
				if(!particlesList[i].dead){
					theDoomed.push(particlesList[i]);
				}
			}
			
			//then constrain the value of n
			n = constrain(n, 0, theDoomed.length);
			if(n > 0) {
				for(let i = 0; i < n; i++){
					theDoomed[i].dead = true;
				}
			}
	
		} else {
		//if the particle selector is set to all, remove particles proportionately
		//work out how many are living in each species' list
		//work out how many are living in total
	
			let theLiving = {};
			let theLivingN = 0;
			
			for(let sp in particles){
				theLiving[sp] = 0;
				for(let i = 0, l = particles[sp].list.length; i < l; i++){
					if(!particles[sp].list[i].dead){theLiving[sp]++;}
				}
				theLivingN += theLiving[sp];
			}
			
			n = constrain(n, 0, theLivingN);

			//calculate the proportion of the living each particle type represents
			//Multiply this by the number of particles we're killing, then round to get integer values 
			let N = {}
			
			for(sp in particles){
				if(theLivingN > 0){
					N[sp] = Math.round(n*theLiving[sp]/theLivingN);
				} else {
					N[sp] = 0;
				}
			}
			//sometimes, due to rounding, 1 less particle than those available to be killed is killed
			//fix this by killing one extra particle, if there are particles to be killed
			let calcN = 0;
			for(let sp in N){
				calcN += N[sp];
			}
			
			//this will disadvantage species 'a' just a little, but equity is a little more cumbersome to implement (-:
			if(calcN < n){
				for(let sp in N){
					if(theLiving[sp] > N[sp]){
						N[sp]++;
						break;
					}
				}
			} else if(calcN > n){ //the reverse also happens sometimes! In this kill one less than calculated.
				for(let sp in N){
					if(theLiving[sp] > 0){
						N[sp]--;
						break;
					}
				}	
			}
			
			//for each species, kill the calculated number of particles
			for(let sp in theLiving){
				if(N[sp] > 0){killParticles(N[sp], sp);}
			}	
		}	
	}
}


//particle prototype



Particle.prototype = {
 	size: PARTICLE_SIZE,  //pixel dimensions of particle
	type: 'particle',
	label: "",	
	colour: "rgb(255,255,255)",



	render_a: function(ctx) {  //triangle particles
		ctx.save();
		ctx.lineWidth = 3;
		let triHeight = Math.round(this.size*TRI_HEIGHT_FACTOR); //find a way to do this only once (when particle is initialised)
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(2*Math.PI*(this.ang)/360);
		ctx.beginPath();
		ctx.moveTo(-0.5*this.size, (1/3)*triHeight);
		ctx.lineTo(0,(-2/3)*triHeight);
		ctx.lineTo(0.5*this.size, (1/3)*triHeight);
		ctx.lineTo(-0.5*this.size, (1/3)*triHeight);
		ctx.fill();
		//ctx.stroke();
		ctx.restore();
	},
	
	render: function(ctx) {
		ctx.save();
		ctx.lineWidth = 3;
		ctx.translate(this.pos.x, this.pos.y);
		switch(this.species){
			case 'a':
				ctx.beginPath();
				ctx.arc(0,0,0.5*this.size,0,2*Math.PI);
				break;
			
			case 'b':
				ctx.beginPath();
				ctx.arc(0,0,0.5*this.size,0,2*Math.PI);
				break;
				
			case 'c':
				ctx.rotate(2*Math.PI*(this.ang + 45)/360);
				ctx.beginPath();
				ctx.rect(-0.5*SQU_SIZE_FACTOR*this.size, -0.5*SQU_SIZE_FACTOR*this.size, SQU_SIZE_FACTOR*this.size, SQU_SIZE_FACTOR*this.size);
				break;
				
			default:
				ctx.beginPath();
				ctx.arc(0,0,0.5*this.size,0,2*Math.PI);
				break;
		}
		ctx.fill();
		ctx.restore();
	},
		


	
	render_simple: function(ctx) {//most basic shape
		ctx.save();
		ctx.lineWidth = 3;
		ctx.translate(this.pos.x, this.pos.y);
		ctx.beginPath();
		ctx.rect(-0.5*this.size, -0.5*this.size, this.size, this.size);
		ctx.fill();
		ctx.restore();
	},
	

	
	update: function(pos, vel) {
		this.pos.x = this.pos.x + this.vel.x ;
		this.pos.y = this.pos.y + this.vel.y; 
		this.vel.x = this.vel.x + this.acc.x;
		this.vel.y = this.vel.y + this.acc.y;
		this.acc.x = 0;
		this.acc.y = 0;
		
		if(this.species == 'a' || this.species == 'c'){
		this.ang = (this.ang + this.rot)%360;
		}
		
		if(WALLS){
			if((this.vel.x  > 0 && this.pos.x  > width) || (this.vel.x  < 0 && this.pos.x < 0)){
				this.vel.x  = -1*WALL_DAMPING*this.vel.x ;
				if(this.pos.x > width){this.pos.x = width;} else {this.pos.x = 0;}
			}
			if((this.vel.y > 0 && this.pos.y  > height) || (this.vel.y  < 0 && this.pos.y < 0)){
				this.vel.y = -1*WALL_DAMPING*this.vel.y;
				if(this.pos.y > height){this.pos.y = height;} else {this.pos.y = 0;}
			}
		}
		this.interactionList = [];
	}
};




let lastLoop = new Date();
let n = 0;
let parts_live = 0;
for(let sp in particles){
		particles[sp].ctx.strokeStyle = COLOURS[sp];
		particles[sp].ctx.fillStyle = COLOURS[sp];
		particles[sp].ctx_bh.strokeStyle = COLOURS[sp];
		particles[sp].ctx_bh.fillStyle = COLOURS[sp];
}
let globalCoM = {x:width/2, y:height/2, m:0, q:0};

drawWorld();


ctx0.fillStyle = 'rgba(0, 0, 0, 0.1)';

function drawWorld(){
					ctx_p.clearRect(0,0,canvas_p.width, canvas_p.height);
	globalCoM = {x: 0, y: 0, m: 0, q:0};
	parts_live = 0;
	selectedSpecies = nextSelectedSpecies;

	
	//cycle through each of the particle lists
	//and update positions
	if(!paused){

		//if properties have changed, update all particle masses
		for(let sp in particles){
			if(newMass[sp] || newCharge[sp]){
				for(let i = 0, l = particles[sp].list.length; i < l; i++){
					let p = particles[sp].list[i];
					p.charge = charges[sp];
					p.mass = masses[sp];
				}
				newMass[sp] = false;
				newCharge[sp] = false;
			}
		}
		
		//if using Barnes-Hut algorithm, build the quadtrees
		if(bha_calc){
			for(let sp in particles){
				buildTree(sp);
			}
		}
		
		doForces();
		
		for(let sp in particles){			
			for(let i = 0, l = particles[sp].list.length; i < l; i++){
				let p = particles[sp].list[i];
				if(!p.dead){
					parts_live++;
					p.update();
					//p.vel.y += 0.05;
				} else {
					particles[sp].dead = true;
				}
				
			}
			
			calculateFields(sp);
			
			if(nodeList[sp].length > 0 && nodeList[sp][nodeList[sp].length - 1].CoM.m > 0){
				let thisCoM = nodeList[sp][nodeList[sp].length - 1].CoM;
				globalCoM.x += thisCoM.m*thisCoM.x;
				globalCoM.y += thisCoM.m*thisCoM.y;
				globalCoM.m += thisCoM.m;
				globalCoM.q += thisCoM.q;
			}

		}

		if(globalCoM.m > 0){
			globalCoM.x = globalCoM.x/globalCoM.m;
			globalCoM.y = globalCoM.y/globalCoM.m;
		} else {
			globalCoM = {x: 0.5*width, y: 0.5*height, m: 0, q:0};
		}
			
	}
	
	//cycle through each of the particle list
	//and render the particles

	for(let sp in particles){
		particles[sp].ctx.clearRect(0,0,width,height);
		particles[sp].ctx_bh.clearRect(0,0,width,height);

		particles[sp].ctx.save();
		particles[sp].ctx_bh.save();
		particles[sp].ctx.translate(-1*globalCoM.x + 0.5*width, -1*globalCoM.y + 0.5*height);
		particles[sp].ctx_bh.translate(-1*globalCoM.x + 0.5*width, -1*globalCoM.y + 0.5*height);
		
		if(particles[sp].list.length > 1 && showBounding){
			let box = calculateBoundingBox(particles[sp].list);
			particles[sp].ctx.beginPath();
			particles[sp].ctx.rect(box.xMin, box.yMin, box.width, box.height);
			particles[sp].ctx.stroke();

		}
		
		if(showTree[sp] && bha_calc){
			for(let i = 0, l = nodeList[sp].length; i < l; i++){
				let thisNode = nodeList[sp][i];
				if(thisNode.visible){
					particles[sp].ctx_bh.beginPath();
					particles[sp].ctx_bh.globalAlpha = (thisNode.depth + thisNode.sub_depth/4)/MAX_DEPTH;
					particles[sp].ctx_bh.rect(thisNode.bounds.xMin, thisNode.bounds.yMin, thisNode.bounds.width, thisNode.bounds.height);
					particles[sp].ctx_bh.fill();
				}
			}		
		}
		

		
		
		if(showParticles[sp]){
			for(let i = 0, l = particles[sp].list.length; i < l; i++){
				let p = particles[sp].list[i];
				if(!p.dead){
					if(simpleRender){
						p.render_simple(particles[sp].ctx);
					} else {
						p.render(particles[sp].ctx);
					}
				}
			}
		}
		
		if(showCoM[sp] && nodeList[sp].length > 0 && nodeList[sp][nodeList[sp].length - 1].CoM.m > 0){
			particles[sp].ctx_bh.beginPath();
			let thisCoM = nodeList[sp][nodeList[sp].length - 1].CoM;
			particles[sp].ctx_bh.arc(thisCoM.x,thisCoM.y,20,0,2*Math.PI);
			particles[sp].ctx_bh.globalAlpha = 1;
			particles[sp].ctx_bh.stroke();
		}
		
				particles[sp].ctx.restore();
		particles[sp].ctx_bh.restore();
	
	} 	

	ctx0.clearRect(0,0,width,height);

	
	



	
	
	ctx0.globalCompositeOperation = 'multiply';
	ctx0.drawImage(canvas_bha, 0, 0);
	ctx0.drawImage(canvas_bhb, 0, 0);
	ctx0.drawImage(canvas_bhc, 0, 0);
	
	ctx0.globalCompositeOperation = 'screen';
	ctx0.drawImage(canvas_a, 0, 0);
	ctx0.drawImage(canvas_b, 0, 0);
	ctx0.drawImage(canvas_c, 0, 0);

	ctx0.globalCompositeOperation = 'source-over';

	ctx0.drawImage(canvas_p, 0, 0, width, height);

	ctx0.save();
	ctx0.translate(-1*globalCoM.x + 0.5*width, -1*globalCoM.y + 0.5*height);
	ctx0.strokeStyle = 'rgb(255,255,255)';
	
	ctx0.beginPath();
	ctx0.lineWidth = 2;
	ctx0.arc(globalCoM.x,globalCoM.y,35,0,2*Math.PI);
	ctx0.stroke();
		if(WALLS){
		ctx0.strokeStyle = 'rgb(255,255,255)';
		ctx0.lineWidth = 10;
		ctx0.beginPath();
		ctx0.rect(0,0,width, height);
		ctx0.stroke();
	}
	ctx0.restore();


		
	let thisLoop = new Date();
	n = (n + 1)%60;
	if(n == 0){
		let fps = Math.round(1000/(thisLoop - lastLoop));
		debugBox.innerHTML = 'FPS: ' + fps +'<br>N(live): ' + parts_live + '<br>N(all): '+ (particles['a'].list.length + particles['b'].list.length + particles['c'].list.length);
	}
	lastLoop = thisLoop;
	requestAnimationFrame(drawWorld);

}