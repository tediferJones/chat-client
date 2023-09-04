// THIS LINE MUST MATCH IN home.js
// const socket = new WebSocket('ws://localhost:8000')
// console.log(ws)
let socket;
// let username = '';
// let server = '';

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
  console.log(socket.readyState)
  // SEND VALIDATION AND CHECK RESULT HERE

  socket.onopen = () => {
    const container = document.createElement('li');
    container.textContent = `Connected to server: ${server}`
    document.querySelector('#chatHistory').appendChild(container)

    // Create button so user can manually close their websocket
    const closeConnection = document.createElement('button');
    closeConnection.id = `${server}-${username}`;
    closeConnection.textContent = server;
    closeConnection.addEventListener('click', () => {
      socket.close()
    })
    document.querySelector('#currentConnections').appendChild(closeConnection);
  }

  socket.onclose = () => {
    const container = document.createElement('li');
    container.textContent = `Disconnected from server: ${server}`
    document.querySelector('#chatHistory').appendChild(container)
    // Remove button to close websocket when websocket closes
    document.querySelector('#currentConnections').removeChild(document.querySelector(`#${server}-${username}`))
  }

  socket.onmessage = ({ data }) => {
    const container = document.createElement('li')
    container.textContent = data;
    document.querySelector('#chatHistory').appendChild(container)
  }
})

document.querySelector('#send').addEventListener('click', (e) => {
  e.preventDefault();

  if (document.querySelector('#connectionError')) {
    document.querySelector('#chatManager').removeChild(document.querySelector('#connectionError'));
  }

  if (socket && socket.readyState === 1) {
    socket.send(document.querySelector('#newMessage').value)
  } else {
    // console.log('you have no username or server selected')
    const connectionError = document.createElement('div');
    connectionError.id = 'connectionError'
    connectionError.textContent = 'You are not connected to any servers';
    document.querySelector('#chatManager').appendChild(connectionError)
  }
})
