"use strict";



function holi() {
    console.log('holi!');
}


// Creem una nova conexio local
var configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};

var constraints = null;
var local = null;



var offer, answer;

// Opcions de configuracio de DataChannel
var dataChannelOptions = {
    ordered: true
}
var localChannel = null,


    local = new RTCPeerConnection(configuration, constraints);
local.onicecandidate = iceCallback;
local.ondatachannel = onDataChannel;

function createOffer() {

    // Creem el dataChannel
    localChannel = local.createDataChannel('test1', dataChannelOptions);
    localChannel.onopen = onChannelStateChange;
    localChannel.onclose = onChannelStateChange;
    localChannel.onerror = onChannelStateChange;
    localChannel.onmessage = onMessageRecive;

    var offerOptions = {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 0,
            iceRestart: true
        }
        // Es crea una sessio SDP
    local.createOffer(offerOptions)
        .then(function (desc) {
            offer = desc;
            local.setLocalDescription(desc);
            console.log(desc);
            enviarMissatge('offer', desc);
        })
        .catch(function (error) {
            console.log("Error al crear Offer!");
            console.error(error);
        })
}

// Creem la resposta nomes quan hagim rebut un Offer del equip remot
function createAnswer() {

    local.createAnswer()
        .then(function (desc) {
            console.log("Resposta creada correctament");
            answer = desc;
            local.setLocalDescription(answer);
            enviarMissatge('answer', answer);

        })
        .catch(function (err) {
            console.log("Error al crear o enviar la resposta: " + err);
        })
}


// Obtenim la configuracio del equip remot
// i li enviem la nostra configuracio per sincronitzar-se
function setAnswer(remoteDescription) {

    local.setRemoteDescription(remoteDescription).then(
        function () {
            console.log("Offer remot integrada");

            // Creem la configuracio de la resposta per enviar-li
            createAnswer();

        },
        function (err) {
            console.error("Error intentant integrar la Offer remota -> " + err);
        }
    )

}


function setRemoteConf(answer) {

    local.setRemoteDescription(answer)
        .then(function () {
                console.log("Answer remot integrada \n" + answer.sdp);

            },
            function (err) {
                console.error("Error intentant integrar la Answer remota -> " + err);
            })
}

// Funcio que s'executa al saltar l'event onIceCandidate
function iceCallback(evt) {

    if (evt.candidate) {
        console.log("IceCandidate local\n" + evt.candidate.candidate);
        enviarMissatge('iceCandidate', evt.candidate);
    }
}

function addIceCandidate(iceCandidate) {
    local.addIceCandidate(
            new RTCIceCandidate(iceCandidate)
        ).then(_ => {
            console.log("IceCandidate creat correctament");
        })
        .catch(err => {
            console.error("Error al crear IceCandidate -> " + err);
        })
}


function onChannelStateChange(evt) {

    console.log('DataChannel canvi: ' + localChannel.readyState);
    if (localChannel.readyState == 'open') socket.disconnect();

}


/* Aquesta funcio salta quan la conexio RTC s'ha establert
 * i automaticament l'altre peer li envia el datachannel
 * a traves.
 */
function onDataChannel(evt) {

    localChannel = evt.channel;
    localChannel.onopen = onChannelStateChange;
    localChannel.onclose = onChannelStateChange;
    localChannel.onerror = onChannelStateChange;
    localChannel.onmessage = onMessageRecive;

}


function onMessageRecive(event) {

    console.log('Missatge rebut -> ' + event.data);
}
