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
//Localhost
var port = 1337
server.listen(port, function () {
    console.log(`Server ready on port ${port}!`);
});
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

    //On message of type:
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
                    message.cube.name = user.name
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
                            name: message.cubeName,
                            position: message.position
                        }
                    }
                    sendAll(JSON.stringify(msg));
                    break;
            }
        }
    });
    //What to do when someone leaves
    connection.on('close', function (connection) {
        console.log("USER " + user.name +" IS GONE");// close user connection
        users = users.filter(function( obj ) {
            return obj.name !== user.name;
        });
        msg = {
            type: 'clients',
            info: users.length
        }
        for (var i = 0; i < cubes.length; i++) {
            if (cubes[i].uid === user.uid) {
                cubes[i].position.y = -10
            }
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
//Function to actualize every user with the latest information
function sendAll(msg){
    for(var i = 0; i < users.length; i++){
        users[i].connection.send(msg)
    }               
}