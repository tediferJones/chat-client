// TO-DO
// Consider rename index.js to server.js
// Do we want to allow the user to be in multiple chats at once?
//    - i.e. merge two seperate chat feeds into one
//    - If so, we will need to find some way to organize activer webSockets on the client
//    - Is this a bad idea?  How do we handle sending a message to multiple clients but not the sender multiple times?
//    - It would be easier to just have seperate chat rooms that run concurrently
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
// get tailwind working in this project (just drop in a script tag for dev, use tailwind CLI to generate css file for production)
// get a bundler installed (we literally dont need a bundler, we have no modules to bundle)
// If we want something like React, without actually using React, try VanJS

const express = require('express');
const WebSocket = require('ws');

// const webSocketPort = 8000 // Might need to use 443 in production
const websitePort = 3000


// { servername: serverWebSocket }
const servers = {};

const app = express()
app.use(express.static('pages'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/client.html')
})
app.get('/getPort', (req, res) => {
  // Ports in the range of 49152 to 65535 are not assigned, controlled or registered
  // Thus these ports should be ideal for "temporary or private ports"
  const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
  const servername = params.get('servername')
  const username = params.get('username')
  const servernamesArr = Object.keys(servers)
  let port;
  let validUsername = true;

  if (servernamesArr.includes(servername)) {
    // SERVER ALREADY EXISTS, MAKE SURE USERNAME IS UNIQUE
    console.log(servers[servername].port)
    port = servers[servername].port
    servers[servername].clients.forEach(client => {
      console.log(client.username)
      if (client.username === username) {
        console.log('MATCHING USERNAME')
        validUsername = false;
      }
    })
  } else {
    // If servername doesnt exist, find a new port and create a new webSocketServer
    const activePorts = servernamesArr.map(servername => servers[servername].port)
    port = 49152 // Lowest possible port
    while (activePorts.includes(port)) {
      port++
    }

    servers[servername] = new WebSocket.Server({ port }).on('connection', (newClientSocket, req) => {
      // DOUBLE CHECK PORT, SERVERNAME, AND USERNAME, are all 'valid'
      // This could probably significantly simplified
      const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
      newClientSocket.username = params.get('username');
      newClientSocket.servername = params.get('servername')
      let currentServer = servers[newClientSocket.servername];
      servers[servername].port = port;

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
        // servers[newClientSocket.servername].forEach(existingSocket => {
        //   existingSocket.send(`${newClientSocket.username}: ${message.toString()}`)
        // })
        // SEND EACH MESSAGE TO ONE USERNAME
        // i.e. dont send to the same username twice
        servers[newClientSocket.servername].clients.forEach(existingSocket => {
          existingSocket.send(`${newClientSocket.username}: ${message.toString()}`)
        })
      })
    })
  }
  res.json({ 
    port: port <= 65535 ? port : 0,
    validUsername,
  }); // 65535 is the highest possible port
});

app.listen(websitePort, () => {
  console.log(`Running on port ${websitePort}`);
});
