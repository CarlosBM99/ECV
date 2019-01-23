var sendButton = document.querySelector(".sendButton")
var input = document.querySelector(".inputText")
var bodyMessages = document.querySelector(".bodyMessages")
sendButton.addEventListener('click', function() {
    if(input.value !== ''){
        sendMessage()
    }
})
//var menu = document.querySelector('#menu')
var inapp = document.querySelector('.content')
var header = document.querySelector('.header')
//var rooms = document.querySelector('#rooms')
//var onroom = document.querySelector('#onroom')
var refreshRooms = document.querySelector('.refreshRooms')
refreshRooms.addEventListener('click', showRooms)

function showRooms() {
    console.log('YESO')
    checkServer()
    // menu.style.display = menu.style.display === 'inline' ? 'none' : 'inline'
    // onroom.style.display = onroom.style.display === 'none' ? 'inline' : 'none'
}

var server = new SillyClient();

var messages = {}
var logCreate = document.querySelector('#logCreate')
logCreate.addEventListener('click', loginCreate)
var logUserName = document.querySelector('#logUserName')
var userName = document.querySelector('.user')
var logRoomName = document.querySelector('#logRoomName')
logRoomName.addEventListener('keydown', function (e) {
    onKey(e, 'login')
})
var login = document.querySelector('.login')
var user_name = ''
function conncectToServer(roomName, userName) {
    //server.connect("ecv-etic.upf.edu:9000", roomName);
    //server.connect("tamats.com:55000", roomName);
    server.connect("localhost:55000", roomName);
}
server.on_ready = function () {
    server.user_name = user_name
    server.clients[server.user_id].name = user_name
}
function loginCreate() {
    if (logUserName.value !== '' && logRoomName.value !== '') {
        user_name = logUserName.value
        conncectToServer(logRoomName.value, logUserName.value)
        userName.innerHTML = logUserName.value
        inapp.style.display = 'flex'
        header.style.display = 'flex'
        login.style.display = 'none'
    }
}
server.on_connect = function () {
    console.log('Connected to Server!')
    checkServer()
};

var canvas = document.querySelector('#drawCanvas');
var ctx = canvas.getContext('2d');
var color = document.querySelector(':checked').getAttribute('data-color');
ctx.strokeStyle = color;
ctx.lineWidth = '3';
ctx.lineCap = ctx.lineJoin = 'round';

document.getElementById('colorSwatch').addEventListener('click', function () {
    color = document.querySelector(':checked').getAttribute('data-color');
}, false);

canvas.addEventListener('mousedown', startDraw, false);
canvas.addEventListener('mousemove', draw, false);
canvas.addEventListener('mouseup', endDraw, false);
//create a flag
var isActive = false;

//array to collect coordinates
var plots = [];
function drawOnCanvas(color, plots) {
    if (color === 'white') {
        ctx.lineWidth = '10';
    } else {
        ctx.lineWidth = '3';
    }
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(plots[0].x, plots[0].y);

    for (var i = 1; i < plots.length; i++) {
        ctx.lineTo(plots[i].x, plots[i].y);
    }
    ctx.stroke();
}
function startDraw(e) {
    isActive = true;
}

function endDraw(e) {
    isActive = false;
    sendMessage('canvas', { color: color, plots: plots })
    //empty the array
    plots = [];
}

function draw(e) {
    if (!isActive) return;

    //cross-browser canvas coordinates
    var x = e.offsetX || e.layerX - canvas.offsetLeft;
    var y = e.offsetY || e.layerY - canvas.offsetTop;

    plots.push({ x: x, y: y });

    drawOnCanvas(color, plots);
}
function drawFromStream(message) {
    if (!plots) return;

    ctx.beginPath();
    drawOnCanvas(message.color, message.plots);
}
server.on_message = function (user_id, message) {
    console.log('AAAAAA- All messages')
    if (JSON.parse(message).type === 'allmessages') {
        //delete previous messages from another room
        console.log('AAAAAA- All messages')
        while (bodyMessages.firstChild) {
            bodyMessages.removeChild(bodyMessages.firstChild);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        let roomname = server.room.name
        messages[roomname] = JSON.stringify(message).msg
        for (var i in JSON.parse(message).msg) {
            recieveMessage(JSON.parse(message).msg[i])
        }
    } else {
        recieveMessage(message)
    }
}
checkRoomInfo()
function checkRoomInfo() {
    server.on_room_info = function (info) {
        //to know which users are inside
        var nameroom = document.querySelector('.roomName')
        nameroom.innerHTML = info.name
        var clients = document.querySelector('.numberRoomClients')
        clients.innerText = info.clients.length
    };
}
function checkServer() {
    server.getReport(function (report) {
        var checkListrooms = document.querySelector('#listrooms')
        var rooms = document.querySelector('.rooms')
        if (checkListrooms) {
            rooms.removeChild(checkListrooms)
        }
        var listrooms = document.createElement('div')
        listrooms.setAttribute('id', 'listrooms')
        for (var room in report.rooms) {
            var divCont = document.createElement('div')
            var divRoom = document.createElement('div')
            divRoom.className = 'room'
            var nameRoom = document.createElement('div')
            var separator = document.createElement('div')
            var numberUsers = document.createElement('div')
            if (room !== '') {
                nameRoom.innerHTML = room
                separator.innerHTML = ': '
                numberUsers.innerHTML = report.rooms[room]
                nameRoom.addEventListener('click', enterRoom)
                divRoom.appendChild(nameRoom)
                divRoom.appendChild(separator)
                divRoom.appendChild(numberUsers)
                divCont.appendChild(divRoom)
                listrooms.appendChild(divCont)
            }
        }
        rooms.appendChild(listrooms)
    })
}
server.on_user_connected = function (user_id) {
    checkServer()
    checkRoomInfo()
    var containerMessageUserConnected = document.createElement('div')
    containerMessageUserConnected.className = 'containerMessageUserConnected'
    var messageUserConnected = document.createElement('div')
    messageUserConnected.className = 'messageUserConnected'
    messageUserConnected.innerHTML = 'User connected: ' + 'user_' + user_id + '!!'
    containerMessageUserConnected.appendChild(messageUserConnected)
    bodyMessages.appendChild(containerMessageUserConnected)
    var numberusers = document.querySelector('.numberRoomClients')
    var num = parseInt(numberusers.innerHTML) + 1
    numberusers.innerHTML = num
    //send the messages to the new user
    let message = { type: "allmessages", msg: messages[server.room.name], user: server.user_name }
    server.sendMessage(message, user_id)
    bodyMessages.scrollTop = elem.scrollHeight
}
server.on_user_disconnected = function (user_id) {
    checkServer()
    checkRoomInfo()
    //var user_con = document.createElement('div')
    //var user_con2 = document.createElement('div')
    //user_con2.className = 'userDisconnected'
    //user_con2.innerHTML = 'User disconnected: ' + 'user_' + user_id + '!!'
    //user_con.appendChild(user_con2)
    var containerMessageUserDisconnected = document.createElement('div')
    containerMessageUserDisconnected.className ='containerMessageUserDisconnected'
    var messageUserDisconnected = document.createElement('div')
    messageUserDisconnected.className ='messageUserDisconnected'
    messageUserDisconnected.innerHTML = 'User disconnected: ' + 'user_' + user_id + '!!'
    containerMessageUserDisconnected.appendChild(messageUserDisconnected)
    bodyMessages.appendChild(containerMessageUserDisconnected)
    var numberusers = document.querySelector('.numberRoomClients')
    var num = parseInt(numberusers.innerHTML) - 1
    numberusers.innerHTML = num
    // send the messages to the new user
    bodyMessages.scrollTop = elem.scrollHeight
}

function enterRoom(event) {
    let name = event.target.innerHTML
    //check actual room
    if (!(name === server.room.name)) {
        conncectToServer(name)
    }
}

function recieveMessage(message) {
    if (JSON.parse(message).type !== 'canvas') {
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageOther = document.createElement('div');
        containerMessageOther.className = 'containerMessageOther'
        var messageOther = document.createElement('div');
        messageOther.className = 'messageOther'
        var userMessageOther = document.createElement('div');
        userMessageOther.className = 'userMessageOther'
        userMessageOther.innerHTML = JSON.parse(message).user
        var messageTextOther = document.createElement('div');
        messageTextOther.className = 'messageTextOther'
        messageTextOther.innerHTML = JSON.parse(message).msg
        messageOther.appendChild(userMessageOther)
        messageOther.appendChild(messageTextOther)
        containerMessageOther.appendChild(messageOther)
        bodyMessages.appendChild(containerMessageOther)

        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight
        let roomname = server.room.name
        if (messages[roomname]) {
            messages[roomname].push(message)
        } else {
            messages[roomname] = []
            messages[roomname].push(message)
        }
    } else {
        drawFromStream(JSON.parse(message).msg)
    }

}

function sendMessage(type, mes) {
    if (type !== 'canvas') {
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageMe = document.createElement('div');
        containerMessageMe.className = 'containerMessageMe'
        var messageMe = document.createElement('div');
        messageMe.className = 'messageMe'
        var userMessageMe = document.createElement('div');
        userMessageMe.className = 'userMessageMe'
        userMessageMe.innerHTML = server.user_name
        var messageTextMe = document.createElement('div');
        messageTextMe.className = 'messageTextMe'
        messageTextMe.innerHTML = input.value
        messageMe.appendChild(userMessageMe)
        messageMe.appendChild(messageTextMe)
        containerMessageMe.appendChild(messageMe)
        bodyMessages.appendChild(containerMessageMe)
        let message = { type: "msg", msg: input.value, user: server.user_name }
        server.sendMessage(message)
        let roomname = server.room.name
        if (messages[roomname]) {
            messages[roomname].push(JSON.stringify(message))
        } else {
            messages[roomname] = []
            messages[roomname].push(JSON.stringify(message))
        }
        input.value = ''
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
    else {
        let message = { type: type, msg: mes, user: server.user_name }
        server.sendMessage(message)
    }
}
input.addEventListener('keydown', function (e) {
    onKey(e, 'inputme')
})

function onKey(e, type) {
    //Enter Key
    if (e.which == 13) {
        if (type === 'inputme') {
            if(input.value !== ''){
                sendMessage()
            }
        }
        else if (type === 'login') {
            loginCreate()
        }
    }
} 