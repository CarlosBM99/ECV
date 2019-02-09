// Variables
var users = [];
var uid = 0;
var messages = [];
var draws = [];
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

    // Send message user connected do other all
    msg = {
        type: 'userconnected',
        info: {
            name: user.name,
            uid: user.uid
        }
    }
    sendAll(JSON.stringify(msg))
    msg = {
        type: 'draws',
        draws: draws
    }
    console.log('sending messages to the client from server')
    sendAll(JSON.stringify(msg))
    
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
                case "canvas":
                    message.info = {
                        name: user.name,
                        uid: user.uid
                    }
                    console.log('sending message to client: ', message)
                    var v = 0;
                    for(var i = 0; i<draws.length; i++){
                        if(draws[i].info.uid === message.info.uid){
                            draws[i] = message
                            v = 1;
                            console.log('IIIIIINNNNNNNs')
                        }
                    }
                    if(v === 0){
                        draws.push(message)
                    }
                    msg = {
                        type: 'draws',
                        draws: draws
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