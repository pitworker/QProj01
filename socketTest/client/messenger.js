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

function initializeMessenger() {
    signedIn = true;

    let messageInput = document.createElement('INPUT');
    messageInput.setAttribute('type', 'text');
    messageInput.setAttribute('id', 'messageInput');
    messageInput.setAttribute('name', 'messageInput');

    let sendButton = document.createElement('BUTTON');
    sendButton.setAttribute('id', 'sendButton');
    sendButton.setAttribute('onclick', 'sendMessage()');
    sendButton.appendChild(document.createTextNode('SEND ->'));

    document.body.appendChild(messageInput);
    document.body.appendChild(sendButton);

    console.log('messenger initialized');
}

function setName() {
    socket.emit('setName', document.getElementById('nameInput').value);
}

function sendMessage() {
    let message = document.getElementById('messageInput').value
    socket.emit('note', JSON.stringify({'name': name, 'content': message}));
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
    initializeMessenger();
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newClient', function (data) {
    console.log('new client: ' + data);
});
