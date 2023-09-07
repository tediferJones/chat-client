// let socket;
const connections = {};
let currentServer;

document.querySelector('#newConnection').addEventListener('submit', async(e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const servername = document.querySelector('#servername').value;
  console.log(username, servername);

  const port = await fetch(`/getPort?servername=${servername}`).then(res => res.json())
  console.log(port)
  connections[servername] = new WebSocket(`ws://localhost:${port.port}?` + new URLSearchParams({ username, servername }));
  const socket = connections[servername];

  socket.onopen = () => {
    const chatHistory = document.createElement('ul');
    // chatHistory.id = servername;
    chatHistory.id = `${servername}Chat`;
    const container = document.createElement('li');
    container.textContent = `Connected to servername: ${servername}`
    // document.querySelector('#chatHistory').appendChild(container)
    chatHistory.appendChild(container)
    document.querySelector('#chatContainer').appendChild(chatHistory)

    // Create button so user can manually close their websocket
    const closeConnection = document.createElement('button');
    closeConnection.textContent = `Disconnect from ${servername}`;
    closeConnection.className = 'bg-red-500 p-4'
    closeConnection.addEventListener('click', () => {
      socket.close()
    })
    const selectChat = document.createElement('button');
    selectChat.textContent = `Go To ${servername}`;
    selectChat.className = 'bg-blue-500 p-4'
    selectChat.addEventListener('click', () => {
      console.log('SWITCH CHATROOMS')
      switchChat(servername);
    });
    const manageChat = document.createElement('div');
    manageChat.id = `${servername}Manager`
    manageChat.appendChild(selectChat);
    manageChat.appendChild(closeConnection);

    // document.querySelector('#currentConnections').appendChild(closeConnection);
    document.querySelector('#currentConnections').appendChild(manageChat);

  }

  socket.onclose = () => {
    const container = document.createElement('li');
    container.textContent = `Disconnected from servername: ${servername}`
    // document.querySelector('#chatHistory').appendChild(container)
    document.querySelector(`#${servername}Chat`).appendChild(container)
    // Remove button to close websocket when websocket closes
    // console.log(document.querySelector(`#${servername}-${username}`))
    // console.log(servername);
    // console.log(username);
    // document.querySelector('#currentConnections').removeChild(document.querySelector(`#${servername}-${username}`))
    // onclose, delete button container and chatHistory for this server
    console.log(document.querySelector(`#${servername}Manager`))
    document.querySelector('#currentConnections').removeChild(document.querySelector(`#${servername}Manager`))
  }

  socket.onmessage = ({ data }) => {
    const container = document.createElement('li')
    container.textContent = data;
    // document.querySelector('#chatHistory').appendChild(container)
    document.querySelector(`#${servername}`).appendChild(container)
  }
})

document.querySelector('#sendMessage').addEventListener('submit', (e) => {
  e.preventDefault();

  if (document.querySelector('#connectionError')) {
    document.querySelector('#chatManager').removeChild(document.querySelector('#connectionError'));
  }

  if (Object.keys(connections).length) {
    // socket.send(document.querySelector('#newMessage').value)
    Object.keys(connections).forEach(servername => {
      connections[servername].send(document.querySelector('#newMessage').value)
    })
  } else {
    const connectionError = document.createElement('div');
    connectionError.id = 'connectionError'
    connectionError.textContent = 'You are not connected to any servers';
    document.querySelector('#chatManager').appendChild(connectionError)
  }
})
