//main.js - main program code - may handle the BH quadtrees along with everything else


//modify a value if it exceeds limits
function constrain(n, min, max){
	if(n > max){n = max;} else if(n < min){n = min;}
	return n;	
}