// THIS LINE MUST MATCH IN home.js
// const socket = new WebSocket('ws://localhost:8000')
// console.log(ws)
let socket;
let username = '';
let server = '';

document.querySelector('#connect').addEventListener('click', (e) => {
  e.preventDefault();
  // const username = document.querySelector('#username').value
  // const server = document.querySelector('#server').value
  username = document.querySelector('#username').value
  server = document.querySelector('#server').value
  console.log(username, server);
  // test = 
  // socket = new WebSocket('ws://localhost:8000', JSON.stringify({ username, server }))
  if (socket) {
    socket.close();
  }
  socket = new WebSocket('ws://localhost:8000', `${server}-${username}`)
  // socket = new WebSocket('ws://localhost:8000', ['one-two']);

  socket.onmessage = ({ data }) => {
    console.log(data)
    data.text().then(data => {
      // console.log(str)
      const newMessage = JSON.parse(data);
      const container = document.createElement('li')
      container.textContent = newMessage.username + ': ' + newMessage.message;
      document.querySelector('#chatHistory').appendChild(container)
    })
  }
  // window.location.href = '/chat'

  // fetch(path + '?' + new URLSearchParams(body), { method })
  // fetch('/connect' + '?' + new URLSearchParams({ username, server }))
  //   // .then(data => console.log(data))
  //   .then(res => res.json())
  //   .then(data => console.log(data))
  
  // Use a fetch request?
  // If server returns true, go to chat
  // Else return some error
})

// socket.onmessage = ({ data }) => {
//   console.log(data)
//   data.text().then(data => {
//     // console.log(str)
//     const newMessage = JSON.parse(data);
//     const container = document.createElement('li')
//     container.textContent = newMessage.author + ': ' + newMessage.message;
//     document.getElementById('chatHistory').appendChild(container)
//   })
// }

document.querySelector('#send').addEventListener('click', (e) => {
  // console.log(document.getElementById('newMessage').value)
  // socket.send('test message from client')
  // socket.send(document.getElementById('newMessage').value)
  e.preventDefault();
  if (username && server) {
    data = JSON.stringify({
      message: document.querySelector('#newMessage').value,
      username,
      server,
    })
    socket.send(data)
  } else {
    console.log('you have no username or server selected')
  }
})
