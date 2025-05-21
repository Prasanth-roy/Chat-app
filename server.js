const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'chatApp';

app.use(express.static('public'));

// MongoDB Connection
let db;
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
    .then(client => {
        db = client.db(dbName);
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error(err));

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user join
    socket.on('join', (user) => {
        console.log(`${user} joined`);
    });

    // Fetch previous messages on connection
    db.collection('messages').find().toArray().then(messages => {
        socket.emit('loadMessages', messages);
    });

    // Handle incoming messages
    socket.on('sendMessage', async (data) => {
        const message = {
            sender: data.sender,
            text: data.text,
            timestamp: new Date()
        };
        await db.collection('messages').insertOne(message);
        io.emit('receiveMessage', message);
    });

    // Handle refresh request
    socket.on('requestMessages', () => {
        db.collection('messages').find().toArray().then(messages => {
            socket.emit('loadMessages', messages);
        });
    });

    // Handle typing
    socket.on('typing', (user) => {
        socket.broadcast.emit('typing', user);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));