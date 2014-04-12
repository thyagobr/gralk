var express = require('express');
var app = express();
var socketio = require('socket.io');
var validator = require('validator');
var users = [];

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendfile('views/index.html');
});

var server = app.listen(process.env.PORT || 5000, function() {
  console.log("Listening on port %d", server.address().port);
});

var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
  console.log("Connection!");
  users.push(socket);
  
  // Message of the Day
  socket.emit('mastermind', '!gralk: bem-vindo ao gralk!');
  socket.emit('mastermind', '!gralk: escolha seu apelido usando: /nick <strong>apelido</strong>');
  socket.emit('mastermind', '!gralk: exemplo: /nick thyagobr');
  socket.emit('mastermind', '!gralk: divirta-se!');

  // Starting nickname
  socket.nickname = "RandomDude" + Math.floor(Math.random()*9999);

  // onMessage
  socket.on('message', function(data) {
    data = validator.escape(data);
    console.log(socket.id + ": " + data);
    tokenize = data.split(" ");
    if (tokenize[0] == "/nick") {
      console.log("NICKNAME: " + tokenize[1]);
      if (tokenize[1].length > 10) {
        socket.emit('mastermind', '!gralk: Tamanho máximo do nickname: 10 chars');
        return;
      }
      io.sockets.emit('mastermind', '!gralk: <strong>' + socket.nickname + '</strong> agora é: <strong>' + tokenize[1] + "</strong>"); 
      socket.nickname = tokenize[1];
      return;
    } else if (tokenize[0] == "/users") {
      users = [];
      socket.emit('mastermind', '!gralk: listing users...');
      io.sockets.clients().forEach(function (sock) {
        users.push(sock.nickname);
      });
      socket.emit('mastermind', '!gralk: ' + users.toString());
      return;
    }
    console.log("### Emiting to room: " + socket.room);
    io.sockets.to(socket.room).emit('message', socket.nickname + ": " + data);
  });

  socket.on('geoloc', function(data) {
    console.log("geoloc!");
    console.log(data);
    socket.room = data.latitude.concat(data.longitude);
    socket.join(socket.room);
  });
});

