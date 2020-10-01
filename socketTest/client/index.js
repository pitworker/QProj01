const CONTINUOUS = true;
const INTERIM_RESULTS = false;

const PLANT_BASE = 200;

const FRAME_LIMIT = 300;

let socket = io();

let speechRec;

let signedIn;
let warningIssued;
let name;

let plant;

let angleMult;
let angleAdd;

let frameCount;
let frameForward;

function initializePlant() {
    createCanvas(windowWidth, windowHeight);

    let speech = new p5.Speech();
    speechRec = new p5.SpeechRec(gotSpeech);
    speechRec.start(CONTINUOUS, INTERIM_RESULTS);

    signedIn = true;
    console.log('plant initialized');

    frameCount = 0;
    frameForward = true;
}

function setName() {
    socket.emit('setName', document.getElementById('nameInput').value);
}

function gotSpeech(speech) {
    let phrase = speech.text;

    console.log('captured speech: ' + phrase);

    //TODO: distinguish different phrases by key commands
    //SEND NOTE, WATER PLANT, LIGHT ON, LIGHT OFF

    if (phrase.toLowerCase() == 'new plant') {
        socket.emit('newPlant', JSON.stringify({'name': name}));
    } else {
        socket.emit('note', JSON.stringify({'name': name, 'content': phrase}));
    }
}

function drawPlant() {
    push();

    translate(width / 2, height);

    noStroke();

    fill(plant.leafColor[0],
         plant.leafColor[1],
         plant.leafColor[2]);

    triangle(plant.a[0], plant.a[1],
             plant.b[0], plant.b[1],
             plant.c[0], plant.c[1]);

    fill(plant.stumpColor[0],
         plant.stumpColor[1],
         plant.stumpColor[2])

    rectMode(CORNERS);
    rect(-stump[0], 0, stump[0], stump[1]);

    pop();
}

function plantFlow(t) {
    // Using Penner's EaseOut Sine function from Golan Levin's Pattern Master
    return Math.sin(t * (Math.PI * 0.5));
}

function setup() {
    signedIn = false;
    warningIssued = false;

    let nameInput = document.createElement('INPUT');
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('id', 'nameInput');
    nameInput.setAttribute('name', 'nameInput');

    let enterButton = document.createElement('BUTTON');
    enterButton.setAttribute('id', 'enterButton');
    enterButton.setAttribute('onclick', 'setName()');
    enterButton.appendChild(document.createTextNode('ENTER'));

    document.body.appendChild(nameInput);
    document.body.appendChild(enterButton);
}

function draw() {
    if (signedIn) {
        background(255,204,0);

        let plantFlowVal = plantFlow((frameForward ? frameCount :
                                      (FRAME_LIMIT - frameCount))
                                     / FRAME_LIMIT);

        angleAdd = (2.0 * (plantFlowVal - 0.5))
                   * (Math.PI * 0.125);

        angleMult = (mouseX / width);

        drawPlant();

        frameCount++;
        if (frameCount >= FRAME_LIMIT) {
            frameCount = 0;
            frameForward = !frameForward;
        }
    }
}

socket.on('nameExists', function (data) {
    if (!warningIssued) {
        let warningText = document.createElement('DIV');
        warningText.setAttribute('id', 'warningText');
        warningText.appendChild(document.createTextNode(
            'This name is already taken, please choose another one.'));

        document.body.appendChild(warningText);
        warningIssued = true;
    }
});

socket.on('nameSet', function (data) {
    name = data;

    document.getElementById('nameInput').remove();
    document.getElementById('enterButton').remove();
    if (warningIssued) {
        document.getElementById('warningText').remove();
    }
    initializePlant();
});

socket.on('plant', function (data) {
    plant = JSON.parse(data);
    console.log('new plant data received');
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newClient', function (data) {
    console.log('new client: ' + data);
});
