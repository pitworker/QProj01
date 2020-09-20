//const SOCKET = IO();

const CONTINUOUS = true;
const INTERIM_RESULTS = false;

const PLANT_BASE = 200;

let speechRec;
let socket;
let plant;

function gotSpeech(speech) {
    let phrase = speech.text;

    console.log('captured speech: ' + phrase);

    //TODO: distinguish different phrases by key commands
    //SEND NOTE, WATER PLANT, LIGHT ON, LIGHT OFF

    socket.emit('note', phrase);
}

function drawPlant() {
    //TODO: make this draw a plant
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Setup the speech
    let speech = new p5.Speech();
    speechRec = new p5.speechRec(gotSpeech);
    speechRec.start(CONTINUOUS,INTERIM_RESULTS);

    // Connect to the server
    socket = new WebSocket('http://localhost:51367');

    socket.onopen = () => {
        console.log('connected to server');
    };

    socket.onmessage = (event) => {
        if (event.data == 'new client') {
            console.log('new client connected');
        }
    };

    socket.on('plant', function (plantJSON) {
        plant = JSON.parse(plantJSON);
        console.log('new plant data received');
    });

    socket.on('disconnect', function() {
        console.log('disconnected from server');
    });
}

function draw() {
    drawPlant();
}
