//Interface.js: mainly for switching out the various icons on buttons

//1 - 10 - 100
//play - pause
//coupling strengths (5 levels of attraction/repulsion + 0)	

const SPAWN_ICONS = ['1','🔟','💯'];
const PLAY_ICONS = ['⏸️','▶️'];
const COUPLING_ICONS = ['🐸','🐵','🐔','🐨','🐲'];



//Initialise button states (so they don't need to be specified in HTML

function initialiseButtonStates(){
	//setButtonState(btn, icon_array, value);
	setButtonState(document.getElementById('btn_spawnQuantity'), SPAWN_ICONS, 1);
	setButtonState(document.getElementById('btn_playPause'), PLAY_ICONS, 0);
}

initialiseButtonStates();


//Add event listeners

let couplingGrid = document.getElementsByClassName('coupling-grid')[0];
couplingGrid.addEventListener('click', function(){handleCouplingClicks(event)});

let propertiesGrid = document.getElementsByClassName('properties-grid')[0];
propertiesGrid.addEventListener('click', function(){handlePropertiesClicks(event)});


let viewport = document.getElementsByClassName('viewport')[0];
viewport.addEventListener('click', function(event){
	let t = event.target;
	if(t.classList.contains('modal')){
		toggleDisplay(t);
		event.stopPropagation();
	}
});

let controls = document.getElementsByClassName('controls')[0];
controls.addEventListener('click', function(event){
	let t = event.target;
	if(t.tagName == 'BUTTON'){
		switch(t.id){
			case 'btn_spawnQuantity':
				changeSpawnQuantity();
				break;
			
			case 'btn_playPause':
				playPause();
				break;
				
			case 'btn_coupling':
				toggleDisplay(document.getElementsByClassName('coupling')[0]);
				break;
			
			default:
				console.log(t.id + ' not wired yet!');
				break;
			
		}
	}
	event.stopPropagation();
});

function handleCouplingClicks(event){
	let t = event.target;
	if(t.tagName == 'BUTTON' && !t.disabled){
		//grab all buttons of same class (e.g. bc, or ac)
		//update their values together
		let linkedButtons = couplingGrid.getElementsByClassName(t.classList[t.classList.length - 1]);
		for(let i = 0, l = linkedButtons.length; i < l; i++){
			cycleIcon(linkedButtons[i], COUPLING_ICONS);
		}
	}
}

function handlePropertiesClicks(event){
	let t = event.target;
	if(t.tagName == 'BUTTON' && !t.disabled){
		cycleIcon(t, COUPLING_ICONS);
	}
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

function setButtonState(btn, icon_array, value){
	value = parseInt(value);
	value = constrain(value, 0, icon_array.length - 1);
	btn.value = value;
	btn.innerHTML = icon_array[value];
}

function toggleDisplay(elm){
	elm.classList.toggle('show');
}

//TODO - function to 'apply' state of coupling array (store 'old' state)
//TODO - somehow alert to the user that they must click 'apply' to save changes to physical properties/other settings
