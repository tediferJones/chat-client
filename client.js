// console.log('HELLO FROM CLIENT.JS')
const socket = new WebSocket('ws://localhost:3000')
// console.log(ws)

socket.onmessage = ({ data }) => {
  console.log(data)
}

document.getElementById('send').addEventListener('click', () => {
  socket.send('test message from client')
})
