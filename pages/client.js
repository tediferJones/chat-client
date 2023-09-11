const connections = {};
let currentServername;

function switchChat() {
  // iterate through all servers, add class hidden to all except servername, and remove hidden from servername
  Object.keys(connections).forEach(servername => {
    if (servername === currentServername) {
      document.querySelector(`#${servername}Chat`).classList.remove('hidden');
    } else {
      document.querySelector(`#${servername}Chat`).classList.add('hidden');
    }
  });
}

document.querySelector('#newConnection').addEventListener('submit', async(e) => {
  e.preventDefault();

  const username = document.querySelector('#username').value;
  const servername = document.querySelector('#servername').value;
  console.log(username, servername);

  const port = await fetch(`/getPort?servername=${servername}&username=${username}`).then(res => res.json())
  console.log(port)
  // connections[servername] = new WebSocket(`ws://localhost:${port.port}?` + new URLSearchParams({ username, servername }));
  // const socket = connections[servername];
  if (port.port && port.validUsername) {
    if (document.querySelector('#connectionError')) {
      document.querySelector('#chatContainer').removeChild(document.querySelector('#connectionError'));
    }
    const socket = connections[servername] = new WebSocket(`ws://localhost:${port.port}?` + new URLSearchParams({ username, servername }));

    socket.onopen = () => {
      // Create a chat for this server
      const chatHistory = document.createElement('ul');
      chatHistory.id = `${servername}Chat`;
      const container = document.createElement('li');
      container.textContent = `Connected to servername: ${servername}`
      chatHistory.appendChild(container)
      document.querySelector('#chatContainer').appendChild(chatHistory)

      // Create button so user can manually close their websocket
      const closeConnection = document.createElement('button');
      // closeConnection.textContent = `Disconnect from ${servername}`;
      // closeConnection.className = 'bg-red-500 p-4'
      const closeIcon = document.createElement('i');
      closeIcon.className = 'fa-solid fa-plug-circle-xmark fa-xl';
      closeIcon.style.color = '#DC2626';
      closeConnection.appendChild(closeIcon)
      closeConnection.addEventListener('click', () => {
        socket.close()
      })
      // Create button so user can switch view to this chat
      const selectChat = document.createElement('button');
      // selectChat.textContent = `Go To ${servername}`;
      // selectChat.className = 'bg-blue-500 p-4'
      selectChat.textContent = servername
      selectChat.className = 'flex-1 text-left';
      selectChat.addEventListener('click', () => {
        console.log('SWITCH CHATROOMS');
        currentServername = servername;
        switchChat();
      });
      const manageChat = document.createElement('div');
      manageChat.id = `${servername}Manager`
      manageChat.className = 'p-4 flex justify-between';
      manageChat.appendChild(selectChat);
      manageChat.appendChild(closeConnection);

      // document.querySelector('#currentConnections').appendChild(closeConnection);
      document.querySelector('#currentConnections').appendChild(manageChat);

      // connections[servername] = 
      // currentServer = connections[servername];
      currentServername = servername;
      switchChat();
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
      document.querySelector('#chatContainer').removeChild(document.querySelector(`#${servername}Chat`))
    }

    socket.onmessage = ({ data }) => {
      const container = document.createElement('li')
      container.textContent = data;
      // document.querySelector('#chatHistory').appendChild(container)
      document.querySelector(`#${servername}Chat`).appendChild(container)
    }
  }
})

document.querySelector('#sendMessage').addEventListener('submit', (e) => {
  e.preventDefault();

  if (document.querySelector('#connectionError')) {
    // document.querySelector('#chatManager').removeChild(document.querySelector('#connectionError'));
    // document.querySelector('#sendMessage').removeChild(document.querySelector('#connectionError'));
    document.querySelector('#chatContainer').removeChild(document.querySelector('#connectionError'));
  }

  if (currentServername) {
    connections[currentServername].send(document.querySelector('#newMessage').value);
    document.querySelector('#newMessage').value = '';
  } else {
    const connectionError = document.createElement('div');
    connectionError.id = 'connectionError'
    connectionError.textContent = 'You are not connected to any servers';
    // document.querySelector('#sendMessage').appendChild(connectionError)
    document.querySelector('#chatContainer').appendChild(connectionError)
  }
})
