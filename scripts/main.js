//main.js - main program code - may handle the BH quadtrees along with everything else


//globals

const PARTICLE_SIZE = 10; //default particle size in pixels
const TRI_HEIGHT_FACTOR = Math.sqrt(3)/2;
const COLOUR_A = 'rgb(255,0,255)';
const COLOUR_B = 'rgb(255,180,100)';
const COLOUR_C = 'rgb(0,255,255)';


//establish canvas contexts and variables
const canvas0 = document.getElementById('canvas0');
const ctx0 = canvas0.getContext('2d');

const height = canvas0.height;
const width = canvas0.width;

	
	
	
//modify a value if it exceeds limits
function constrain(n, min, max){
	if(n > max){n = max;} else if(n < min){n = min;}
	return n;	
}


const Particle = function(pos_x, pos_y, vel_x, vel_y) {
	this.pos = {};
	this.vel = {};
    	this.pos.x = pos_x;
    	this.pos.y = pos_y;
    	this.vel.x = vel_x;
    	this.vel.y = vel_y;
   	this.walls = true;
    	let dice = Math.random();
    	if(dice < 0.4){this.tri = true;}
	if(dice > 0.8){this.square = true;}
	if(this.square) {
		this.size = this.size/Math.sqrt(2);
		this.render = this.render_c;
	} else if(this.tri) {
		this.render = this.render_a;
	} else {
		this.render = this.render_b;
	}
	
	
    return this;
};


//particle prototype



Particle.prototype = {
	mass: 1, //reset according to particle type and settings in 'physical properties'
	charge: 1, //reset according to particle type and settings in 'physical properties'
 	size: PARTICLE_SIZE,  //pixel dimensions of particle
	label: "",	
	colour: "rgb(255,255,255)",
	interactList: [],
	ang:0, //rotation angle, degrees
	rot:2, //rotation speed, degrees/frame
	
	render_a: function(ctx) {  //triangle particles
        	ctx.fillStyle = COLOUR_A;
		ctx.strokeStyle = COLOUR_A;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.save();
		let triHeight = Math.round(this.size*TRI_HEIGHT_FACTOR); //find a way to do this only once (when particle is initialised)
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(2*Math.PI*(this.ang)/360);
		ctx.moveTo(-0.5*this.size, (1/3)*triHeight);
		ctx.lineTo(0,(-2/3)*triHeight);
		ctx.lineTo(0.5*this.size, (1/3)*triHeight);
		ctx.lineTo(-0.5*this.size, (1/3)*triHeight);
		ctx.fill();

		//ctx.stroke();
		ctx.restore();
	},
	
	render_b: function(ctx) {  //circle particles
        	ctx.fillStyle = COLOUR_B;
		ctx.strokeStyle = COLOUR_B;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(this.pos.x,this.pos.y,0.5*this.size,0,2*Math.PI);
		ctx.fill();
		//ctx.stroke();
	},
		
	render_c: function(ctx) {  //diamond particles
        ctx.fillStyle= COLOUR_C;
		ctx.strokeStyle = COLOUR_C;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(2*Math.PI*(this.ang + 45)/360);
		ctx.rect(-0.5*this.size, -0.5*this.size, this.size, this.size);
		ctx.fill();
		//ctx.stroke();
		ctx.restore();
	},
	

	
	update: function(pos, vel) {
		this.pos.x = this.pos.x  + this.vel.x ;
		this.pos.y = this.pos.y + this.vel.y; 
		
		if(this.square || this.tri){
		this.ang = (this.ang + this.rot)%360;
		}
		
		if(this.walls){
			if((this.vel.x  > 0 && this.pos.x  > width) || (this.vel.x  < 0 && this.pos.x < 0)){
				this.vel.x  = -1*this.vel.x ;
			}
			if((this.vel.y > 0 && this.pos.y  > height) || (this.vel.y  < 0 && this.pos.y < 0)){
				this.vel.y = -1*this.vel.y;
			}
		}
		this.interactList = [];
	}
};



let particles = [];
console.log(particles);
drawWorld();
console.log(particles);
function drawWorld(){
	ctx0.clearRect(0,0,width,height);
	if(particles.length < 1000){
		let p = new Particle(400,400, 5*Math.random() - 2.5, 5*Math.random() - 2.5);
		p.rot = 2*Math.random() - 4;
		particles.push(p);
		console.log('still going')
	}
	
	for(let i = 0, l = particles.length; i<l; i++){
		particles[i].update();
		particles[i].vel.y += 0.05;
	}
	
	for(let i = 0, l = particles.length; i<l; i++){
		particles[i].render(ctx0);
	}
	
	requestAnimationFrame(drawWorld);

}