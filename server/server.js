var static = require('node-static');
var fs = require('fs');
var https = require('https');
var file = new(static.Server)();
// Opcions amb les que configurar el servidor
const options = {
    key: fs.readFileSync('cert/59984929-jordialbiac.com.key'),
    cert: fs.readFileSync('cert/59984929-jordialbiac.com.cert'),
}
var app = https.createServer(options, (function (req, res) {
    file.serve(req, res);
})).listen(2013);

var io = require('socket.io').listen(app, {
    'log level': 3,
    'match origin protocol': true,

});


io.sockets.on('connection', function (socket) {

    // convenience function to log server messages to the client
    function log() {
        var array = ['>>> Message from server: '];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }
    socket.on('message', function (message) {
        //        log('Got message:', message);
        socket.broadcast.to(message.room).emit(message.type, message.missatge)
    });

    socket.on('create or join', function (room) {


        var numClients;

        // Comprovem que existeixi la sala
        if (io.nsps['/'].adapter.rooms[room] === undefined) {
            numClients = 0;
        } else {
            numClients = io.nsps['/'].adapter.rooms[room].length;
        }



        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room ' + room);

        if (numClients === 0) {
            socket.join(room);
            socket.emit('created', room);
            console.log("Room creada");
        } else if (numClients === 1) {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', {
                room: room,
                socket: socket.id
            });

        } else { // max two clients
            socket.emit('full', room);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

    });

    socket.on('disconnect', function () {
        console.log("Client desconectat")
    })




});
