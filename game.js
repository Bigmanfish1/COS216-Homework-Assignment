var userButton = document.getElementById("userB");
userButton.addEventListener("click", function () {
    const socket = io();
    var username = document.getElementById("user").value;
    socket.emit('username', username);
    socket.on('usernameInUse', function () {
        var errorDiv = document.getElementById('errorDiv');
        errorDiv.textContent = "Username is already being used.";
    });

    socket.on('goodUsername', function () {
        var mainDiv = document.querySelector('.Main');
        mainDiv.innerHTML = '';
        var divElement = document.createElement('div');
        var buttonElement = document.createElement('button');
        buttonElement.textContent = 'Create Game ID';
        buttonElement.setAttribute('id', 'createG');
        var textDisplay = document.createElement('div');
        textDisplay.textContent = 'ROOM-ID TO BE GENERATED';
        textDisplay.classList.add('resultRoom');
        textDisplay.setAttribute('id', 'gameDisplay');
        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter room ID';
        inputField.setAttribute('id', 'joinG');
        var joinButton = document.createElement('button');
        joinButton.setAttribute('id', 'joinButton');
        joinButton.textContent = 'Join Room';
        var errGame = document.createElement('div');
        errGame.classList.add('errGame');
        errGame.setAttribute('id', 'gameIDErr');
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(inputField);
        divElement.appendChild(errGame);
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(joinButton);
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(buttonElement);
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(document.createElement('br'));
        divElement.appendChild(textDisplay);

        mainDiv.appendChild(divElement);

        var createGame = document.getElementById('createG');
        createGame.addEventListener('click', function () {
            socket.emit('generateGame');

            socket.on('gameInUse', function () {
                var gameID = document.getElementById('gameDisplay');
                gameID.textContent = "GameID is already being used, Generate another game.";
            });

            socket.on('gameCreated', function (game, playersAll) {
                var jB = document.getElementById('joinButton');
                var cG = document.getElementById('createG');
                if(jB){
                    jB.remove();
                }

                if(cG){
                    cG.remove();
                }
                var gameID = document.getElementById('gameDisplay');
                gameID.textContent = 'GameID:    ' + game + ' Waiting for game to start';

                var players = document.createElement('ul');
                players.setAttribute('id', 'playerList');
                var playerTitle = document.createElement('li');
                playerTitle.textContent = 'Players:';
                players.appendChild(playerTitle);
                playersAll.forEach(function (pl) {
                    var playerItem = document.createElement('li');
                    playerItem.textContent = pl;
                    players.appendChild(playerItem);
                });
                gameDisplay.appendChild(players);
                var mainDiv = document.querySelector('.Main');
                var startButton = document.createElement('button');
                startButton.setAttribute('id', 'startButton');
                startButton.textContent = 'START GAME';
                mainDiv.appendChild(startButton);

                startButton.addEventListener('click', function () {
                    socket.emit('startGame');
                });
            });

        });

        var join = document.getElementById('joinButton');
        join.addEventListener('click', function () {
            var joinText = document.getElementById('joinG').value;
            socket.emit('joinGame', joinText);

            socket.on('gameNotFound', function () {
                var gameErr = document.getElementById('gameIDErr');
                gameErr.textContent = 'The gameID you have input cannot be found.';
            });

            socket.on('inProgress', function(){
                var gameErr = document.getElementById('gameIDErr');
                gameErr.textContent = 'The game you have input is already in progress.';
            });

            socket.on('joinedGame', function (game, playersAll) {
                var jB = document.getElementById('joinButton');
                var cG = document.getElementById('createG');
                if(jB){
                    jB.remove();
                }

                if(cG){
                    cG.remove();
                }
                var gameID = document.getElementById('gameDisplay');
                gameID.textContent = 'GameID:    ' + game + ' Waiting for game to start';
                var playerList = document.createElement('ul');
                playerList.setAttribute('id', 'playerList');
                var playerTitle = document.createElement('li');
                playerTitle.textContent = 'Players:';
                playerList.appendChild(playerTitle);
                playersAll.forEach(function (pl) {
                    var playerItem = document.createElement('li');
                    playerItem.textContent = pl;
                    playerList.appendChild(playerItem);
                });
                gameDisplay.appendChild(playerList);
            });
        });

        socket.on('newPlayer', function (game, players) {
            var gameDisplay = document.getElementById('gameDisplay');
            gameDisplay.innerHTML = '';
            gameDisplay.textContent = 'GameID:    ' + game + ' Waiting for game to start';

            var playerList = document.createElement('ul');
            playerList.setAttribute('id', 'playerList');
            var playerTitle = document.createElement('li');
            playerTitle.textContent = 'Players:';
            playerList.appendChild(playerTitle);

            players.forEach(function (player) {
                var playerItem = document.createElement('li');
                playerItem.textContent = player;
                playerList.appendChild(playerItem);
            });
            gameDisplay.appendChild(playerList);
        });

        socket.on('gameStarted', function (game) {
            var countdown = 5;
            var countdownDisplay = document.createElement('div');
            countdownDisplay.textContent = 'The game starting in ' + countdown + ' seconds';
            document.getElementById('gameDisplay').appendChild(countdownDisplay);

            var countdownInterval = setInterval(function () {
                countdown--;
                countdownDisplay.textContent = 'The game starting in ' + countdown + ' seconds';
                if (countdown === 0) {
                    clearInterval(countdownInterval);
                    socket.emit('gameIn', game);
                }
            }, 1000);


        });

        socket.on('round', function (data, gameId, roundC) {
            var mainDiv = document.querySelector('.Main');
            mainDiv.innerHTML = '';

            var subDiv = document.createElement('div');
            subDiv.setAttribute('id', 'minDiv');
            var divElement = document.createElement('div');
            divElement.classList.add("imageDiv");
            var imageElement = document.createElement('img');
            imageElement.src = data[0].Image;
            var inputElement = document.createElement('input');
            inputElement.setAttribute('id', 'guess');
            inputElement.type = 'text';
            inputElement.placeholder = "Guess the brand.";
            var buttonElement = document.createElement('button');
            buttonElement.textContent = 'GUESS!!!';
            var timerElement = document.createElement('div');
            var error = document.createElement('div');
            error.setAttribute('id', "incorrect");
            var result = document.createElement('div');
            result.setAttribute('id', "guessResult");
            result.classList.add('guessResult');
            var correct = document.createElement('div');
            correct.setAttribute('id', "answer");
            correct.classList.add('answer');
            var count = document.createElement('div');
            count.setAttribute('id', 'roundCount');
            var gameWinner = document.createElement('div');
            gameWinner.setAttribute('id', 'winner');
            var over = document.createElement('div');
            over.setAttribute('id', 'gameO');
            divElement.appendChild(imageElement);
            subDiv.appendChild(divElement);
            subDiv.appendChild(error);
            subDiv.appendChild(timerElement);
            subDiv.appendChild(document.createElement('br'));
            subDiv.appendChild(inputElement);
            subDiv.appendChild(document.createElement('br'));
            subDiv.appendChild(result);
            subDiv.appendChild(correct);
            subDiv.appendChild(count);
            subDiv.appendChild(document.createElement('br'));
            subDiv.appendChild(document.createElement('br'));
            subDiv.appendChild(buttonElement);
            subDiv.appendChild(over);
            subDiv.appendChild(gameWinner);
            mainDiv.appendChild(subDiv);

            buttonElement.addEventListener('click', function (gameId, data) {
                return function () {
                    var inputE = document.getElementById('guess');
                    const guess = inputE.value.trim();
                    socket.emit('guess', guess, gameId, data);
                };

            }(gameId, data));

            var timer = 30;
            timerElement.textContent = timer;

            var updateTimer = setInterval(function () {
                timer--;
                timerElement.textContent = timer;
                socket.on('guessCorrect', function (username, data) {
                    var result = document.getElementById('guessResult');
                    //var correct = document.getElementById('answer');
                    result.textContent = username + " has won the round.";
                    // correct.textContent = "The correct answer was " + data[0].Brand;
                    timer = 0;
                });

                socket.on("incorrectGuess", function () {
                    var errorDiv = document.getElementById('incorrect');
                    errorDiv.textContent = "Your guess was incorrect please try again.";
                });
                socket.on('gameOver', function (winners) {
                    if (winners.length == 1) {
                        alert("GAME OVER\nThe winner of the game was " + winners[0]);
                    } else {
                        var text = "GAME OVER\nThere is a draw between " + winners[0];
                        for (var i = 1; i < winners.length; i++) {

                            text += " and " + winners[i];
                        }
                        alert(text);
                    }
                    var countDown = 5;
                    var countdownInterval = setInterval(function () {
                        countDown--;
                        if (countDown === 0) {
                            clearInterval(countdownInterval);
                            location.reload();
                        }
                    }, 1000);
                    
                });
                if (timer <= 0) {
                    clearInterval(updateTimer);
                    timerElement.textContent = "";
                    var correctA = document.getElementById('answer');
                    correctA.textContent = "The correct answer was " + data[0].Brand;
                    if (roundC == 5) {
                        socket.emit('round', gameId);
                    } else {
                        var countdown = 3;
                        var countdownDisplay = document.getElementById('roundCount');
                        countdownDisplay.textContent = 'The next round is starting in ' + countdown + ' seconds';
                        var countdownInterval = setInterval(function () {
                            countdown--;
                            countdownDisplay.textContent = 'The next round is starting in ' + countdown + ' seconds';
                            if (countdown == 0) {
                                clearInterval(countdownInterval);
                                var result = document.getElementById('guessResult');
                                var correct = document.getElementById('answer');
                                result.textContent = "";
                                correct.textContent = "";
                                countdownDisplay.textContent = "";
                                socket.emit('round', gameId);
                            }
                        }, 1000);
                    }



                }
            }, 1000);


        });

        socket.on('quitCommand', function () {
            alert('The server is going to shutdown soon.');
        });

        socket.on('playerDisconnected', function (disconnectedPl) {
            alert(`GAME OVER\nPlayer ${disconnectedPl} has disconnected.`);
        });



    });


});

