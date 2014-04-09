var express = require('express');
var app = express();
var socketio = require('socket.io');
var validator = require('validator');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendfile('views/index.html');
});

var server = app.listen(7007, function() {
  console.log("Listening on port %d", server.address().port);
});

var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
  console.log("Connection!");
  
  // Message of the Day
  socket.emit('mastermind', '!gralk: bem-vindo ao gralk!');
  socket.emit('mastermind', '!gralk: escolha seu apelido usando: /nick <strong>apelido</strong>');
  socket.emit('mastermind', '!grak: exemplo: /nick thyagobr');
  socket.emit('mastermind', '!grak: divirta-se!');

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
        socket.emit('message', '!gralk: Tamanho máximo do nickname: 10 chars');
        return;
      }
      io.sockets.emit('message', '!gralk: ' + socket.nickname + ' agora é: ' + tokenize[1]); 
      socket.nickname = tokenize[1];
      return;
    }
    io.sockets.emit('message', socket.nickname + ": " + data);
  });

  socket.on('geoloc', function(data) {
    console.log("geoloc!");
    console.log(data);
  });
});

