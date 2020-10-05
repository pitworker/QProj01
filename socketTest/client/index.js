const CONTINUOUS = true;
const INTERIM_RESULTS = false;

const PLANT_BASE = 200;

const FRAME_LIMIT = 300;

const MESSAGE_POS = [75,75];
const COUNTER_POS = [75,75];

const MOUSE_RADIUS = 15;

const FLAKE_QUANT = 15;
const MIN_FLAKE_SIZE = 4;
const MAX_FLAKE_SIZE = 7;

const SNOW_COLOR = [255,255,255];
const SKY_COLOR = [169,207,219];
const MESSAGE_COLOR = [232,129,121];
const COUNTER_COLOR = {MAJOR: [68,101,55], MINOR: [199,224,234]};

const TYPEFACE = 'Quicksand';

let socket = io();

let speechRec;
let sendingMessage;

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

let flakes;

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

    if (phrase.toLowerCase() == 'send message') {
        sendingMessage = true;
    } else if (sendingMessage) {
        socket.emit('note', JSON.stringify({'name': name, 'content': phrase}));
        sendingMessage = false;
    } else {
        console.log('Speech detected, not recording');
    }
}

function drawPlant() {
    if (plant != null) {
        push();

        translate(width / 2, height);

        image(plant.img, -300, -788, 600, 788);

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
        text(o.symbol, o.position[0], o.position[1])
    }

    pop();
}

function drawMessage() {
    const r = MOUSE_RADIUS;
    let x = mouseX - (width/2);
    let y = - (height - mouseY);
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

    textFont(TYPEFACE);
    textSize(36);
    textAlign(LEFT, TOP);

    if (displayedMessage > -1) {
        let m = ornaments[displayedMessage].message;
        let n = ornaments[displayedMessage].sender;
        let p = ornaments[displayedMessage].position;
        let w = textWidth(m);

        noStroke();
        fill(MESSAGE_COLOR[0], MESSAGE_COLOR[1], MESSAGE_COLOR[2]);
        text(n + ":\n" + m, MESSAGE_POS[0], MESSAGE_POS[1]);
    }
}

function drawSnow() {
    // Adapted from http://solemone.de/demos/snow-effect-processing/
    for (let i = 0; i < flakes.length; i++) {
        let add = map(flakes[i].size,
                      MIN_FLAKE_SIZE, MAX_FLAKE_SIZE,
                      0.1, 0.5);

        circle(flakes[i].pos[0], flakes[i].pos[1], flakes[i].size);

        if (flakes[i].dir == 0) {
            flakes[i].pos[0] += add;
        } else {
            flakes[i].pos[0] -= add;
        }

        flakes[i].pos[1] += flakes[i].size + flakes[i].dir;

        if (flakes[i].pos[0] > width + flakes[i].size
            || flakes[i].pos[0] < - flakes[i].size
            || flakes[i].pos[1] > height + flakes[i].size) {
            flakes[i].pos[0] = Math.random() * width;
            flakes[i].pos[1] = - flakes[i].size;
        }
    }
}

function drawTime() {
    let d = 31 - day();
    let m = 12 - month();

    textSize(48);
    fill(COUNTER_COLOR.MAJOR[0],
         COUNTER_COLOR.MAJOR[1],
         COUNTER_COLOR.MAJOR[2]);
    text(m, width - 200, 150);
    text(days, width - 200, 225);

    textSize(18);
    fill(COUNTER_COLOR.MINOR[0],
         COUNTER_COLOR.MINOR[1],
         COUNTER_COLOR.MINOR[2]);
    text('months &', width - 200, 175);
    text('days until\nnew years', width - 200, 250);
}

function setup() {
    signedIn = false;
    warningIssued = false;
    plant = null;
    ornaments = [];
    displayedMessage = -1;
    flakes = [];

    for (let i = 0; i < FLAKE_QUANT; i++) {
        flakes.push({
            size: Math.round(Math.random()
                             * (MAX_FLAKE_SIZE - MIN_FLAKE_SIZE)
                             + MIN_FLAKE_SIZE),
            pos: [Math.random() * width,
                  Math.random() * height],
            dir: Math.round(Math.random())
        });
    }

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

        background(SKY_COLOR[0], SKY_COLOR[1], SKY_COLOR[2]);

        noStroke();
        fill(SNOW_COLOR[0], SNOW_COLOR[1], SNOW_COLOR[2]);
        rect(0, height - 250, width, 250);

        drawPlant();

        drawOrnaments();

        drawTime();

        drawMessage();

        drawSnow();
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
    plant.img = loadImage(plant.img);
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
