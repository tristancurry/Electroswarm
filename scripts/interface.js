//Interface.js: mainly for switching out the various icons on buttons

//centre of mass displays: should have an OVERALL CoM, with CoM for each species 'attached' to it
//visibility of particles, quadtrees etc should be settable for each species
//coupling strengths (5 levels of attraction/repulsion + 0)	

const SPAWN_ICONS = ['1','🔟','💯'];
const PLAY_ICONS = ['⏸️','▶️'];
const COUPLING_ICONS = ['🐸','🐵','🐔','🐨','🐲','🦄','🦊','🐹','🐻','🐟','🐌'];
const CHARGE_ICONS = ['🐸','🐵','🐔','🐨','🐲','🦄','🦊','🐹','🐻'];
const MASS_ICONS = ['🐵','🐔','🐨','🐲','🦄','🦊','🐹','🐻'];

const debugBox = document.getElementsByClassName('debug')[0];

//Initialise button states (so they don't need to be specified in HTML



function initialiseButtonStates(){
	//setButtonState(btn, icon_array, value);
	setButtonState(document.getElementById('btn_spawnQuantity'), SPAWN_ICONS, 0);
	setButtonState(document.getElementById('btn_playPause'), PLAY_ICONS, 0);
	
	switchParticleType(document.getElementById('btn_b'));
	
}

initialiseButtonStates();


//Add event listeners

let couplingGrid = document.getElementsByClassName('coupling-grid')[0];
couplingGrid.addEventListener('click', function(){handleCouplingClicks(event)});

let propertiesGrid = document.getElementsByClassName('properties-grid')[0];
propertiesGrid.addEventListener('click', function(){handlePropertiesClicks(event)});

let viewOptions = document.getElementsByClassName('viewoptions')[0];
viewOptions.addEventListener('click', function(){handleViewOptionsClicks(event)});

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

			
			case 'btn_playPause':
				playPause();
				break;
				
			case 'btn_reset':
				killAllParticles();
				break;
				
			case 'btn_coupling':
				toggleDisplay(document.getElementsByClassName('coupling')[0]);
				break;
				
			case 'btn_fields':
				if(!showFields['a'] && !showFields['b'] && !showFields['c']){
					showFields['a'] = true;
				} else {
					for (let sp in particles){
						if(showFields[sp] == true){
							showFields[sp] = false;
							if(sp == 'a'){showFields['b'] = true;}
							if(sp == 'b'){showFields['c'] = true;}
							break;
						}
					}
				}
				console.log(showFields);
				break;
				
				
			case 'btn_viewoptions':
				toggleDisplay(document.getElementsByClassName('viewoptions')[0]);
				break;
				
				//TODO - need modals that come up from the bottom or side and just obscure the controls part of the screen
				//this would allow the effects of the options to be seen while messing with them!
				
			case 'btn_a':
				//if this one isn't already selected, remove selected class from all others, add to this one
				//if already selected, don't do anything. Same for other buttons in this group
				//also, feed the selected particle species to the particle creation mechanisms
				switchParticleType(t);
				break;
				
			case 'btn_b':
				switchParticleType(t);
				break;
				
			case 'btn_c':
				switchParticleType(t);
				break;
				
			case 'btn_all':
				switchParticleType(t);
				break;
				
			case 'btn_spawnQuantity':
				changeSpawnQuantity();
				break;
				
			case 'btn_plus':
				createParticles(spawnQuantity, particles[selectedSpecies]);
				break;			
				
			case 'btn_minus':
				killParticles(spawnQuantity, selectedSpecies);
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
		let newCoupling = convertButtonValue(t.value, COUPLING_VALUES);
		let coupleString = t.classList[t.classList.length - 1];
		let firstLetter = coupleString.slice(0, 1);
		let lastLetter = coupleString.slice(1);
		
		if(firstLetter != lastLetter){
			coupling[firstLetter][lastLetter] = newCoupling;
			coupling[lastLetter][firstLetter] = newCoupling;
		} else {
			coupling[firstLetter][firstLetter] = newCoupling;
		}			
		
	}
}

function handlePropertiesClicks(event){
	let t = event.target;
	if(t.tagName == 'BUTTON' && !t.disabled){
		let sp = t.classList[1]
		switch(t.classList[0]){
			case 'mass':
				cycleIcon(t, MASS_ICONS);
				let m_new = convertButtonValue(t.value, MASS_VALUES);
				masses[sp] = m_new;
				newMass[sp] = true; //line up the species for a charge update in next frame
				break;
			
			case 'charge':
				cycleIcon(t, CHARGE_ICONS);
				let q_new = convertButtonValue(t.value, CHARGE_VALUES);
				charges[sp] = q_new;
				newCharge[sp] = true; //line up the species for a charge update in next frame
				break;
		}
	}
}

function handleViewOptionsClicks(event){
	let t = event.target;
	if(t.tagName == 'INPUT'){
		switch(t.id){
			case 'chk_simple':
				simpleRender = !simpleRender;
				break;

			case 'chk_showparticles':
				for(let sp in particles){
					showParticles[sp] = !showParticles[sp];
				}
				break;
				
			case 'chk_showBounding':
				showBounding = !showBounding;
				break;
			
			case 'chk_showTree':
				for(let sp in particles){
					showTree[sp] = !showTree[sp];
				}
				break;
		}
	}
}


function changeSpawnQuantity(){
	//change appearance of button
	cycleIcon(document.getElementById('btn_spawnQuantity'), SPAWN_ICONS);
	
	//set quantity to be spawned
	spawnQuantity = Math.pow(10,parseInt(document.getElementById('btn_spawnQuantity').value));
	
}

function playPause(){
	//suspend animation
	paused = !paused;
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

function switchParticleType(elm){
	let buttons = document.getElementsByClassName('species-selector')[0].getElementsByTagName('BUTTON');
	for(let i = 0, l = buttons.length; i < l; i++){
		let b = buttons[i];
		if(b == elm){
			if(!b.classList.contains('selected')){b.classList.toggle('selected');}
			nextSelectedSpecies = elm.value;
		} else {
			if(b.classList.contains('selected')){b.classList.toggle('selected');}
		}
	}
	
}

//TODO - function to 'apply' state of coupling array (store 'old' state)
//TODO - somehow alert to the user that they must click 'apply' to save changes to physical properties/other settings
