// console.log('HELLO FROM CLIENT.JS')
const socket = new WebSocket('ws://localhost:3000')
// console.log(ws)

socket.onmessage = ({ data }) => {
  console.log(data)
  data.text().then(data => {
    // console.log(str)
    const newMessage = JSON.parse(data);
    const container = document.createElement('li')
    container.textContent = newMessage.author + ': ' + newMessage.message;
    document.getElementById('chatHistory').appendChild(container)
  })
}

document.getElementById('send').addEventListener('click', () => {
  // console.log(document.getElementById('newMessage').value)
  // socket.send('test message from client')
  // socket.send(document.getElementById('newMessage').value)
  data = JSON.stringify({
    message: document.getElementById('newMessage').value,
    author: 'someAuthor'
  })
  socket.send(data)
})
