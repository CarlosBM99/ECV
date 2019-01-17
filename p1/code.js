var button = document.querySelector("button")
var input = document.querySelector("input")
var messages_container = document.querySelector("#messages")
button.addEventListener('click', sendMessage)

var server = new SillyClient();
server.connect('localhost' + ":55000", "CHAT");
server.on_connect = function () {
    console.log('Connected to Server!')
};
server.on_message = function (user_id, message) {
    console.log('User ' + user_id + ' said ' + message);
    recieveMessage(message)

}
function recieveMessage(message) {
    var element = document.createElement('div');
    console.log(input.value)
    element.innerHTML = message
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
    server.sendMessage(input.value)
    input.value = ''
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
}
input.addEventListener('keydown', onKey)

function onKey(e) {
    if (e.which == 13) {
        sendMessage()
    }
}