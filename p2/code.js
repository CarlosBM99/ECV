var colors = ["blue", "yellow", "pink", "green"]
var draws = []
var cubes = []
var infoUsername = null;
var uid;

//Scene
var scene, camera, renderer, mesh;
var meshFloor;
var keyboard = {};
var player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02 };
var USE_WIREFRAME = false;
var myX, myY, myZ;
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(100, 1280 / 720, 0.1, 500);

//MY Cube
mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
);
//Set position to 1 in order to not be inside the plane
myX = mesh.position.x;
myY = mesh.position.y += 1;
myZ = mesh.position.z;
// The cube can have shadows cast onto it, and it can cast shadows
mesh.receiveShadow = true;
mesh.castShadow = true;
scene.add(mesh);

function init() {
    identifier = new THREE.Mesh(
        
        new THREE.OctahedronBufferGeometry(0.1),
        new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
    );
    //Set position to 1 in order to not be inside the plane
    identifier.position.x = myX;
    identifier.position.y = 2;
    identifier.position.z = myZ;
    scene.add(identifier);

    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50, 50, 50),
        // MeshBasicMaterial does not react to lighting, so we replace with MeshPhongMaterial
        new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
    );
    //Set the floor as floor
    meshFloor.rotation.x -= Math.PI / 2;
    // Floor can have shadows cast onto it
    meshFloor.receiveShadow = true;
    scene.add(meshFloor);
    // LIGHTS
    ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 0.8, 18);
    light.position.set(-3, 6, -3);
    light.castShadow = true;

    // Will not light anything closer than 0.1 units or further than 25 units
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1280, 720);
    // Enable Shadows in the Renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    var c = document.querySelector(".room")
    c.insertBefore(renderer.domElement, c.firstChild);

    animate();
}
function createMesh() {
    var newMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
    );
    //Set position to 1 in order to not be inside the plane
    newMesh.position.x;
    newMesh.position.y += 1;
    newMesh.position.z;
    // The cube can have shadows cast onto it, and it can cast shadows
    newMesh.receiveShadow = true;
    newMesh.castShadow = true;
    scene.add(newMesh);

    cubes.push(newMesh);
}
function moveCube(uid, x, y, z) {
    cubes[0].mesh.position.x = x;
    cubes[0].mesh.position.y = y;
    cubes[0].mesh.position.z = z;
}
function animate() {
    //Function performed several times per second
    requestAnimationFrame(animate);

    //Give the cube some movement
    //mesh.rotation.x += 0.01;
    //mesh.rotation.y += 0.02;
    identifier.rotation.y += 0.05;

    // Keyboard movement inputs
    if (keyboard[87]) { // W key
        myZ = mesh.position.z + 0.1
        mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'scene',
            x: myX,
            y: myY,
            z: myZ
        }
        socket.send(JSON.stringify(msg))
    }
    if (keyboard[83]) { // S key
        if (mesh.position.y > 0.5) {
            myZ = mesh.position.z - 0.1
            mesh.position.set(myX, myY, myZ)
            identifier.position.set(myX, 2, myZ)
            var msg = {
                type: 'scene',
                x: myX,
                y: myY,
                z: myZ
            }
            socket.send(JSON.stringify(msg))
        }
    }
    if (keyboard[65]) { // A key
        // Redirect motion by 90 degrees
        myX = mesh.position.x + 0.1
        mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'scene',
            x: myX,
            y: myY,
            z: myZ
        }
        socket.send(JSON.stringify(msg))
    }
    if (keyboard[68]) { // D key
        myX = mesh.position.x - 0.1
        mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'scene',
            x: myX,
            y: myY,
            z: myZ
        }
        socket.send(JSON.stringify(msg))
    }

    // Keyboard turn inputs
    if (keyboard[37]) { // left arrow key
        camera.rotation.y -= player.turnSpeed;
    }
    if (keyboard[39]) { // right arrow key
        camera.rotation.y += player.turnSpeed;
    }

    renderer.render(scene, camera);

    //console.log('enviat desde user')
}

//Detect when a key is pressed
function keyDown(event) {
    keyboard[event.keyCode] = true;
}

function keyUp(event) {
    keyboard[event.keyCode] = false;
}
//Wait all the time for any key to be pressed
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

//End of Scene functions


//canvas.addEventListener("mousedown", function (e) {
//    getMousePos(canvas, e)
//}, false);

//Draw the circle in the canvas
//function drawCircle(x, y, color_fill) {
//    ctx.fillStyle = color_fill;
//    ctx.beginPath();
//    if (color_fill !== "white") {
//        ctx.arc(x, y, 40, 0, 2 * Math.PI);
//        ctx.stroke();
//    } else {
//        ctx.arc(x, y, 42, 0, 2 * Math.PI);
//    } 
//    ctx.fill();

//}

//function getMousePos(canvas, evt) {
//    //Send the position of the mouse in the canvas
//    var rect = canvas.getBoundingClientRect(), // abs. size of element
//        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
//        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

//    toX = (evt.clientX - rect.left) * scaleX;
//    toY = (evt.clientY - rect.top) * scaleY;

//    msg = {
//        type: 'canvas',
//        x: toX,
//        y: toY,
//        color: color
//    }
//    socket.send(JSON.stringify(msg))
//}

var enterButton = document.querySelector(".buttonEnter")
enterButton.addEventListener('click', function () {
    enterChat()
})

var inputUserName = document.querySelector(".logUserName")
inputUserName.addEventListener('keydown', function (e) {
    onKey(e, 'username')
})

var inputSendMessage = document.querySelector('.inputText')
inputSendMessage.addEventListener('keydown', function (e) {
    onKey(e, 'sendmessage')
})

var username = document.querySelector('.roomName')
function onKey(e, type) {
    if (e.which === 13) {
        if (type === 'username') {
            if (inputUserName.value !== '') {
                enterChat()
            }
        } else if (type === 'sendmessage') {
            if (inputSendMessage.value !== '') {
                sendMessage()
            }
        }
    }
}

//Sending a message
function sendMessage() {
    console.log('Message SEND')
    var msg = {
        type: "message",
        text: inputSendMessage.value,
        date: Date.now(),
        uid: infoUsername.uid,
        name: infoUsername.name
    };
    socket.send(JSON.stringify(msg))

    var bodyMessages = document.querySelector('.bodyMessages');
    var containerMessageMe = document.createElement('div');
    containerMessageMe.className = 'containerMessageMe'
    var messageMe = document.createElement('div');
    messageMe.className = 'messageMe'
    var userMessageMe = document.createElement('div');
    userMessageMe.className = 'userMessageMe'
    userMessageMe.innerHTML = infoUsername.name
    var messageTextMe = document.createElement('div');
    messageTextMe.className = 'messageTextMe'
    messageTextMe.innerHTML = inputSendMessage.value
    messageMe.appendChild(userMessageMe)
    messageMe.appendChild(messageTextMe)
    containerMessageMe.appendChild(messageMe)
    bodyMessages.appendChild(containerMessageMe)

    //var elem = document.getElementById('messages');
    bodyMessages.scrollTop = bodyMessages.scrollHeight

    inputSendMessage.value = ''
}

//Recieving a message
function recieveMessage(message, type) {
    if (type === 'canvas') {
        console.log('Draw canvas', message)
        //drawCircle(message.x, message.y, message.color)
    }
    else if (type === 'scene') {
        console.log('Recieved scene, lets draw it')
        for (var i = 0; i < draws.length; i++) {
            scene.add(draws[i].mesh)
        }
                
    }else if (type === 'userconnected') {
        console.log('USER CONNECTED: ', message)
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageUserConnected = document.createElement('div')
        containerMessageUserConnected.className = 'containerMessageUserConnected'
        var messageUserConnected = document.createElement('div')
        messageUserConnected.className = 'messageUserConnected'
        messageUserConnected.innerHTML = 'User connected!!'
        containerMessageUserConnected.appendChild(messageUserConnected)
        bodyMessages.appendChild(containerMessageUserConnected)
        bodyMessages.scrollTop = bodyMessages.scrollHeight
    } else if (type === 'userdisconnected') {
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageUserDisconnected = document.createElement('div')
        containerMessageUserDisconnected.className = 'containerMessageUserDisconnected'
        var messageUserDisconnected = document.createElement('div')
        messageUserDisconnected.className = 'messageUserDisconnected'
        messageUserDisconnected.innerHTML = 'User disconnected!!'
        containerMessageUserDisconnected.appendChild(messageUserDisconnected)
        bodyMessages.appendChild(containerMessageUserDisconnected)
        bodyMessages.scrollTop = bodyMessages.scrollHeight

    } else {
        console.log('MessageRecived: ', message)
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageOther = document.createElement('div');
        containerMessageOther.className = 'containerMessageOther'
        var messageOther = document.createElement('div');
        messageOther.className = 'messageOther'
        var userMessageOther = document.createElement('div');
        userMessageOther.className = 'userMessageOther'
        userMessageOther.innerHTML = message.name
        var messageTextOther = document.createElement('div');
        messageTextOther.className = 'messageTextOther'
        messageTextOther.innerHTML = message.text
        messageOther.appendChild(userMessageOther)
        messageOther.appendChild(messageTextOther)
        containerMessageOther.appendChild(messageOther)
        bodyMessages.appendChild(containerMessageOther)
        bodyMessages.scrollTop = bodyMessages.scrollHeight
    }
}

//Socket Functions
var socket = null
var msg = {}
function enterChat() {
    socket = new WebSocket("ws://" + 'localhost:1337/?name=' + inputUserName.value)
    socket.onopen = function () {
        console.log("Socket has been opened :D")
        msg = {
            type: 'login',
            text: 'Hello server'
        }
        this.send(JSON.stringify(msg))
        init()
        //Hola, he entrat i estic al mitj
        var msg = {
            type: 'scene',
            x: 0,
            y: 1,
            z: 0
        }
        socket.send(JSON.stringify(msg))

        var login = document.querySelector('.login')
        login.style.display = 'none'
        var enterRoom = document.querySelector('.room')
        enterRoom.style.display = 'flex'
    }
    socket.addEventListener('close', function (e) {
        console.log("Socket has been closed: ", e)
    })
    socket.onmessage = function (msg) {
        //console.log("Received: " + msg.data)
        var message = JSON.parse(msg.data)
        switch (message.type) {
            case "username":
                infoUsername = message.info
                console.log('USERNAME:', infoUsername.name)
                username.innerHTML = username.innerHTML + ' ' + infoUsername.name
                //Somebody new entered, add his mesh
                cubes.push({
                    uid: infoUsername.uid,
                    mesh: mesh
                })
                moveCube(2,10,1,10)
                console.log('he rebut un mesh', cubes.length)
                break;
            case "clients":
                var numberRoomClients = document.querySelector('.numberRoomClients')
                var info = message.info
                numberRoomClients.innerHTML = info
                break;
            case "scene":                           
                draws = message.draws
                for (var i = 0; draws.length; i++) {
                    draws[i].mesh = cubes[i].mesh;
                }
                
                
                break;
            case "message":
                if (message.info.uid !== infoUsername.uid) {
                    recieveMessage(message.info)
                }
                break;
            case "messages":
                for (var i = 0; i < message.info.length; i++) {
                    recieveMessage(message.info[i])
                }
                break;
            case "userconnected":
                if (message.info.uid !== infoUsername.uid) {
                    recieveMessage(message, message.type)
                }
                break;
            case "userdisconnected":
                if (message.info.uid !== infoUsername.uid) {
                    recieveMessage(message, message.type)
                }
                break;
            case "draws":
                draws = message.draws
                //ctx.clearRect(0, 0, canvas.width, canvas.height);
                for(var i = 0; i< message.draws.length; i++){
                    recieveMessage(message.draws[i], message.draws[i].type)
                }
                break;
        }

    }
    socket.onerror = function (err) {
        console.log("error: ", err)
    }
}