let socket;

document.querySelector('#newConnection').addEventListener('submit', async(e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const servername = document.querySelector('#servername').value;
  console.log(username, servername);

  // if (socket) {
  //   socket.close();
  // }
  const port = await fetch(`/getPort?servername=${servername}`).then(res => res.json())
  console.log(port)
  socket = new WebSocket('ws://localhost:8000?' + new URLSearchParams({ username, servername }))
  // console.log(socket.readyState)

  socket.onopen = () => {
    const container = document.createElement('li');
    container.textContent = `Connected to servername: ${servername}`
    document.querySelector('#chatHistory').appendChild(container)

    // Create button so user can manually close their websocket
    const closeConnection = document.createElement('button');
    closeConnection.id = `${servername}-${username}`;
    closeConnection.textContent = servername;
    closeConnection.addEventListener('click', () => {
      socket.close()
    })
    document.querySelector('#currentConnections').appendChild(closeConnection);
  }

  socket.onclose = () => {
    const container = document.createElement('li');
    container.textContent = `Disconnected from servername: ${servername}`
    document.querySelector('#chatHistory').appendChild(container)
    // Remove button to close websocket when websocket closes
    console.log(document.querySelector(`#${servername}-${username}`))
    console.log(servername);
    console.log(username);
    document.querySelector('#currentConnections').removeChild(document.querySelector(`#${servername}-${username}`))
  }

  socket.onmessage = ({ data }) => {
    const container = document.createElement('li')
    container.textContent = data;
    document.querySelector('#chatHistory').appendChild(container)
  }
})

document.querySelector('#sendMessage').addEventListener('submit', (e) => {
  e.preventDefault();

  if (document.querySelector('#connectionError')) {
    document.querySelector('#chatManager').removeChild(document.querySelector('#connectionError'));
  }

  if (socket && socket.readyState === 1) {
    socket.send(document.querySelector('#newMessage').value)
  } else {
    const connectionError = document.createElement('div');
    connectionError.id = 'connectionError'
    connectionError.textContent = 'You are not connected to any servers';
    document.querySelector('#chatManager').appendChild(connectionError)
  }
})
