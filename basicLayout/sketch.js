const CONTINUOUS = true;
const INTERIM_RESULTS = false;

let signedIn;
let name;

let speechRec;

// FUNCTIONS CALLED IN SETUP AND DRAW GO HERE
function gotSpeech(speech) {
    let phrase = speech.text.toLowerCase();

    //console.log is the same thing as print
    console.log('GOT SPEECH: ' + phrase);
}

function signIn() {
    name = document.getElementById("nameInput").value;

    document.getElementById("nameInput").remove();
    document.getElementById("enterButton").remove();

    createCanvas(windowWidth, windowHeight);

    let speech = new p5.Speech();
    speechRec = new p5.SpeechRec(gotSpeech);
    speechRec.start(CONTINUOUS, INTERIM_RESULTS);

    console.log(name);
    signedIn = true;
}

function setup() {
    signedIn = false;

    let nameInput = document.createElement("INPUT");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("id", "nameInput");
    nameInput.setAttribute("name", "nameInput");

    let enterButton = document.createElement("BUTTON");
    enterButton.setAttribute("id", "enterButton");
    enterButton.setAttribute("onclick", "signIn()");
    enterButton.appendChild(document.createTextNode("ENTER"));

    document.body.appendChild(nameInput);
    document.body.appendChild(enterButton);
}

function draw() {
    if (signedIn) {
        background(255,204,0);
    }
}
