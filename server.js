process.env.PORT = '3000';
process.env.MONGO_URI = 'mongodb+srv://aidaninparis:UpsFounder1907!@chatappy.ax8cgnp.mongodb.net/?appName=chatappy';
process.env.SESSION_SECRET = 'supersecretstring123';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

const authRoutes = require('./routes/auth');
app.use(authRoutes);

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', async (room) => {
        socket.join(room);
        const history = await Message.find({ room })
            .sort({ timestamp: -1 })
            .limit(50);
        socket.emit('message history', history.reverse());
    });

    socket.on('chat message', async (data) => {
        const username = socket.request.session?.username || 'Anonymous';
        const msg = await Message.create({
            username,
            room: data.room,
            text: data.text
        });
        io.to(data.room).emit('chat message', msg);
        console.log(data.room);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});