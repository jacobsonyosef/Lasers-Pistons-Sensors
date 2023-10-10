import GameGrid from './GameGrid.js';
import ObjectFunctions from './ObjectFunctions.js';

const GRID_SIZE = 4;

/* Image data is hardcoded as there are only 10 images and this
   was simpler than building a resource loading mechanism */
const imageResourcePrefix = 'images\\';
const imageIDs = {
    'block': 0,
    'exit': 1,
    'sensorOFF': 2,
    'sensorON': 3,
    'laserOFF': 4,
    'laserON': 5,
    'pistonOFF': 6,
    'pistonON': 7,
    'pistonEXTEND': 8,
    'laser': 9,
    'empty': 10
};
const Images = [
    'block.svg', 'exit.svg',
    'sensorOFF.svg', 'sensorON.svg',
    'laserOFF.svg', 'laserON.svg',
    'pistonOFF.svg', 'pistonON.svg',
    'pistonEXTEND.svg', 'laser.svg',
    'empty.svg'
];

const grid = new GameGrid(GRID_SIZE);

// some global flags to control game state
let running = true;
let init = true;

// global info for sensor connection functionality
let connecting = false;
let sensorToConnect = null;

// used to load the correct next level on completion
let levelNo = 0;

setup();
RefreshDisplay();   // draw the initial level

init = false;
running = false;

setInterval(UpdateLoop, 1000);  // the main update loop, runs once per second

function rightClick(event) {
    event.preventDefault(); // prevent the default right-click menu from appearing

    if (document.getElementById('contextMenu').style.display == 'block') {
        document.getElementById('contextMenu').style.display = 'none';  // if the menu is open somewhere else, close it
    }
    else if (!running) {
        let img = document.elementFromPoint(event.clientX, event.clientY);  // get the image at the clicked position
        let index = img.id.replace(/\D/g, '');      // extract the image's index number from its id (all images have ids in the format "img[x][y]")
        let x = index[0];
        let y = index[1];
        let gridObject = grid.getObjectAt(x, y);    // get the image's corresponding object in the internal grid of the game

        if (gridObject.objectID > 1 && gridObject.objectID < 8) {
            // get the two menu options from the custom context menu
            let menuItem1 = document.getElementById('option1');
            let menuItem2 = document.getElementById('option2');

            if (gridObject.objectID > 3) {
                menuItem2.style.display = 'none';   // only sensors (id <= 3) have a second menu option
            }
            else {
                // display the second menu option
                menuItem2.style.display = 'block';
                menuItem2.textContent = 'Connect to...';

                // if the option is clicked, set up initial values for sensor's connect method
                menuItem2.onclick = () => {
                    setTimeout(() => {
                        connecting = true;
                        sensorToConnect = gridObject;
                    }, 10);
                };
            }

            // if the first option is left-clicked, toggle the state of that object
            menuItem1.onmousedown = (event) => {
                if (event.button === 0) ObjectFunctions.ToggleState(gridObject);
            };
            menuItem1.textContent = 'Toggle State';

            // draw the menu at the mouse position
            let menu = document.getElementById('contextMenu');
            menu.style.display = 'block';
            menu.style.left = event.pageX + 'px';
            menu.style.top = event.pageY + 'px';
        }
    }
}

function onClick(event) {
    document.getElementById('contextMenu').style.display = 'none';  // close the context menu if it is open

    if (connecting) {
        let img = document.elementFromPoint(event.clientX, event.clientY);  // get the image at the mouse position
        let index = img.id.replace(/\D/g, '');  // extract its index and get the corresponding object as in rightClick()
        let x = index[0];
        let y = index[1];
        let gridObject = grid.getObjectAt(x, y);

        if (gridObject.objectID > 1 && gridObject.objectID < 8) {
            // this range of objectIDs represents the objects which can be toggled
            connecting = false;
            ObjectFunctions.SensorConnect(sensorToConnect, gridObject); // complete the sensor's connect method by passing in the clicked object
        }
    }
}

function setup() {
    document.getElementById('start').addEventListener('click', toggleSimulation);   // attach toggleSimulation() to 'Start' button
    document.getElementById('reset').addEventListener('click', loadNextLevel);

    document.onclick = onClick;
    document.oncontextmenu = rightClick;

    // create a CSS grid with the same size as the generated internal grid
    let gridFormatString = 'grid-template-columns:';
    for (let i = 0; i < GRID_SIZE; i++) {
        gridFormatString += ' 1fr';
    }
    gridFormatString += ';';

    let gameDisplay = document.getElementById('gameDisplay');
    gameDisplay.style.cssText += gridFormatString;  // inject the generated CSS into the webpage
    gameDisplay.style.height = '100vh';

    let img;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            // create the images to represent the grid objects
            img = document.createElement('img');
            img.id = `img[${i}][${j}]`
            
            // apply CSS style formatting to the image
            img.className = 'gridItem';
            img.style.cssText += `max-height: ${100 / (GRID_SIZE + 1)}vh`;

            gameDisplay.append(img);    // inject the image into the webpage
        }
    }

    loadNextLevel();    // load the inital level
}

function UpdateLoop() {
    if (running) {
        let changes = { sensors: {x: [], y: [], objects: []}, pistons: {x: [], y: [], objects: []},
                        blocks: {x: [], y: [], objects: []}, lasers: {x: [], y: [], objects: []},
                        laserGuns: {x: [], y: [], objects: []}, exits: {x: [], y: [], objects: []}};


        let exits = grid.getObjectsByID(1);             // collect all exits (objects with id === 1)
        changes.exits = processObjectChanges(exits);    // run each object's activeFunction and get the resulting changes to the grid
        applyGridChanges(changes.exits);                // apply the calculated changes to the grid

        let pistons = grid.getObjectsByID(6).concat(grid.getObjectsByID(7)).concat(grid.getObjectsByID(8));
        changes.pistons = processObjectChanges(pistons);
        applyGridChanges(changes.pistons);

        let blocks = grid.getObjectsByID(0);
        changes.blocks = processObjectChanges(blocks);
        applyGridChanges(changes.blocks);

        let sensors = grid.getObjectsByID(2).concat(grid.getObjectsByID(3));
        changes.sensors = processObjectChanges(sensors);
        applyGridChanges(changes.sensors);

        let lasers = grid.getObjectsByID(9);
        changes.lasers = processObjectChanges(lasers);
        applyGridChanges(changes.lasers);

        let laserGuns = grid.getObjectsByID(4).concat(grid.getObjectsByID(5));
        changes.laserGuns = processObjectChanges(laserGuns);
        applyGridChanges(changes.laserGuns);

        RefreshDisplay();

        if (grid.won) {
            RefreshDisplay();
            alert('You won!');
            grid.won = false;
            levelNo++;
            loadNextLevel();
        }
    }
}

function RefreshDisplay() {
    for (let i = 0; i < grid.size; i++) {
        for (let j = 0; j < grid.size; j++) {
            let gridObject = grid.getObjectAt(i, j);
            let image = document.getElementById(`img[${i}][${j}]`);
            image.src = imageResourcePrefix + Images[gridObject.objectID];
            image.style.transform = `rotate(${(90 * gridObject.orientation)}deg)`;
        }
    }
}

function toggleSimulation() {
    running = !running;
    document.getElementById('start').textContent = running ? 'Stop' : 'Start'
}

function setSimulation(state) {
    if (state) {
        running = true;
        document.getElementById('start').textContent = 'Stop';
    }
    else {
        running = false;
        document.getElementById('start').textContent = 'Start';
    }
}

function processObjectChanges(objectChanges) {
    let allChanges = null;
    if (objectChanges) {
        allChanges = {x: [], y: [], objects: []};
        for (const changeData of objectChanges) {
            if (changeData.object.activeFunction && !init) {
                // if the given object has an activeFunction, run it and collect the resultant changes to the grid
                let objectChanges = changeData.object.activeFunction(grid, changeData.position.x, changeData.position.y);
                if (objectChanges) {
                    // collect all the changes
                    for (let i = 0; i < objectChanges.x.length; i++) {
                        allChanges.x = allChanges.x.concat(objectChanges.x[i]);
                        allChanges.y = allChanges.y.concat(objectChanges.y[i]);
                        allChanges.objects = allChanges.objects.concat(objectChanges.objects[i]);
                    }
                }
            }
        }
    }
    return allChanges;
}

function applyGridChanges(changes) {
    for (let i = 0; i < changes.objects.length; i++) {
        let newObject = changes.objects[i];
        let newX = changes.x[i];
        let newY = changes.y[i];
        grid.setObjectAt(newX, newY, newObject);
        let image = document.getElementById(`img[${newX}][${newY}]`);
        image.src = imageResourcePrefix + Images[newObject.objectID];
        image.style.transform = `rotate(${(90 * newObject.orientation)}deg)`;
    }
}

/*  Levels are hardcoded rather than dynamically loaded because there are only a few simple ones. 
    Levels take the format of two grids: one describing the objects by ID and another describing
    their orientation. */
function loadNextLevel() {
    
    if (levelNo === 0) {
        grid.loadLevel(
            [
            [imageIDs['empty'], imageIDs['block'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['empty'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['empty'], imageIDs['pistonON'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['exit'], imageIDs['empty'], imageIDs['empty']]
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 2, 0],
                [0, 0, 0, 0]
            ]
        )
    }
    else if (levelNo === 1) {
        grid.loadLevel(
            [
            [imageIDs['empty'], imageIDs['block'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['empty'], imageIDs['pistonOFF'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['empty'], imageIDs['empty'], imageIDs['laserON']],
            [imageIDs['empty'], imageIDs['exit'], imageIDs['empty'], imageIDs['empty']]
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 2, 2],
                [0, 0, 0, 0]
            ]
        )
    }
    else if (levelNo === 2) {
        grid.loadLevel(
            [
            [imageIDs['empty'], imageIDs['block'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['empty'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['sensorOFF'], imageIDs['empty'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['pistonOFF'], imageIDs['empty'], imageIDs['exit'], imageIDs['empty']]
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        )
    }
    else if (levelNo === 3) {
        grid.loadLevel(
            [
            [imageIDs['empty'], imageIDs['empty'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['empty'], imageIDs['empty'], imageIDs['empty'], imageIDs['empty']],
            [imageIDs['sensorOFF'], imageIDs['empty'], imageIDs['empty'], imageIDs['laserON']],
            [imageIDs['pistonOFF'], imageIDs['block'], imageIDs['exit'], imageIDs['empty']]
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 2],
                [0, 0, 0, 0]
            ]
        )
    }
    RefreshDisplay();
    setSimulation(false);
}