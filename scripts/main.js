//main.js - main program code - may handle the BH quadtrees along with everything else

//establish canvas contexts and variables
const canvas0 = document.getElementById('canvas0');
const ctx0 = canvas0.getContext('2d');


//TESTING TESTING
for(let i = 0; i < 100; i++){
	ctx0.strokeStyle = 'rgb(255,255,230)';
	ctx0.moveTo(Math.round(800*Math.random()),Math.round(800*Math.random()));
	ctx0.lineTo(Math.round(800*Math.random()),Math.round(800*Math.random()));
	ctx0.stroke();
}
//TESTING OVER
	
	
	
//modify a value if it exceeds limits
function constrain(n, min, max){
	if(n > max){n = max;} else if(n < min){n = min;}
	return n;	
}