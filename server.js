const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const readline = require('readline');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const readInput = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var allUsernames = {};
var games = {};
var gameChat = {};
readInput.question('Enter the port number: ', (port) => {
  if (port < 1024 || port > 49151 || isNaN(port)) {
    console.error('Error, please choose a port between 1024 and 49151.');
    process.exit(1);
  }


  io.on('connection', (socket) => {
    socket.on('username', function (username) {
      const checkUsername = Object.values(allUsernames).includes(username);
      if (checkUsername) {
        socket.emit('usernameInUse');
      } else {
        allUsernames[socket.id] = username;
        socket.emit('goodUsername');
      }
    });

    socket.on('generateGame', function () {
      symbols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
        'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
      var gameID = '';
      for (var i = 10; i > 0; i--) {
        gameID += symbols[(Math.floor(Math.random() * symbols.length))];
      }

      if (games[gameID]) {
        socket.emit('gameInUse');
      } else {
        games[gameID] = {
          creator: socket.id,
          players: [],
          currentRound: 0,
          maxRounds: 5,
          points: {},
          apiCall: false,
          roundIncremented: false,
          clientCount: 0,
          roundIncrement: false,
          end: false
        };
        games[gameID].players.push(allUsernames[socket.id]);
        games[gameID].points[allUsernames[socket.id]] = 0;
        socket.join(gameID);
        socket.emit('gameCreated', gameID, games[gameID].players);
      }
    });

    socket.on('joinGame', function (game) {
      if (games[game]) {
        if (games[game].currentRound > 0) {
          socket.emit('inProgress');
        } else {
          games[game].players.push(allUsernames[socket.id]);
          games[game].points[allUsernames[socket.id]] = 0;
          socket.join(game);
          socket.emit('joinedGame', game, games[game].players);
          io.to(game).emit('newPlayer', game, games[game].players);
        }
      } else {
        socket.emit('gameNotFound');
      }
    });

    socket.on('startGame', function () {
      for (var gameId in games) {
        if (games[gameId].creator == socket.id && games.hasOwnProperty(gameId)) {
          io.to(gameId).emit('gameStarted', gameId);
          break;
        }
      }
    });

    socket.on('gameIn', function (gameId) {
      if (!games[gameId].apiCall) {
        const uA = process.env.DETAILUSERNAME;
        const pA = process.env.DETAILPASSWORD;
        fetch('https://wheatley.cs.up.ac.za/u22492616/api.php', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(uA + ':' + pA)}`
          },
          body: JSON.stringify({
            "type": "GetRandomBrands"
          })
        })
          .then((response) => response.json())
          .then((json) => {
            const data = json.data;
            if (!games[gameId].roundIncrement) {
              games[gameId].currentRound++;

              games[gameId].roundIncrement = true;
            }

            io.to(gameId).emit('round', data, gameId, games[gameId].currentRound);
          });

        games[gameId].apiCall = true;
      }
    });

    socket.on('round', function (gameId) {
      if (games[gameId]) {
        if (!games[gameId].roundIncremented) {
          if (games[gameId]) {
            games[gameId].currentRound++;
            console.log(games[gameId].currentRound);
          }
          if (games[gameId]) {
            const round = games[gameId].currentRound;
            if (round > games[gameId].maxRounds) {
              if (!games[gameId].end) {
                const points = games[gameId].points;
                var highestScore = 0;
                for (const score of Object.values(points)) {
                  if (score > highestScore) {
                    highestScore = score;
                  }
                }
                const winners = Object.entries(points)
                  .filter(([_, score]) => score == highestScore)
                  .map(([player, _]) => player);
                io.to(gameId).emit('gameOver', winners);
                games[gameId].end = true;
              }
              return;
            }
          }
          const uA = process.env.DETAILUSERNAME;
          const pA = process.env.DETAILPASSWORD;
          fetch('https://wheatley.cs.up.ac.za/u22492616/api.php', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(uA + ':' + pA)}`
            },
            body: JSON.stringify({
              "type": "GetRandomBrands"
            })
          })
            .then((response) => response.json())
            .then((json) => {
              const data = json.data;
              io.to(gameId).emit('round', data, gameId, games[gameId].currentRound);

            });
          games[gameId].roundIncremented = true;
        }
        games[gameId].clientCount++;
        if (games[gameId].clientCount == games[gameId].players.length) {
          games[gameId].clientCount = 0;
          games[gameId].roundIncremented = false;
        }
      }

    });

    socket.on('guess', function (guess, gameId, data) {
      if (guess === data[0].Brand) {
        games[gameId].points[allUsernames[socket.id]] = (games[gameId].points[allUsernames[socket.id]]) + 1;
        io.to(gameId).emit('guessCorrect', allUsernames[socket.id], data);

      } else {
        socket.emit("incorrectGuess");
      }
    });

    socket.on('disconnect', function () {
      const gameId = Object.keys(games).find(gameId => games[gameId].players.includes(allUsernames[socket.id]));
      if (gameId) {
        const game = games[gameId];
        const disconnectedPlayer = allUsernames[socket.id];
        const remainingPlayers = game.players.filter(player => player != disconnectedPlayer);
        game.players = remainingPlayers;
        if (game.players.length > 0 && game.currentRound > 0) {
          io.to(gameId).emit('playerDisconnected', disconnectedPlayer);
          delete game.points[disconnectedPlayer];
          game.end = true;
          const points = games[gameId].points;
          var highestScore = 0;
          for (const score of Object.values(points)) {
            if (score > highestScore) {
              highestScore = score;
            }
          }
          const winners = Object.entries(points)
            .filter(([_, score]) => score == highestScore)
            .map(([player, _]) => player);
          io.to(gameId).emit('gameOver', winners);
          delete games[gameId];
        }
  
      }
      delete allUsernames[socket.id];
    });
  });

  app.use(express.static('public'));

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  readInput.on('line', function (text) {
    var [command, username] = text.trim().split(' ');
    if (command == 'LIST') {
      const allConnections = Object.entries(allUsernames);
      const connectionList = allConnections.map(([socketID, username]) => ({
        socketID,
        username,
      }));
      connectionList.forEach(({ socketID, username }) => {
        console.log(`Username: ${username}, Socket ID: ${socketID}`);
      });
    } else if (command == 'KILL' && username) {
      const socketID = Object.keys(allUsernames).find(key => allUsernames[key] == username);
      if (socketID) {
        const socket = io.sockets.sockets.get(socketID);
        if (socket) {
          console.log(`Disconnected client with username: ${username}`);
          socket.disconnect(true);
          delete allUsernames[socketID];
        }
      } else {
        console.log("The username you input was not found.");
      }
    } else if (command == 'QUIT') {
      io.emit('quitCommand');
      const Connections = Object.entries(allUsernames);
      const connectionList = Connections.map(([socketID, username]) => ({
        socketID,
        username,
      }));
      connectionList.forEach(({ socketID, username }) => {
        const socket = io.sockets.sockets.get(socketID);
        socket.disconnect(true);
        delete allUsernames[socketID];
      });
      io.sockets.sockets.forEach((connectedSocket) => {
        connectedSocket.disconnect(true);
      });

      server.close(function () {
        console.log("Server is shutdown.");
        process.exit(0);
      });
    } else if (command == 'GAMES') {
      for (const [gameID, game] of Object.entries(games)) {
        const players = game.players.join(', ');
        console.log(`GameID: ${gameID}, Players: ${players}`);
      }
    }

  });

  //readInput.close();
});
