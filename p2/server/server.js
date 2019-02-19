// Variables
var users = [];
var uid = 0;
var messages = [];
var cubes = [];
var msg = {}
// Http Server
var http = require('http');
var url = require('url');

var server = http.createServer(function (request, response) {
    console.log("REQUEST: " + request.url);
    var url_info = url.parse(request.url, true); //all the request info is here
    var pathname = url_info.pathname; //the address
    var params = url_info.query; //the parameters
    response.end("OK!"); //send a response
});
var port = 1337
server.listen(port, function () {
    console.log(`Server ready on port ${port}!`);
});

// Express
const express = require("express");
const app = express()
app.get('/', (req, res) => {
    res.send('Hello World')
    console.log('nice')
})
app.listen(port + 1, () => console.log(`Example app listening on port ${port + 1}!`))
// WebSocket Server
var WebSocketServer = require('websocket').server;
var wsServer = new WebSocketServer({ // create the server
    httpServer: server //if we already have our HTTPServer in server variable...
});
wsServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);
    var user = {}
    console.log("NEW WEBSOCKET USER!!!");
    user = request.resourceURL.query
    user.uid = uid
    user.connection = connection
    users.push(user)
    uid++

    // Send user information
    msg = {
        type: 'username',
        info: {
            name: user.name,
            uid: user.uid
        }
    }
    connection.send(JSON.stringify(msg))

    // Send all messages
    msg = {
        type: 'messages',
        info: messages
    }
    connection.send(JSON.stringify(msg))

    // Send message user connected to other all
    msg = {
        type: 'userconnected',
        info: {
            name: user.name,
            uid: user.uid
        }
    }
    sendAll(JSON.stringify(msg))

    //Send the state of the scene
    msg = {
        type: 'scene',
        cubes: cubes
    }
    console.log('sending scene to the client from server')
    connection.send(JSON.stringify(msg))

    //Quan algum m'envia un msg del estil:
    connection.on('message', function (data) {
        if (data.type === 'utf8') {
            var message = JSON.parse(data.utf8Data)
            switch (message.type) {
                case "login":
                    msg = {
                        type: 'clients',
                        info: users.length
                    }
                    sendAll(JSON.stringify(msg));
                    break;
                case "message":
                    messages.push(message)
                    msg = {
                        type: 'message',
                        info: message
                    }
                    sendAll(JSON.stringify(msg));
                    break;
                case "addNewCube":
                    message.cube.uid = user.uid
                    cubes.push(message.cube)
                    msg = {
                        type: 'actualizeCubes',
                        cube: message.cube
                    }
                    sendAll(JSON.stringify(msg));
                    break;
                case "actualizeCube":
                    //message.cube.uid = user.uid
                    for( var i = 0; i < cubes.length; i++){
                        if(cubes[i].uid === message.cubeUid){
                            cubes[i].position = message.position
                        }
                    }
                    msg = {
                        type: 'moveCubeTo',
                        cube: {
                            uid: message.cubeUid,
                            position: message.position
                        }
                    }
                    sendAll(JSON.stringify(msg));
                    break;
                case "scene":
                    console.log('MHA ENTRAT UNA SCENE')
                    message.info = {
                        name: user.name,
                        uid: user.uid
                    }
                    //Veure si es nou o ja estava a la sala
                    var v = 0;
                    for (var i = 0; i < cubes.length; i++) {
                        if (cubes[i].info.uid === message.info.uid) {
                            cubes[i] = message
                            v = 1;
                        }
                    }
                    if (v === 0) {
                        cubes.push(message)
                    }
                    console.log('cubes te tamany:', cubes.length)
                    //Send the array with all the users and their positions
                    msg = {
                        type: 'scene',
                        cubes: cubes
                    }
                    sendAll(JSON.stringify(msg));
                    break
                case "canvas":
                    message.info = {
                        name: user.name,
                        uid: user.uid
                    }
                    console.log('sending message to client: ', message)
                    var v = 0;
                    for(var i = 0; i<cubes.length; i++){
                        if(cubes[i].info.uid === message.info.uid){
                            cubes[i] = message
                            v = 1;
                            console.log('IIIIIINNNNNNNs')
                        }
                    }
                    if(v === 0){
                        cubes.push(message)
                    }
                    msg = {
                        type: 'cubes',
                        cubes: cubes
                    }
                    sendAll(JSON.stringify(msg))
                    break;
            }
        }
    });

    connection.on('close', function (connection) {
        console.log("USER " + user.name +" IS GONE");// close user connection
        users = users.filter(function( obj ) {
            return obj.name !== user.name;
        });
        msg = {
            type: 'clients',
            info: users.length
        }
        sendAll(JSON.stringify(msg))
        msg = {
            type: 'userdisconnected',
            info: {
                name: user.name,
                uid: user.uid
            }
        }
        sendAll(JSON.stringify(msg))
    });
});

function sendAll(msg){
    for(var i = 0; i < users.length; i++){
        users[i].connection.send(msg)
    }               
}