const CONTINUOUS = true;
const INTERIM_RESULTS = false;

let speechRec;
let socket;
let plant;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Setup the speech
    let speech = new p5.Speech();
    speechRec = new p5.speechRec(gotSpeech);
    speechRec.start(CONTINUOUS,INTERIM_RESULTS);

    // Connect to the server
    socket = new WebSocket('http://localhost:1337');

}
