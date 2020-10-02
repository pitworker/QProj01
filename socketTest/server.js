const PORT = 51367;
const HEIGHT_MULT = 0.7;
const PROB_MULT = 0.9;
const THETA = Math.PI * 0.125;
const INITIAL_HEIGHT = 120;
const INITIAL_ANGLE = 0;
const INITIAL_PROB = 1;

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let plant = null;
let ornaments = [];
let clients = [];
let names = [];

function generateEmoji() {
    let unicodeIndex = Math.floor(Math.random() * 0xFD) + 0x1F400;
    return String.fromCharCode(unicodeIndex);
}

function placeOnBranch() {
    let point = [null,null];

    let r0 = Math.random();
    let r1 = Math.random();

    point[0] = (1 - Math.sqrt(r0)) * plant.a[0]
        + (Math.sqrt(r0) * (1 - r1)) * plant.b[0]
        + (Math.sqrt(r0) * r1) * plant.c[0];
    point[1] = (1 - Math.sqrt(r0)) * plant.a[1]
        + (Math.sqrt(r0) * (1 - r1)) * plant.b[1]
        + (Math.sqrt(r0) * r1) * plant.c[1];

    return point;
}

function generateOrnament(message,sender) {
    let ornament = {};

    ornament.symbol = generateEmoji();
    ornament.position = placeOnBranch();
    ornament.message = message;
    ornament.sender = sender;

    console.log(sender + '\'s message: ' + ornament.message
                + '\nencoded placed at: ' + ornament.position
                + '\nwith emoji: ' + ornament.symbol);

    return ornament;
}

function branch(a,h,p) {
    let n = {
        angle:  a,
        length: h,
        right:  null,
        left:   null,
        isLeaf: true
    };

    if (Math.random() < p) {
        n.right = branch(a + THETA,
                         h * HEIGHT_MULT,
                         p * PROB_MULT);
        n.isLeaf = false;
    }

    if (Math.random() < p) {
        n.left = branch(a - THETA,
                        h * HEIGHT_MULT,
                        p * PROB_MULT);
        n.isLeaf = false;
    }

    return n;
}

function generatePlant() {
    let bottomOffset = Math.random() * 150;

    let newPlant = {
        a: [0, Math.random() * 300 + 120],
        b: [-bottomOffset, 120],
        c: [bottomOffset, 120],
        stump: [Math.random() * bottomOffset, 120],
        leafColor: [0, 51, 0],
        stumpColor: [102, 51, 0]
    };

    return newPlant;
}

function reset() {
    console.log('board reset');
    plant = generatePlant();

    names = [];
    clients = [];
}

app.get('/', function (req,res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/messenger', function (req,res) {
    res.sendFile(__dirname + '/client/messenger.html');
});

io.on('connection', function (socket) {
    console.log('new client connected: ' + socket);

    clients.push(socket);

    socket.on('setName', function (data) {
        if (names.indexOf(data) > -1) {
            socket.emit('nameExists', data +
                        ' already exists! Pick another name!');
        } else {
            names.push(data);

            socket.emit('nameSet', data);
            console.log(socket + ' set name to ' + data);
            socket.emit('plant', JSON.stringify(plant));
            socket.emit('ornaments', JSON.stringify(ornaments));
            io.emit('newClient', data);
        }
    });

    socket.on('disconnect', function () {
        let i = clients.indexOf(socket);
        if (i < 0 || i >= clients.length) {
            i = clients.indexOf(null);
        }

        if (i >= 0 || i < clients.length) {
            clients.splice(i, 1);
            names.splice(i, 1);
        }
    });

    socket.on('note', function (noteJSON) {
        let note = JSON.parse(noteJSON);
        let o = generateOrnament(note.content, note.name);

        console.log('received note: ' + note.content + '\nfrom ' + note.name);

        for (let i in clients) {
            if (clients[i] != socket) {
                clients[i].emit('note', noteJSON);
            }
        }

        ornaments.push(o);

        io.emit('note', JSON.stringify(o));
    });

    socket.on('newPlant', function (nameJSON) {
        let sender = JSON.parse(nameJSON);

        console.log('received command: newPlant\nfrom ' + sender.name);

        plant = generatePlant();

        io.emit('plant', JSON.stringify(plant));
    });
});

reset();
http.listen(PORT, function () {
   console.log('Listening on localhost:' + PORT + '...');
});
