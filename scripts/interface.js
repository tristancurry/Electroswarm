//Interface.js: mainly for switching out the various icons on buttons

//centre of mass displays: should have an OVERALL CoM, with CoM for each species 'attached' to it
//visibility of particles, quadtrees etc should be settable for each species
//coupling strengths (5 levels of attraction/repulsion + 0)	

const SPAWN_ICONS = ['1','🔟','💯'];
const PLAY_ICONS = ['⏸️','▶️'];
const COUPLING_ICONS = ['url(images/r_100.svg)','url(images/r_050.svg)','url(images/r_020.svg)','url(images/r_010.svg)','url(images/r_005.svg)','url(images/r_002.svg)','url(images/r_001.svg)','url(images/r_000.svg)','url(images/a_001.svg)','url(images/a_002.svg)','url(images/a_005.svg)','url(images/a_010.svg)','url(images/a_020.svg)','url(images/a_050.svg)','url(images/a_100.svg)'];
const CHARGE_ICONS = ['url(images/c_000.svg)','url(images/c_001.svg)','url(images/c_002.svg)','url(images/c_005.svg)','url(images/c_010.svg)','url(images/c_050.svg)','url(images/c_100.svg)','url(images/c_500.svg)','url(images/c_01k.svg)', 'url(images/c_10k.svg)'];
const MASS_ICONS = ['🐵','🐔','🐨','🐲','🦄','🦊','🐹','🐻'];

const debugBox = document.getElementsByClassName('debug')[0];
let pausedByModal = false;
//Initialise button states (so they don't need to be specified in HTML



function initialiseButtonStates(){
	//setButtonState(btn, icon_array, value);
	setButtonState(document.getElementById('btn_spawnQuantity'), SPAWN_ICONS, 0);
	setButtonState(document.getElementById('btn_playPause'), PLAY_ICONS, 0);
	
	switchParticleType(document.getElementById('btn_b'));
	
	for(let sp in coupling){
		for (let ps in coupling){
			btn = document.getElementsByClassName(sp + ps)[0];
			btn.innerHTML = '';
			btn.value = convertValueToButton(coupling[sp][ps], COUPLING_VALUES);	
			btn.style.backgroundImage = COUPLING_ICONS[btn.value];
		}
	}
	
	for(let sp in charges){
			btn = document.getElementsByClassName('properties-grid')[0].getElementsByClassName(sp)[1];
			btn.innerHTML = '';
			btn.value = convertValueToButton(charges[sp], CHARGE_VALUES);	
			btn.style.backgroundImage = CHARGE_ICONS[btn.value];
	}
	
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
		if(pausedByModal && paused){playPause(); pausedByModal = false;}
		event.stopPropagation();
	}
});


let tabs = document.getElementsByClassName('tabs')[0];
tabs.addEventListener('click', function(event){
	let t = event.target;
	let controls = document.getElementsByClassName('controls')[0];
	let controlTabs = controls.getElementsByClassName('container');
	for(let i  = 0; i < controlTabs.length; i++){
		if(controlTabs[i].classList.contains('show')){controlTabs[i].classList.toggle('show');}
		let thisControlTab = document.getElementById(controlTabs[i].classList[0]);
		if(thisControlTab.classList.contains('selected')){thisControlTab.classList.toggle('selected');}
	}

	let thisTab = controls.getElementsByClassName(t.id)[0];
	thisTab.classList.toggle('show');
	t.classList.toggle('selected');
	event.stopPropagation();
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
				if(!paused){pausedByModal = true; playPause();}
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
				break;
				
			case 'btn_trails':
				if(!showTrails['a'] && !showTrails['b'] && !showTrails['c']){
					showTrails['a'] = true;
				} else if(showTrails['a'] && showTrails['b'] && showTrails['c']){
					for (let sp in particles){
						showTrails[sp] = false;
					}
				} else {
					for (let sp in particles){
						if(showTrails[sp] == true){
							showTrails[sp] = false;
							if(sp == 'a'){showTrails['b'] = true;}
							if(sp == 'b'){showTrails['c'] = true;}
							if(sp == 'c'){
								for (let ps in particles){
									showTrails[ps] = true;
								}
							}
							break;
						}
					}
				}
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
		let coupleString = t.classList[t.classList.length - 1];
		let firstLetter = coupleString.slice(0, 1);
		let lastLetter = coupleString.slice(1);

		cycleIconImages(t, COUPLING_ICONS);	//this also changes the button's value
		let newCoupling = convertButtonValue(t.value, COUPLING_VALUES);
		coupling[firstLetter][lastLetter] = newCoupling;
		
		if(firstLetter != lastLetter){
			pairedBtn = couplingGrid.getElementsByClassName(lastLetter + firstLetter)[0];
			cycleIconImages(pairedBtn, COUPLING_ICONS);
			coupling[lastLetter][firstLetter] = newCoupling;
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
				cycleIconImages(t, CHARGE_ICONS);
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

function cycleIconImages(btn, icon_array){
	btn.value = (parseInt(btn.value) + 1)%icon_array.length;
	btn.style.backgroundImage = icon_array[btn.value];
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
