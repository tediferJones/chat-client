// TO-DO
// Consider rename index.js to server.js
// Do we want to allow the user to be in multiple chats at once?
//    - i.e. merge two seperate chat feeds into one
//    - If so, we will need to find some way to organize activer webSockets on the client
// Can we create a websocket for each chatRoom?
//    - Should only use ports from 49152 to 65535
//    - These ports are not assigned, controlled or registered
//    - These ports are supposed to be used for "temporary or private ports" which is exactly what we want
//    - We dont even have to send the port back to the user, the user can send the port number
//      - We may just need to create an api route that will return a usuable port
//    - This will allows us to use socket.close() to close invidual connections, 
//      - If all chatrooms run on the same socket we would have to send a get request to tell the server to disconnect us
//    - Should still double check the port on first connection, two users could technically try to connect at the same time with the same port
//    Send an active port from the client, and create a new webSocketServer on the webSiteServer with matching port
//    If all goes well, client should be able to open the same port and boom, connected
// Do we even need express?  Node should have its own http lib, use that instead of express
//    - We literally just need to send a single HTML file and its JS to the user
// Try to remove all global variables from client.js, then the user cant manually change them?
//    - Removed username and servername, websocket still exists but changing its props doesnt affect server so we're good?
//    - the socket var could be deleted now that we can manually close the socket
// Try to remove the global socket var from client.js
//    - If possible also remove it from index.js
// get tailwind working in this project
// get a bundler installed

const express = require('express');
const WebSocket = require('ws');

const webSocketPort = 8000 // Might need to use 443 in production
const websitePort = 3000

const webSocketServer = new WebSocket.Server({ port: webSocketPort })

// { servername: usersArray }
const servers = {};

webSocketServer.on('connection', (newClientSocket, req) => {
  // Add user info to the servers obj
  //
  // DOUBLE CHECK PORT, SERVERNAME, AND USERNAME, are all 'valid'
  const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
  newClientSocket.username = params.get('username');
  newClientSocket.servername = params.get('servername')
  let currentServer = servers[newClientSocket.servername];

  if (currentServer) {
    for (let i = 0; i < currentServer.length; i++) {
      if (newClientSocket.username === currentServer[i].username) {
        newClientSocket.send('Username is already taken, please join a different chatroom or change your username')
        newClientSocket.close();
        return
      }
    }
    currentServer.push(newClientSocket)
  } else {
    // Set both currentServer and servers[newServerName] to an array containing newClientSocket
    currentServer = servers[newClientSocket.servername] = [newClientSocket];
  }

  // When socket closes, remove socket from servers obj 
  // (this will free the username for future connections)
  // This only applies to sockets that have passed username checking, 
  // if your username is a duplicate you wont get added to servers obj anyways
  newClientSocket.on('close', () => {
    for (let i = 0; i < currentServer.length; i++) {
      if (currentServer[i].username === newClientSocket.username) {
        currentServer.splice(i, 1);
        break;
      }
    }
  })

  // Send messages to the right chatRooms
  newClientSocket.on('message', message => {
    servers[newClientSocket.servername].forEach(existingSocket => {
      existingSocket.send(`${newClientSocket.username}: ${message.toString()}`)
    })
  })
})

const app = express()
app.use(express.static('pages'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/client.html')
})
app.get('/getPort', (req, res) => {
  // Ports in the range of 49152 to 65535 are not assigned, controlled or registered
  // Thus these ports should be ideal for "temporary or private ports"
  // THIS FUNCTION NEEDS TO TAKE THE SERVERNAME AS AN ARUGMENT
  // Users connecting to active servers need a port that already exists
  const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
  const servername = params.get('servername')
  const servernamesArr = Object.keys(servers)
  let port;

  // const minPort = 49152
  // const maxPort = 65535
  if (servernamesArr.includes(servername)) {
    port = servers[servername].port
  } else {
    const activePorts = servernamesArr.map(servername => servers[servername].port)
    port = 49152 // Lowest possible port
    while (activePorts.includes(port)) {
      port++
    }
  }
  res.json({ port: port <= 65535 ? port : 0 }) // 65535 is the highest possible port
})
app.listen(websitePort, () => {
  console.log(`Running on port ${websitePort}`)
})
