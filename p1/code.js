//var button = document.querySelector("button")
var input = document.querySelector("input")
var messages_container = document.querySelector("#messages")
var back = document.querySelector("#back")
back.addEventListener('click', backFun)
//button.addEventListener('click', sendMessage)
var menu = document.querySelector('#menu')
var onroom = document.querySelector('#onroom')
var menuCreateRoom = document.querySelector('#menucreateroom')
//menuCreateRoom.addEventListener('click', showCreateRoom)
//var createRoom = document.querySelector('#createroom')
//var buttonCreateRoom = document.querySelector('#buttoncreateroom')
//buttonCreateRoom.addEventListener('click', ButCreateRoom)
//var inputCreateRoom = document.querySelector('#inputcreateroom')
var server = new SillyClient();
//conncectToServer('')

var logCreate = document.querySelector('#logCreate')
logCreate.addEventListener('click', loginCreate)
var logUserName = document.querySelector('#logUserName')
var userName = document.querySelector('#username')
var logRoomName = document.querySelector('#logRoomName')
var login = document.querySelector('#login')
function conncectToServer(roomName, userName) {
    console.log('ROOM name: ', roomName)
    server.connect('localhost' + ":55000", roomName);
    server.user_name = userName
}
function loginCreate() {
    if (logUserName.value !== '' && logRoomName.value !== '') {
        conncectToServer(logRoomName.value, logUserName.value)
        userName.innerHTML = logUserName.value
        menu.style.display = 'inline'
        login.style.display = 'none'

    }
}
server.on_connect = function () {
    console.log('Connected to Server!')
    checkServer()
};

function ButCreateRoom() {
    //console.log('AAA')
    if (inputCreateRoom.value !== '') {
        //console.log('yea')
        conncectToServer(inputCreateRoom.value)
        createRoom.style.display = 'none'
        onroom.style.display = 'inline'
    }
}
function showCreateRoom() {
    menu.style.display = 'none'
    createRoom.style.display = 'inline'
}
function backFun() {
    checkServer()
    menu.style.display = 'inline'
    onroom.style.display = 'none'
}

//server.on_user_connected = function (user_id) {
//    console.log('User ' + user_id + ' has entered the room');
//    var element = document.createElement('div');
//    element.className = "info"
//    messages_container.appendChild(element)
//    server.sendMessage({ type: "msg", msg: 'User ' + user_id + ' has entered the room' })
//    input.value = ''
//    var elem = document.getElementById('messages');
//    elem.scrollTop = elem.scrollHeight;
//}

/* server.on_user_disconnected = function (user_id) {
    console.log('User ' + user_id + ' has left the room');
    var element = document.createElement('div');
    console.log(input.value)
    element.innerHTML = "Good Bye from " + user_id
    element.className = "message"
    messages_container.appendChild(element)
    server.sendMessage({ type: "msg", msg: "Good Bye!" })
    input.value = ''
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
} */
server.on_message = function (user_id, message) {
    console.log('User ' + user_id + ' said ' + message);
    recieveMessage(message)
}
server.on_room_info = function (info) {
    //to know which users are inside
    //console.log('ROOOOM infoooo')
    //console.log(info.name)
    var nameroom = document.querySelector('#nameroom')
    nameroom.innerHTML = info.name
    var clients = document.querySelector('#clients')
    clients.innerHTML = info.clients.length
};
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
            nameRoom.style.flexDirection = 'row'
            var numberUsers = document.createElement('div')
            numberUsers.style.paddingLeft = '10px'
            //console.log(room)
            if (room !== '') {
                console.log('yea->', room)
                nameRoom.innerHTML = room
                numberUsers.innerHTML = '-> ' + report.rooms[room]
                div.appendChild(nameRoom)
                div.appendChild(numberUsers)
                div.addEventListener('click', enterRoom)
                listrooms.appendChild(div)
            }
            contlistrooms.appendChild(listrooms)
        }
    })
}
server.on_user_connected = function(){
    checkServer()
    console.log('yep')
}

function enterRoom(event) {
    console.log(event.target.innerHTML)
    let name = event.target.innerHTML
    //console.log('EYYYYY', name)
    //var menu = document.querySelector('#menu')
    conncectToServer(name)
    menu.style.display = 'none'
    //var onroom = document.querySelector('#onroom')
    onroom.style.display = 'inline'
}
function recieveMessage(message) {
    var element = document.createElement('div');
    console.log(input.value)
    element.innerHTML = JSON.parse(message).msg
    element.className = "message"
    messages_container.appendChild(element)
    input.value = ''
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
}

function sendMessage() {
    var element = document.createElement('div');
    console.log(input.value)
    element.innerHTML = input.value
    element.className = "me"
    messages_container.appendChild(element)
    server.sendMessage({ type: "msg", msg: input.value })
    input.value = ''
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
}
input.addEventListener('keydown', onKey)

function onKey(e) {
    //Enter Key
    if (e.which == 13) {
        sendMessage()
    }
}