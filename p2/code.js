var enterButton = document.querySelector(".buttonEnter")
enterButton.addEventListener('click', function(){
    enterChat()
})
var inputUserName = document.querySelector(".logUserName")
inputUserName.addEventListener('keydown', function(e){
    onKey(e, 'username')
})
function onKey(e, type){
    if(e.which === 13){
        if(type === 'username'){
            if(inputUserName.value !== ''){
                enterChat()
            }
        }
    }
}
var socket = null

function enterChat(){
    socket = new WebSocket("ws://" + 'localhost:1337/?name=' + inputUserName.value)
    socket.onopen = function() {
        console.log("Socket has been opened :D")
        this.send("Hello server")
    }
    socket.addEventListener('close', function(e){
        console.log("Socket has been closed: ", e)
    })
    socket.onmessage = function(msg){
        console.log("Received: " + msg.data)
    }
    socket.onerror = function (err){
        console.log("error: ", err)
    }
}