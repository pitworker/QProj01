const port = 1337;
const io = require('socket.io')();

let plant = null;
const clients = [];

function generateLeaf() {
    return [
        Math.random() * 300,
        Math.random() * 600,
        Math.random() * 600
    ];
}

function reset() {
    plant = {
        leaves: [],
        shade: 1
    }

    for (let i = 0; i < 5; i++) {
        plant.leaves.push(generateLeaf());
    }

    clients = [];
}

io.on('connection', function (socket) {
    clients.push(socket);
    socket.emit('plant', JSON.stringify(plant));
    io.emit('message', 'new client');

    socket.on('disconnect', function () {
        let i = clients.indexOf(socket);
        if (i < 0 || i >= clients.length) {
            i = clients.indexOf(null);
        }

        if (i >= 0 || i < clients.length) {
            clients.splice(i, 1);
        }
    });

    socket.on('note', function (noteJSON) {
        let note = JSON.parse(noteJSON);

        for (let i in clients) {
            if (clients[i] != socket) {
                clients[i].emit('note', JSON.stringify(note.content));
            }
        }

        growPlant(note.score);

        io.emit('plant', JSON.stringify(plant));
    });
}

reset();
io.listen(port);
console.log('Listening on port ' + port + '...');
