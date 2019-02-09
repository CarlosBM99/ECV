var enterButton = document.querySelector(".buttonEnter")
enterButton.addEventListener('click', function(){
    enterChat()
})
var inputUserName = document.querySelector(".logUserName")
inputUserName.addEventListener('keydown', function(e){
    onKey(e, 'username')
})
var inputSendMessage = document.querySelector('.inputText')
inputSendMessage.addEventListener('keydown', function(e){
    onKey(e, 'sendmessage')
})
var username = document.querySelector('.roomName')
var infoUsername = null;
function onKey(e, type){
    if(e.which === 13){
        if(type === 'username'){
            if(inputUserName.value !== ''){
                enterChat()
            }
        } else if(type === 'sendmessage'){
            if(inputSendMessage.value !== ''){
                sendMessage()
            }
        }
    }
}
function sendMessage(){
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
function recieveMessage(message,type) {
    if(type === 'userconnected'){
        console.log('message', message)
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageUserConnected = document.createElement('div')
        containerMessageUserConnected.className = 'containerMessageUserConnected'
        var messageUserConnected = document.createElement('div')
        messageUserConnected.className = 'messageUserConnected'
        messageUserConnected.innerHTML = 'User connected!!'
        containerMessageUserConnected.appendChild(messageUserConnected)
        bodyMessages.appendChild(containerMessageUserConnected)
        bodyMessages.scrollTop = bodyMessages.scrollHeight
    } else if(type === 'userdisconnected'){
        var bodyMessages = document.querySelector('.bodyMessages');
        var containerMessageUserDisconnected = document.createElement('div')
        containerMessageUserDisconnected.className ='containerMessageUserDisconnected'
        var messageUserDisconnected = document.createElement('div')
        messageUserDisconnected.className ='messageUserDisconnected'
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
var socket = null
function enterChat(){
    socket = new WebSocket("ws://" + 'localhost:1337/?name=' + inputUserName.value)
    socket.onopen = function() {
        console.log("Socket has been opened :D")
        var msg = {
            type: 'login',
            text: 'Hello server'
        }
        this.send(JSON.stringify(msg))
        var login = document.querySelector('.login')
        login.style.display = 'none'
        var enterRoom = document.querySelector('.room')
        enterRoom.style.display = 'flex'
    }
    socket.addEventListener('close', function(e){
        console.log("Socket has been closed: ", e)
    })
    socket.onmessage = function(msg){
        //console.log("Received: " + msg.data)
        var message = JSON.parse(msg.data)
        switch(message.type){
            case "username":
                infoUsername = message.info
                console.log(infoUsername.name)
                username.innerHTML = username.innerHTML + ' ' + infoUsername.name
                break;
            case "clients":
                var numberRoomClients = document.querySelector('.numberRoomClients')
                var info = message.info
                console.log(info)
                numberRoomClients.innerHTML = info
                break;
            case "message":
                if(message.info.uid !== infoUsername.uid){
                    recieveMessage(message.info)
                }
                break;
            case "messages":
                for(var i = 0; i<message.info.length; i++){
                    recieveMessage(message.info[i])
                }
                break;
            case "userconnected":
                if(message.info.uid !== infoUsername.uid){
                    recieveMessage(message.info[i],message.type)
                }
                break;
            case "userdisconnected":
                if(message.info.uid !== infoUsername.uid){
                    recieveMessage(message.info[i],message.type)
                }
                break;
        }

        
    }
    socket.onerror = function (err){
        console.log("error: ", err)
    }
}