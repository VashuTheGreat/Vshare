// const express = require('express');
// const path = require('path');
// const http = require('http');
// const socketIO = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

// // Serve static files from the "public" folder
// app.use(express.static(path.join(__dirname, 'public')));

// io.on("connection", function(socket) {
//     console.log("A user connected:", socket.id);

//     // Sender joins a room
//     socket.on("sender-join", function(data) {
//         socket.join(data.uid);
//         console.log("Sender joined room:", data.uid);
//     });

//     // Receiver joins and notifies the sender
//     socket.on("receiver-join", function(data) {
//         socket.join(data.uid);
//         socket.to(data.sender_uid).emit("init", { uid: data.uid });
//         console.log("Receiver joined room:", data.uid, "and notified sender:", data.sender_uid);
//     });

//     // Send file metadata
//     socket.on("file-meta", function(data) {
//         socket.to(data.uid).emit("fs-meta", data.metadata);
//         console.log("Metadata sent to:", data.uid);
//     });

//     // Start file transfer
//     socket.on("fs-start", function(data) {
//         socket.to(data.uid).emit("fs-start", {});
//         console.log("File sending started to:", data.uid);
//     });

//     // Send file data (buffer)
//     socket.on("file-raw", function(data) {
//         socket.to(data.uid).emit("fs-raw", data.buffer);
//         console.log("File chunk sent to:", data.uid);
//     });
// });

// // Start the server
// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`🚀 Vshare backend is live at http://localhost:${PORT}`);
// });











const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


// client side code h serv karega public folder ko

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // sender joined
    socket.on('sender-join', (data) => {
        socket.join(data.uid); // Sender joins the room
        console.log('Sender joined room:', data.uid);
    });

    // receiver joined 
    socket.on('receiver-join', (data) => {
        socket.join(data.uid); // Receiver joins the room
        console.log('Receiver joined room:', data.uid);
        socket.to(data.sender_uid).emit('init', { uid: data.uid }); // Notifying sender
    });

    // file ki information dega
    socket.on('file-meta', (data) => {
        socket.to(data.uid).emit('fs-meta', data.metadata); // Sending metadata to receiver
        console.log('File metadata sent to receiver:', data.metadata);
    });

    // Handle file chunks from sender
    socket.on('file-raw', (data) => {
        socket.to(data.uid).emit('fs-raw', data.buffer); // Sending file chunk to receiver
        console.log('File chunk sent to receiver:', data.buffer);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
