var button = document.querySelector("button")
var input = document.querySelector("input")
var messages_container = document.querySelector("#messages")
button.addEventListener('click', sendMessage)

function sendMessage() {
    console.log('aaaa')
    var element = document.createElement('div');
    console.log(input.value)
    element.innerHTML = input.value
    element.className = "me"
    messages_container.appendChild(element)
    input.value = ''
    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
}