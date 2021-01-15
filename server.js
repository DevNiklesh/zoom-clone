const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

// To create Room id 
const { v4: uuidv4 } = require('uuid');

// View Engine by express
app.set('view engine', 'ejs');

// Refering Script.js files here
app.use(express.static('public'));

// Using peerjs here
app.use('/peerjs', peerServer);

// Routes
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// Socket connection
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('message', message => {
            io.to(roomId).emit('create-message', message);
        });
    });
});

server.listen(process.env.PORT || 3030, () => {
    console.log("Zoom Clone Connected to port 3030");
});