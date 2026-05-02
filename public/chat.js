const socket = io();
let currentRoom = 'general';

function joinRoom() {
    currentRoom = document.getElementById('room-select').value;
    socket.emit('join room', currentRoom);
    document.getElementById('messages').innerHTML = '';
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;
    socket.emit('chat message', { room: currentRoom, text });
    input.value = '';
    console.log(currentRoom)

}

socket.on('message history', (messages) => {
    messages.forEach(addMessage);
});

socket.on('chat message', (msg) => {
    addMessage(msg);
});

function addMessage(msg) {
    const li = document.createElement('li');
    li.textContent = `[${msg.room}] ${msg.username}: ${msg.text}`;
    document.getElementById('messages').appendChild(li);
}

window.onload = () => joinRoom();