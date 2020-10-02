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
let ornaments;

let displayedMessage;

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
    if (plant != null) {
        push();

        translate(width / 2, height);

        noStroke();

        fill(plant.leafColor[0],
             plant.leafColor[1],
             plant.leafColor[2]);

        triangle(plant.a[0], -plant.a[1],
                 plant.b[0], -plant.b[1],
                 plant.c[0], -plant.c[1]);

        fill(plant.stumpColor[0],
             plant.stumpColor[1],
             plant.stumpColor[2]);

        rectMode(CORNERS);
        rect(-plant.stump[0], 0, plant.stump[0], -plant.stump[1]);

        pop()
    } else {
        console.log('plant not yet received');
    }
}

function drawOrnaments() {
    push();

    translate(width / 2, height);

    for (let i = 0; i < ornaments.length; i++) {
        o = ornaments[i];
        textSize(48);
        textAlign(CENTER,CENTER);
        text(o.symbol, o.position[0], -o.position[1])
    }

    pop();
}

function drawMessage() {
    const r = 5;
    let x = mouseX - (width/2);
    let y = height - mouseY;
    let hovering = false;
    for (let i = 0; i < ornaments.length; i++) {
        let o = ornaments[i];
        if (x > o.position[0] - r && x < o.position[0] + r
            && y > o.position[1] - r && y < o.position[1] + r) {
            displayedMessage = i;
            hovering = true;
        }
    }

    if (!hovering) {
        displayedMessage = -1;
    }

    push()

    translate(width / 2, height);

    textSize(24);
    textAlign(LEFT, TOP);

    if (displayedMessage > -1) {
        let m = ornaments[displayedMessage].message;
        let n = ornaments[displayedMessage].sender;
        let p = ornaments[displayedMessage].position;
        let w = textWidth(m);

        strokeWeight(4);
        stroke(255);
        fill(25,25,200);
        rectMode(CENTER);
        rect(p[0], -p[1], w + 40, 80);

        noStroke();
        fill(255);
        text(n + ":\n" + m, p[0] - (w/2), -p[1] - 20);
    }

    pop();
}

function plantFlow(t) {
    // Using Penner's EaseOut Sine function from Golan Levin's Pattern Master
    return Math.sin(t * (Math.PI * 0.5));
}

function setup() {
    signedIn = false;
    warningIssued = false;
    plant = null;
    ornaments = [];
    displayedMessage = -1;

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
        background(255,85,100);

        let plantFlowVal = plantFlow((frameForward ? frameCount :
                                      (FRAME_LIMIT - frameCount))
                                     / FRAME_LIMIT);

        angleAdd = (2.0 * (plantFlowVal - 0.5))
                   * (Math.PI * 0.125);

        angleMult = (mouseX / width);

        drawPlant();

        drawOrnaments();

        drawMessage();

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

socket.on('ornaments', function (data) {
    ornaments = JSON.parse(data);
    console.log('ornaments received');
});

socket.on('newOrnament', function (data) {
    let o = JSON.parse(data);
    ornaments.push(o);
    console.log('note received');
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newClient', function (data) {
    console.log('new client: ' + data);
});
