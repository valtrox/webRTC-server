"use strict";
var isInitiator;

const room = prompt('Enter room name:');

var socket = io.connect();

//$('#send').on("click", function () {
//    console.log("click");
//    socket.emit('chat message', $('#m').val());
//    $('#m').val('');
//    return false;
//})
//
//socket.on('chat message', function (msg) {
//    $('#messages').append($('<li>').text(msg));
//})





if (room !== '') {
    console.log('Joining room ' + room);
    socket.emit('create or join', room);
}

socket.on('full', function (room) {
    console.log('Room ' + room + ' is full');
});

socket.on('empty', function (room) {
    isInitiator = true;
    console.log('Room ' + room + ' is empty');
});

socket.on('join', function (room) {
    console.log('Making request to join room ' + room);
    console.log('You are the initiator!');
});

socket.on('joined', function (room) {
    console.log('Making request to join room ' + room);
    console.log('You are the initiator!');
});

socket.on('log', function (array) {
    console.log.apply(console, array);
});

socket.on('message', function (message) {
    console.log('Missatge rebut : ' + message);
})

socket.on('offer', function (remoteDescription) {
    console.log("Descripcio del equip remot rebuda:\n" + remoteDescription.sdp);
    setAnswer(remoteDescription);
    $('#sndAnswer').removeAttr('disabled');
})

socket.on('answer', function (answer) {
    console.log("Resposta rebuda \n" + answer.sdp);
    setRemoteConf(answer);
})

socket.on('iceCandidate', function (iceCandidate) {
    console.log('IceCandidate remot rebut \n' + iceCandidate.candidate);
    addIceCandidate(iceCandidate);
})

// Enviarem el missatge i la room a la que esta conectada
function enviarMissatge(typeMessage, missatge) {
    var client = {
        room: room,
        type: typeMessage,
        missatge: missatge
    }
    console.log("Enviant missatge: ", typeMessage + ' -> ' +
        client.missatge);
    socket.emit('message', client);
}

// Crear Offer
$('#crtOffer').on('click', function () {
    createOffer();

});

// Enviar Offer
$('#sndOffer').on('click', function () {
    //    enviarMissatge('offer', local.localDescription);
});

$('#sndAnswer').on('click', function () {
    enviarMissatge('answer', answer);
})
