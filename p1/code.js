var button = document.querySelector("button")
var input = document.querySelector("input")
var messages_container = document.querySelector("#messages")
button.addEventListener('click', sendMessage)

var server = new SillyClient();
server.connect('localhost' + ":55000");
server.on_connect = function () {
    console.log('Connected to Server!')
};
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

server.on_user_disconnected = function (user_id) {
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
}
server.on_message = function (user_id, message) {
    console.log('User ' + user_id + ' said ' + message);
    recieveMessage(message)
}
server.on_room_info = function (info) {
    //to know which users are inside
    console.log(info)
};
server.getReport(function (report) { console.log(report) });

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