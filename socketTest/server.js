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
let clients = [];
let names = [];

function generateLeaf() {
    return [
        Math.random() * 300,
        Math.random() * 600,
        Math.random() * 600
    ];
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

function reset() {
    console.log('board reset');
    plant = branch(INITIAL_ANGLE, INITIAL_HEIGHT, INITIAL_PROB);

    names = [];
    clients = [];
}

app.get('/', function (req,res) {
    res.sendFile(__dirname + '/client/index.html');
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

        console.log('received note: ' + note.content + '\nfrom ' + note.name);

        for (let i in clients) {
            if (clients[i] != socket) {
                clients[i].emit('note', noteJSON);
            }
        }

        //growPlant(note.score);

        io.emit('plant', JSON.stringify(plant));
    });

    socket.on('newPlant', function (nameJSON) {
        let sender = JSON.parse(nameJSON);

        console.log('received command: newPlant\nfrom ' + sender.name);

        plant = branch(INITIAL_ANGLE, INITIAL_HEIGHT, INITIAL_PROB);

        io.emit('plant', JSON.stringify(plant));
    });
});

reset();
http.listen(PORT, function () {
   console.log('Listening on localhost:' + PORT + '...');
});
