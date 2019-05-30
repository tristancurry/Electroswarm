//main.js - main program code - may handle the BH quadtrees along with everything else


//globals

const PARTICLE_SIZE = 5; //default particle size in pixels
const TRI_HEIGHT_FACTOR = Math.sqrt(3)/2;
const SQU_SIZE_FACTOR = 	Math.sqrt(0.5);
const COLOUR_A = 'rgb(255,0,255)';
const COLOUR_B = 'rgb(255,180,100)';
const COLOUR_C = 'rgb(0,255,255)';

//establish canvas contexts and variables
const canvas0 = document.getElementById('canvas0');
const ctx0 = canvas0.getContext('2d');


const height = canvas0.height;
const width = canvas0.width;


const canvas_a = document.createElement('canvas');
const ctx_a = canvas_a.getContext('2d');
canvas_a.width = canvas0.width;
canvas_a.height = canvas0.height;

const canvas_b = document.createElement('canvas');
const ctx_b = canvas_b.getContext('2d');
canvas_b.width = canvas0.width;
canvas_b.height = canvas0.height;

const canvas_c = document.createElement('canvas');
const ctx_c = canvas_c.getContext('2d');
canvas_c.width = canvas0.width;
canvas_c.height = canvas0.height;



let nextSelectedSpecies = 'b';
let selectedSpecies = 'b';

let spawnQuantity = 1;

let particles = {
	a: {
		list: [],
		dead: false,
		ctx: ctx_a
	},
	b: {
		list: [],
		dead: false,
		ctx: ctx_b
	},
	c: {
		list: [],
		dead: false,
		ctx: ctx_c
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
	this.pos = {};
	this.vel = {};
    	this.pos.x = pos_x;
    	this.pos.y = pos_y;
    	this.vel.x = vel_x;
    	this.vel.y = vel_y;
	this.rot = 2*Math.random() - 4;
	this.ang = 0;
   	this.walls = true;
	this.species = species;
	this.dead = false;
	
	if(this.species == 'all' || !species){
		let dice = Math.ceil(6*Math.random());
		if(dice < 3){
			this.species = 'a';
		} else if (dice < 5) {
			this.species = 'b';
		} else {
			this.species = 'c';
		}
		
	}
	
	switch(this.species){
		case 'a':
			this.render = this.render_a;
			break;
		case 'b':
			this.render = this.render_b;
			break;
		case 'c':
			this.render = this.render_c;
			break;
		default:
			this.species = 'b';
			this.render = this.render_b;
			break;
		}	
    return this;
};


function createParticle(particles_obj){
	let p = new Particle(selectedSpecies, canvas0.width/2 , canvas0.height/2, 5*Math.random() - 2.5, 5*Math.random() - 2.5);
	
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
	
	//TODO: generate particles with some scatter from the spawn point, to avoid big accelerations
}

function createParticles(n, particles_obj){
	for(let i = 0; i < n; i++){
			if(!particles_obj){
				let dice = Math.ceil(6*Math.random());
				if(dice < 3){
					particles_obj = particles['a'];
				} else if (dice < 5) {
					particles_obj = particles['b'];
				} else {
					particles_obj = particles['c'];
				}
		
		}
		createParticle(particles_obj);
	}
}


function killAllParticles(){
	for(let sp in particles){
		for(let i = 0, l = particles[sp].list.length; i < l; i++){
			particles[sp].list[i].dead = true;
		}
	}
}

//particle prototype



Particle.prototype = {
	mass: 1, //reset according to particle type and settings in 'physical properties'
	charge: 1, //reset according to particle type and settings in 'physical properties'
 	size: PARTICLE_SIZE,  //pixel dimensions of particle
	label: "",	
	colour: "rgb(255,255,255)",
	interactList: [],
	
	render_a: function(ctx) {  //triangle particles
		ctx.save();
        	ctx.fillStyle = COLOUR_A;
		ctx.strokeStyle = COLOUR_A;
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
	
	render_b: function(ctx) {  //circle particles
		ctx.save();
        	ctx.fillStyle = COLOUR_B;
		ctx.strokeStyle = COLOUR_B;
		ctx.lineWidth = 3;
		ctx.translate(this.pos.x, this.pos.y)
		ctx.beginPath();
		ctx.arc(0,0,0.5*this.size,0,2*Math.PI);
		ctx.fill();
		ctx.restore();
	},
		
	render_c: function(ctx) {//diamond particles
		ctx.save();
        	ctx.fillStyle= COLOUR_C;
		ctx.strokeStyle = COLOUR_C;
		ctx.lineWidth = 3;
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(2*Math.PI*(this.ang + 45)/360);
		ctx.beginPath();
		ctx.rect(-0.5*SQU_SIZE_FACTOR*this.size, -0.5*SQU_SIZE_FACTOR*this.size, SQU_SIZE_FACTOR*this.size, SQU_SIZE_FACTOR*this.size);
		ctx.fill();
		//ctx.stroke();
		ctx.restore();
	},
	
	
	

	
	update: function(pos, vel) {
		this.pos.x = this.pos.x  + this.vel.x ;
		this.pos.y = this.pos.y + this.vel.y; 
		
		if(this.species == 'a' || this.species == 'c'){
		this.ang = (this.ang + this.rot)%360;
		}
		
		if(this.walls){
			if((this.vel.x  > 0 && this.pos.x  > width) || (this.vel.x  < 0 && this.pos.x < 0)){
				this.vel.x  = -1*this.vel.x ;
				if(this.pos.x > width){this.pos.x = width;} else {this.pos.x = 0;}
			}
			if((this.vel.y > 0 && this.pos.y  > height) || (this.vel.y  < 0 && this.pos.y < 0)){
				this.vel.y = -1*this.vel.y;
				if(this.pos.y > height){this.pos.y = height;} else {this.pos.y = 0;}
			}
		}
		this.interactList = [];
	}
};




let lastLoop = new Date();
let n = 0;
let parts_live = 0;
drawWorld();
function drawWorld(){
	parts_live = 0;
	selectedSpecies = nextSelectedSpecies;
	ctx0.clearRect(0,0,width,height);
	
	//cycle through each of the particle lists
	//and update positions
	for(let sp in particles){
		for(let i = 0, l = particles[sp].list.length; i < l; i++){
			let p = particles[sp].list[i];
			if(!p.dead){
				parts_live++;
				p.update();
				p.vel.y += 0.05;
			} else {
				particles[sp].dead = true;
			}
			
		}
	}
	
	
	//cycle through each of the particle list
	//and render the particles
	for(let sp in particles){
		particles[sp].ctx.clearRect(0,0,width,height);
		for(let i = 0, l = particles[sp].list.length; i < l; i++){
			let p = particles[sp].list[i];
			if(!p.dead){
				p.render(particles[sp].ctx);
			}
		}
	}

	
	ctx0.drawImage(canvas_a, 0, 0);
	ctx0.drawImage(canvas_b, 0, 0);
	ctx0.drawImage(canvas_c, 0, 0);

	
	
	
	let thisLoop = new Date();
	n = (n + 1)%60;
	if(n == 0){
		let fps = Math.round(1000/(thisLoop - lastLoop));
		debugBox.innerHTML = 'FPS: ' + fps +'<br>N(live): ' + parts_live + '<br>N(all): '+ (particles['a'].list.length + particles['b'].list.length + particles['c'].list.length);
	}
	lastLoop = thisLoop;
	requestAnimationFrame(drawWorld);

}