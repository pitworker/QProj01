const CONTINUOUS = true;
const INTERIM_RESULTS = false;

const PLANT_BASE = 200;

let socket = io();

let speechRec;

let signedIn;
let warningIssued;
let name;

let plant;

function initializePlant() {
    createCanvas(windowWidth, windowHeight);

    let speech = new p5.Speech();
    speechRec = new p5.SpeechRec(gotSpeech);
    speechRec.start(CONTINUOUS, INTERIM_RESULTS);

    signedIn = true;
    console.log('plant initialized');
}

function setName() {
    socket.emit('setName', document.getElementById('nameInput').value);
}

function gotSpeech(speech) {
    let phrase = speech.text;

    console.log('captured speech: ' + phrase);

    //TODO: distinguish different phrases by key commands
    //SEND NOTE, WATER PLANT, LIGHT ON, LIGHT OFF

    socket.emit('note', JSON.stringify({'name': name, 'content': phrase}));
}

function drawPlant() {
    //TODO: make this draw a plant
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
        background(255,20,0);
        drawPlant();
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
    plant = JSON.parse(plantJSON);
    console.log('new plant data received');
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newClient', function (data) {
    console.log('new client: ' + data);
});
