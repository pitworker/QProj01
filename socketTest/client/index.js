const CONTINUOUS = true;
const INTERIM_RESULTS = false;

const PLANT_BASE = 200;

const FRAME_LIMIT = 300;

const MESSAGE_POS = [75,75];
const COUNTER_POS = [75,75];

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
    const r = 5;
    let x = mouseX - (width/2);
    let y = mouseY;
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

    console.log('mouse x: ' + x + ' y: ' + y + ' hovering: ' + hovering);

    //textFont('Poppins');
    textSize(36);
    textAlign(LEFT, TOP);

    if (displayedMessage > -1) {
        let m = ornaments[displayedMessage].message;
        let n = ornaments[displayedMessage].sender;
        let p = ornaments[displayedMessage].position;
        let w = textWidth(m);

        noStroke();
        fill(119, 0, 17);
        text(n + ":\n" + m, 0,0);//MESSAGE_POS[0], MESSAGE_POS[1]);
    }
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
        background(111,217,227);

        noStroke();
        fill(255);
        rect(0, height - 250, width, 250);

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
