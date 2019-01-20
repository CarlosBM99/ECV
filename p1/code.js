var sendButton = document.querySelector("#sendbutton")
var input = document.querySelector("#inputme")
var messages_container = document.querySelector("#messages")
//var back = document.querySelector("#back")
//back.addEventListener('click', backFun)
sendButton.addEventListener('click', sendMessage)
var menu = document.querySelector('#menu')
var fixedUsername = document.querySelector('#fixedUsername')
var inapp = document.querySelector('#inapp')
var rooms = document.querySelector('#rooms')
var onroom = document.querySelector('#onroom')
rooms.addEventListener('click', showRooms)
function showRooms() {
    checkServer()
    menu.style.display = 'inline'
    onroom.style.display = 'none'
}

var server = new SillyClient();

var messages = {}
var logCreate = document.querySelector('#logCreate')
logCreate.addEventListener('click', loginCreate)
var logUserName = document.querySelector('#logUserName')
var userName = document.querySelector('#username')
var logRoomName = document.querySelector('#logRoomName')
logRoomName.addEventListener('keydown', function (e) {
    onKey(e, 'login')
})
var login = document.querySelector('#login')
var user_name = ''
function conncectToServer(roomName, userName) {
    //console.log('ROOM name: ', roomName, 'USER NAME: ', userName)
    server.connect('localhost' + ":55000", roomName);
    //console.log(server.user_name)
}
server.on_ready = function () {
    server.user_name = user_name
    server.clients[server.user_id].name = user_name
    /* setInterval(function(){
        console.log(server.getReport( function (report){
            console.log(report)
        }))
    }) */
}
function loginCreate() {
    if (logUserName.value !== '' && logRoomName.value !== '') {
        user_name = logUserName.value
        conncectToServer(logRoomName.value, logUserName.value)
        userName.innerHTML = logUserName.value
        inapp.style.display = 'flex'
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

document.getElementById('colorSwatch').addEventListener('click', function() {
    color = document.querySelector(':checked').getAttribute('data-color');
}, false);

canvas.addEventListener('mousedown', startDraw, false);
canvas.addEventListener('mousemove', draw, false);
canvas.addEventListener('mouseup', endDraw, false);
// create a flag
var isActive = false;

// array to collect coordinates
var plots = [];
function drawOnCanvas(color,plots) {
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
    sendMessage('canvas', {color: color, plots: plots})
    // empty the array
    plots = [];
}

function draw(e) {
    if (!isActive) return;

    // cross-browser canvas coordinates
    var x = e.offsetX || e.layerX - canvas.offsetLeft;
    var y = e.offsetY || e.layerY - canvas.offsetTop;

    plots.push({ x: x, y: y });

    drawOnCanvas(color,plots);
}
function drawFromStream(message) {
    if(!plots) return;        

    ctx.beginPath();
    drawOnCanvas(message.color, message.plots);
}
server.on_message = function (user_id, message) {
    if (JSON.parse(message).type === 'allmessages') {
        // delete previous messages from another room
        while (messages_container.firstChild) {
            messages_container.removeChild(messages_container.firstChild);
            ctx.fillStyle="#fff";
            ctx.fillRect(0,0,canvas.width, canvas.height);
        }
        //console.log('we got it')
        let roomname = server.room.name
        messages[roomname] = JSON.stringify(message).msg
        //console.log(JSON.stringify(message).msg)
        for (var i in JSON.parse(message).msg) {
            //console.log(JSON.parse(message).msg[i])
            recieveMessage(JSON.parse(message).msg[i])
            //console.log(JSON.parse(message).msg[i])
        }
    } else {
        //console.log('User ' + user_id + ' said ' + message);
        recieveMessage(message)
    }
}
checkRoomInfo()
function checkRoomInfo() {
    //console.log('EEEEE')
    server.on_room_info = function (info) {
        //to know which users are inside
        //console.log('innnnn')
        //console.log('ROOOOM infoooo')
        //console.log(info)
        var nameroom = document.querySelector('#nameroom')
        nameroom.innerHTML = info.name
        var clients = document.querySelector('#clients')
        clients.innerText = info.clients.length
    };
}
function checkServer() {
    server.getReport(function (report) {
        //console.log('REPORT: ', report)
        //console.log('REPORT: ', report.rooms)
        var contlistrooms = document.querySelector('#contlistrooms')
        var checkListrooms = document.querySelector('#listrooms')
        if (checkListrooms) {
            contlistrooms.removeChild(checkListrooms)
        }
        var listrooms = document.createElement('div')
        listrooms.className = 'listrooms'
        listrooms.setAttribute('id', 'listrooms')
        for (var room in report.rooms) {
            var div = document.createElement('div')
            div.style.display = 'flex'
            var nameRoom = document.createElement('div')
            var separator = document.createElement('div')
            nameRoom.style.flexDirection = 'row'
            var numberUsers = document.createElement('div')
            numberUsers.style.paddingLeft = '10px'
            //console.log(room)
            if (room !== '') {
                //console.log('yea->', room)
                nameRoom.innerHTML = room
                separator.innerHTML = ' -> '
                nameRoom.addEventListener('click', enterRoom)
                numberUsers.innerHTML = report.rooms[room]
                numberUsers.setAttribute('id', 'numberusers')
                div.appendChild(nameRoom)
                div.appendChild(separator)
                div.appendChild(numberUsers)
                listrooms.appendChild(div)
            }
            contlistrooms.appendChild(listrooms)
        }
    })
}
server.on_user_connected = function (user_id) {
    checkServer()
    checkRoomInfo()
    //console.log('yep')
    var user_con = document.createElement('div')
    user_con.className = 'contflex'
    var user_con2 = document.createElement('div')
    user_con2.className = 'userConnected'
    user_con2.innerHTML = 'New User: ' + server.clients[user_id].name + '!!'
    //console.log(server.clients)
    user_con.appendChild(user_con2)
    messages_container.appendChild(user_con)
    var numberusers = document.querySelector('#clients')
    //console.log('NUMBER: ', numberusers)
    var num = parseInt(numberusers.innerHTML) + 1
    //console.log(num)
    numberusers.innerHTML = num
    // send the messages to the new user
    let message = { type: "allmessages", msg: messages[server.room.name], user: server.user_name }
    server.sendMessage(message, user_id)
}
server.on_user_disconnected = function (user_id) {
    checkServer()
    checkRoomInfo()
    //console.log('yep')
    var user_con = document.createElement('div')
    user_con.className = 'contflex'
    var user_con2 = document.createElement('div')
    user_con2.className = 'userDisconnected'
    user_con2.innerHTML = 'User disconnected: ' + 'user_' + user_id + '!!'
    user_con.appendChild(user_con2)
    messages_container.appendChild(user_con)
    var numberusers = document.querySelector('#clients')
    //console.log('NUMBER: ', numberusers)
    var num = parseInt(numberusers.innerHTML) - 1
    //console.log(num)
    numberusers.innerHTML = num
    // send the messages to the new user
    //let message = { type: "allmessages", msg: messages[server.room.name], user: server.user_name }
    //server.sendMessage(message, user_id)
}

function enterRoom(event) {
    //console.log('EVENT', event.target.innerHTML)
    let name = event.target.innerHTML
    //console.log('EYYYYY', name)
    //var menu = document.querySelector('#menu')
    //check actual room
    if (!(name === server.room.name)) {
        conncectToServer(name)
    }
    menu.style.display = 'none'
    //var onroom = document.querySelector('#onroom')
    onroom.style.display = 'inline'
}

function recieveMessage(message) {
    if (JSON.parse(message).type !== 'canvas') {
        //console.log('MESSAGE: ',message)
        var element = document.createElement('div');
        //console.log(input.value)
        var childElement = document.createElement('div')
        var childElement2 = document.createElement('div')
        childElement.className = 'name'
        childElement.innerHTML = JSON.parse(message).user
        element.appendChild(childElement)
        element.className = "message"
        childElement2.innerHTML = JSON.parse(message).msg
        element.appendChild(childElement2)
        messages_container.appendChild(element)
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

function sendMessage(type,mes) {
    if (type !== 'canvas') {
        //console.log('e: ', server.user_name)
        var element = document.createElement('div');
        //console.log(input.value)
        var childElement = document.createElement('div')
        var childElement2 = document.createElement('div')
        childElement.className = 'myname'
        childElement.innerHTML = server.user_name
        element.appendChild(childElement)
        childElement2.innerHTML = input.value
        element.className = "me"
        element.appendChild(childElement2)
        //element.insertBefore(childElement, eElement.firstChild);
        messages_container.appendChild(element)
        let message = { type: "msg", msg: input.value, user: server.user_name }
        server.sendMessage(message)
        //console.log('rooooom name: ',)
        let roomname = server.room.name
        if (messages[roomname]) {
            messages[roomname].push(JSON.stringify(message))
        } else {
            messages[roomname] = []
            messages[roomname].push(JSON.stringify(message))
        }
        //console.log(messages)
        input.value = ''
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }
    else {
        //console.log('CANVAAAAS')
        let message = { type: type, msg: mes, user: server.user_name }
        server.sendMessage(message)
    }
}
input.addEventListener('keydown', function (e) {
    onKey(e, 'inputme')
})

function onKey(e, type) {
    //console.log(type)
    //Enter Key
    if (e.which == 13) {
        if (type === 'inputme') {
            sendMessage()
        }
        else if (type === 'login') {
            loginCreate()
        }
    }
}