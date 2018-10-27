const express = require("express");
var session = require('express-session');
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const server = app.listen(8000, function () {
    console.log("listening on port 8000");
});
const io = require('socket.io')(server);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render("index");
});

let names = [];
let msgs = [];

io.on('connection', function (socket) {

    socket.emit('log_dump', {
        log: msgs
    });
    socket.on('receive_userlist', function () {
        console.log("Hit received_userlist. Emitting update_userlist");
        io.emit('update_userlist', {
            userlist: names
        });
    });
    socket.on('name', function (data) {
        names.push(data.name);
        socket.broadcast.emit('new_user', {
            new_user: data.name
        });
    });
    socket.on('new_msg', function (data) {
        msgs.push({
            person: data.person,
            msg: data.msg
        });
        io.emit('send_msg', {
            person: data.person,
            msg: data.msg
        });
    });
});