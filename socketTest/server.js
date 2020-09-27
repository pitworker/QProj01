const PORT = 51367;

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

function reset() {
    console.log('board reset');
    plant = {
        leaves: [],
        shade: 1
    }

    for (let i = 0; i < 5; i++) {
        plant.leaves.push(generateLeaf());
    }

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
            names.push(data);

            socket.emit('nameSet', data);
            console.log(socket + ' set name to ' + name);
            socket.emit('plant', JSON.stringify(plant));
            io.emit('newClient', name);
        } else {
            socket.emit('nameExists', data + ' already exists! Pick another name!');
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

        console.log('received note: ' + note.content + '\nfrom ' + note.sender);

        for (let i in clients) {
            if (clients[i] != socket) {
                clients[i].emit('note', noteJSON);
            }
        }

        //growPlant(note.score);

        io.emit('plant', JSON.stringify(plant));
    });
});

reset();
http.listen(PORT, function () {
   console.log('Listening on localhost:' + PORT + '...');
});
