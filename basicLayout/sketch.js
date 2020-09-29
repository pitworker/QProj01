const CONTINUOUS = true;
const INTERIM_RESULTS = false;
const HEIGHT_MULT = 0.7;
const PROB_MULT = 0.9;
const THETA = Math.PI * 0.25;

let signedIn;
let name;

let speechRec;

let angleMult;

let tree;

// FUNCTIONS CALLED IN SETUP AND DRAW GO HERE
function gotSpeech(speech) {
    let phrase = speech.text.toLowerCase();

    //console.log is the same thing as print
    console.log('GOT SPEECH: ' + phrase);
}

function branch(a,h,p) {
    let n = {
        angle:  a,
        length: h,
        right:  null,
        left:   null,
        isLeaf: true
    };

    if (random() < p) {
        n.right = branch(a + THETA,
                         h * HEIGHT_MULT,
                         p * PROB_MULT);
        n.isLeaf = false;
    }

    if (random() < p) {
        n.left = branch(a - THETA,
                        h * HEIGHT_MULT,
                        p * PROB_MULT);
        n.isLeaf = false;
    }

    return n;
}

function drawLeaf(r) {
    noStroke();
    fill(100,0,255);
    circle(0, 0, r * 0.75);
}

function drawTree(b) {
    console.log('drawTree called!');
    if (b != null) {
        push();

        rotate(b.angle * angleMult);
        strokeWeight(b.length / 2);
        line(0, 0, 0, -b.length);
        translate(0, -b.length);

        if (b.isLeaf) {
            drawLeaf(b.length);
        } else {
            drawTree(b.left);
            drawTree(b.right);
        }

        pop();
    }
}

function signIn() {
    name = document.getElementById("nameInput").value;

    document.getElementById("nameInput").remove();
    document.getElementById("enterButton").remove();

    createCanvas(windowWidth, windowHeight);

    let speech = new p5.Speech();
    speechRec = new p5.SpeechRec(gotSpeech);
    speechRec.start(CONTINUOUS, INTERIM_RESULTS);

    tree = branch(0,120,1);

    console.log(tree);

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

        angleMult = (mouseX / width);
        // Start the tree from the bottom of the screen
        translate(width/2,height);
        // Draw a line 120 pixels
        strokeWeight(50);
        stroke(255);

        drawTree(tree);
    }
}
