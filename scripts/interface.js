//Interface.js: mainly for switching out the various icons on buttons

//1 - 10 - 100
//play - pause
//coupling strengths (5 levels of attraction/repulsion + 0)	

const SPAWN_ICONS = ['1️⃣','🔟','💯'];
const PLAY_ICONS = ['⏸️','▶️'];
const COUPLING_ICONS = ['🐸','🐵','🐔','🐨','🐲'];



//TODO:initialise button states

//Add event listeners
let couplingGrid = document.getElementsByClassName('coupling-grid')[0];
console.log(couplingGrid);
couplingGrid.addEventListener('click', function(){handleCouplingClicks(event)});

function handleCouplingClicks(event){
	console.log(event);
	let t = event.target;
	if(t.classList.contains('coupling-button') && !t.disabled){
		//grab all buttons of same class (e.g. bc, or ac)
		//update their values together
		let linkedButtons = couplingGrid.getElementsByClassName(t.classList[t.classList.length - 1]);
		for(let i = 0, l = linkedButtons.length; i < l; i++){
			cycleIcon(linkedButtons[i], COUPLING_ICONS);
		}
	}
}




function setButtonState(btn, icon_array, value){
	value = parseInt(value);
	value = constrain(value, 0, icon_array.length - 1);
	btn.innerHTML = icon_array[value];
}





function changeSpawnQuantity(){
	//TODO:change number of particles to be spawned/despawned
	
	//change appearance of button
	cycleIcon(document.getElementById('btn_spawnQuantity'), SPAWN_ICONS);
	
}

function playPause(){
	//TODO: suspend animation
	
	//change appearance of button
	cycleIcon(document.getElementById('btn_playPause'), PLAY_ICONS);
	
}


function cycleIcon(btn, icon_array){
	btn.value = (parseInt(btn.value) + 1)%icon_array.length;
	btn.innerHTML = icon_array[btn.value];
}


