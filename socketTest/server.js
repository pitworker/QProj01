const PORT = 51367;
const IO = require('socket.io')();

let plant = null;
let clients = [];

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

    clients = [];
}

IO.on('connection', function (socket) {
    clients.push(socket);
    socket.emit('plant', JSON.stringify(plant));
    IO.emit('message', 'new client');

    console.log('new client connected: ' + socket);

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

        console.log('received note: ' + note + '\nfrom ' + socket);

        for (let i in clients) {
            if (clients[i] != socket) {
                clients[i].emit('note', JSON.stringify(note.content));
            }
        }

        //growPlant(note.score);

        IO.emit('plant', JSON.stringify(plant));
    });
});

reset();
IO.listen(PORT);
console.log('Listening on port ' + PORT + '...');
