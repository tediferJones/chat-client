// THIS LINE MUST MATCH IN home.js
// const socket = new WebSocket('ws://localhost:8000')
// console.log(ws)
let socket;
let username = '';
let server = '';

document.querySelector('#connect').addEventListener('click', (e) => {
  e.preventDefault();

  username = document.querySelector('#username').value
  server = document.querySelector('#server').value
  console.log(username, server);

  // const serverRes = fetch('/connect' + '?' + new URLSearchParams({ username, server }))
  //   .then(res => res.json())
  //   .then(data => console.log(data))

  // WORKING
  if (socket) {
    socket.close();
  }
  // socket = new WebSocket('ws://localhost:8000', `${server}-${username}`)
  socket = new WebSocket('ws://localhost:8000?' + new URLSearchParams({ username, server }))
  console.log(socket)
  // SEND VALIDATION AND CHECK RESULT HERE

  // socket.onopen = (idk) => {
  //   console.log(idk)
  // }

  socket.onmessage = ({ data }) => {
    // console.log(data)
    data.text().then(data => {
      const newMessage = JSON.parse(data);
      const container = document.createElement('li')
      container.textContent = newMessage.username + ': ' + newMessage.message;
      document.querySelector('#chatHistory').appendChild(container)
    })
  }

  // APPEND A BUTTON WITH EVENTLISTENER THAT WILL TRIGGER socket.close()
})

document.querySelector('#send').addEventListener('click', (e) => {
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
