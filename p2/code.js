var cubes = []
var infoUsername = null;
var uid;
var isTyping = false;
//Scene
var scene, camera, renderer, mesh, floorTexture;
var meshFloor;
var INTERSECTED;
var keyboard = {};
var player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02 };
var USE_WIREFRAME = false;
var myX, myY, myZ;
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(100, 1280 / 720, 0.1, 500);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var speed = 100;
var elapsed = 0.01;
var moving = false;
var toX, toZ, aux;
function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    console.log('clicked')
    moving = true;
    aux = 0;
    //console.log(scene)
}

function render() {

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        if (aux === 0){
            //console.log('Intersect:', intersects, 'x:', intersects[0].point.x, 'myX: ', myX, 'z:', intersects[0].point.z, 'myZ:', myZ)
            console.log('Intersect:', intersects[0])
            toX = intersects[0].point.y
            toZ = intersects[0].point.z
            console.log('x:', toX,'y:',intersects[0].point.y, 'z:',toZ)
            aux = 1;
        }
        teleportMyCubeTo()
        //intersects = null

    } else {
        if (INTERSECTED) {
        }
    }

    renderer.render(scene, camera);

}

window.onmouseup = function (e) {
    onMouseMove(e)
}



function init() {
    var texture = new THREE.TextureLoader().load("textures/floor.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50, 50, 50),
        // MeshBasicMaterial does not react to lighting, so we replace with MeshPhongMaterial
        new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME, map: texture })
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
    window.requestAnimationFrame(render);
    animate();
}

function addMeToScene() {
    //My Cube
    mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
    );
    //Set position y to 1 in order to not be inside the plane
    myX = mesh.position.x;
    myY = mesh.position.y += 1;
    myZ = mesh.position.z;
    camera.position.set(myX, myY + 2, myZ - 5)
    // The cube can have shadows cast onto it, and it can cast shadows
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);

    identifier = new THREE.Mesh(
        new THREE.OctahedronBufferGeometry(0.1),
        new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
    );
    //Set position to 1 in order to not be inside the plane
    identifier.position.x = myX;
    identifier.position.y = 2;
    identifier.position.z = myZ;
    scene.add(identifier);
}

function createMesh(x, y, z) {
    var newMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0x444444, wireframe: USE_WIREFRAME })
    );
    //Set position to 1 in order to not be inside the plane
    newMesh.position.x = x;
    newMesh.position.y = y;
    newMesh.position.z = z;
    // The cube can have shadows cast onto it, and it can cast shadows
    newMesh.receiveShadow = true;
    newMesh.castShadow = true;
    scene.add(newMesh);
    return newMesh;
}

async function createName(name, x, y, z, uid) {
    var loader = new THREE.FontLoader();
    var text = undefined
    var a = await loader.load('fonts/helvetiker_regular.typeface.json', async function (font) {
        var geometry = new THREE.TextGeometry(name, {
            font: font,
            size: 0.5,
            height: 0.01,
        });
        text = new THREE.Mesh(geometry);
        text.position.set(x + 0.5, y + 1, z)
        text.rotation.y -= Math.PI
        scene.add(text)
        for (var i = 0; i < cubes.length; i++) {
            if (cubes[i].uid === uid) {
                cubes[i].meshName = {}
                cubes[i].meshName.mesh = text
                cubes[i].meshName.position = {
                    x: cubes[i].position.x,
                    y: cubes[i].position.y,
                    z: cubes[i].position.z
                }
            }
        }
        return await text;
    })
    return a;
}
function teleportMyCubeTo() {
    if (moving === true) {
        if (Math.floor(myX) < Math.floor(toX)) {
            myX = mesh.position.x + 0.1
        } else if (Math.floor(myX) > Math.floor(toX)) {
            myX = mesh.position.x - 0.1
        } else {
            if (Math.floor(myZ) < Math.floor(toZ)) {
                myZ = mesh.position.z + 0.1
            } else if (Math.floor(myZ) > Math.floor(toZ)) {
                myZ = mesh.position.z - 0.1
            } else {
                moving = false
            }
            mesh.position.set(myX, myY, myZ)
            identifier.position.set(myX, 2, myZ)
        }
        var msg = {
            type: 'actualizeCube',
            cubeUid: infoUsername.uid,
            cubeName: infoUsername.name,
            position: {
                x: myX,
                y: myY,
                z: myZ
            }
        }
        socket.send(JSON.stringify(msg))
        camera.position.set(myX, myY + 2, myZ - 5)
        
        /* mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'actualizeCube',
            cubeUid: infoUsername.uid,
            cubeName: infoUsername.name,
            position: {
                x: myX,
                y: myY,
                z: myZ
            }
        }
        socket.send(JSON.stringify(msg))
        camera.position.set(myX, myY + 2, myZ - 5) */
    }
}
function moveCubeTo(cube) {
    for (var i = 0; i < cubes.length; i++) {
        if (cube.uid === cubes[i].uid) {
            cubes[i].position = cube.position
            cubes[i].mesh.position.set(cube.position.x, cube.position.y, cube.position.z);
            cubes[i].meshName.mesh.position.set(cube.position.x + 0.5, cube.position.y + 1, cube.position.z);
            cubes[i].meshName.position = cube.position
        }
    }
}

function addCubeToScene(cube, i) {
    var userMesh = createMesh(cube.position.x, cube.position.y, cube.position.z)
    var userNameMesh = createName(cube.name, cube.position.x, cube.position.y, cube.position.z, cube.uid)
    cubes[i].mesh = userMesh
}

function drawScene() {
    for (var i = 0; i < cubes.length; i++) {
        addCubeToScene(cubes[i], i)
    }
}

function newCube(cube) {
    var mymeshname = createName(cube.name, cube.position.x, cube.position.y, cube.position.z, cube.uid)
    var mymesh = createMesh(cube.position.x, cube.position.y, cube.position.z)
    cube.mesh = mymesh
    console.log("Cube name: ", cube.name)
    cubes.push(cube)
}

function removeCube(uid) {
    for (var i = 0; i < cubes.length; i++) {
        if (cubes[i].uid === uid) {
            cubes[i].mesh.position.y = -10;
            cubes[i].meshName.mesh.position.y = -10;
        }
    }

}

function animate() {
    render();

    //Function performed several times per second
    requestAnimationFrame(animate);
    // Keyboard movement inputs
    if (keyboard[87] && !isTyping) { // W key
        myZ = mesh.position.z + 0.1
        mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'actualizeCube',
            cubeUid: infoUsername.uid,
            cubeName: infoUsername.name,
            position: {
                x: myX,
                y: myY,
                z: myZ
            }
        }
        socket.send(JSON.stringify(msg))
        camera.position.set(myX, myY + 2, myZ - 5)
    }
    if (keyboard[83] && !isTyping) { // S key
        if (mesh.position.y > 0.5) {
            myZ = mesh.position.z - 0.1
            mesh.position.set(myX, myY, myZ)
            identifier.position.set(myX, 2, myZ)
            var msg = {
                type: 'actualizeCube',
                cubeUid: infoUsername.uid,
                cubeName: infoUsername.name,
                position: {
                    x: myX,
                    y: myY,
                    z: myZ
                }
            }
            socket.send(JSON.stringify(msg))
            camera.position.set(myX, myY + 2, myZ - 5)

        }
    }
    if (keyboard[65] && !isTyping) { // A key
        // Redirect motion by 90 degrees
        myX = mesh.position.x + 0.1
        mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'actualizeCube',
            cubeUid: infoUsername.uid,
            cubeName: infoUsername.name,
            position: {
                x: myX,
                y: myY,
                z: myZ
            }
        }
        socket.send(JSON.stringify(msg))
        camera.position.set(myX, myY + 2, myZ - 5)

    }
    if (keyboard[68] && !isTyping) { // D key
        myX = mesh.position.x - 0.1
        mesh.position.set(myX, myY, myZ)
        identifier.position.set(myX, 2, myZ)
        var msg = {
            type: 'actualizeCube',
            cubeUid: infoUsername.uid,
            cubeName: infoUsername.name,
            position: {
                x: myX,
                y: myY,
                z: myZ
            }
        }
        socket.send(JSON.stringify(msg))
        camera.position.set(myX, myY + 2, myZ - 5)

    }

    /* // Keyboard turn inputs
    if (keyboard[37]) { // left arrow key
        camera.rotation.y -= player.turnSpeed;
    }
    if (keyboard[39]) { // right arrow key
        camera.rotation.y += player.turnSpeed;
    } */

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
inputSendMessage.onblur = function () {
    isTyping = false;
}
inputSendMessage.onfocus = function () {
    isTyping = true;
}
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
    bodyMessages.scrollTop = bodyMessages.scrollHeight
    inputSendMessage.value = ''
}

//Recieving a message
function recieveMessage(message, type) {
    if (type === 'userconnected') {
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
function addMeToServer() {
    msg = {
        type: 'addNewCube',
        cube: {
            position: {
                x: myX,
                y: myY,
                z: myZ
            }
        }
    }
    socket.send(JSON.stringify(msg))
}
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
        var login = document.querySelector('.login')
        login.style.display = 'none'
        var enterRoom = document.querySelector('.room')
        enterRoom.style.display = 'flex'
    }
    socket.addEventListener('close', function (e) {
        console.log("Socket has been closed: ", e)
    })
    socket.onmessage = function (msg) {
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
                break;
            case "clients":
                var numberRoomClients = document.querySelector('.numberRoomClients')
                var info = message.info
                numberRoomClients.innerHTML = info
                break;
            case "scene":
                cubes = message.cubes
                addMeToScene()
                drawScene()
                addMeToServer()
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
                    removeCube(message.info.uid)
                    recieveMessage(message, message.type)
                }
                break;
            case "actualizeCubes":
                if (message.cube.uid !== infoUsername.uid) {
                    newCube(message.cube)
                }
                break;
            case "moveCubeTo":
                if (message.cube.uid !== infoUsername.uid) {
                    moveCubeTo(message.cube)
                }
                break;
        }
    }
    socket.onerror = function (err) {
        console.log("error: ", err)
    }
}