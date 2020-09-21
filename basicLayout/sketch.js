const CONTINUOUS = true;
const INTERIM_RESULTS = false;

let speechRec;

// FUNCTIONS CALLED IN SETUP AND DRAW GO HERE
function gotSpeech(speech) {
    let phrase = speech.text.toLowerCase();

    //console.log is the same thing as print
    console.log('GOT SPEECH: ' + phrase);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let speech = new p5.Speech();
  speechRec = new p5.SpeechRec(gotSpeech);
  speechRec.start(CONTINUOUS, INTERIM_RESULTS);
}

function draw() {
}
