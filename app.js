let players = [];
let fixedPairs = [];
let matches = [];

function addPlayer() {
    const playerName = document.getElementById('playerName').value;
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        updatePlayerList();
        updatePlayerSelects();
        document.getElementById('playerName').value = '';
    }
}

function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${player}`;
        playerList.appendChild(li);
    });
}

function updatePlayerSelects() {
    const player1Select = document.getElementById('player1Select');
    const player2Select = document.getElementById('player2Select');
    player1Select.innerHTML = '';
    player2Select.innerHTML = '';

    players.forEach(player => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        option1.value = option2.value = player;
        option1.textContent = option2.textContent = player;
        player1Select.appendChild(option1);
        player2Select.appendChild(option2);
    });
}

function addFixedPair() {
    const player1 = document.getElementById('player1Select').value;
    const player2 = document.getElementById('player2Select').value;

    if (player1 !== player2) {
        const pair = [player1, player2];
        if (!fixedPairs.some(p => p.includes(player1) || p.includes(player2))) {
            fixedPairs.push(pair);
            updatePairList();
        } else {
            alert("Uno de estos jugadores ya está en una pareja.");
        }
    } else {
        alert("No puedes elegir el mismo jugador dos veces.");
    }
}

function updatePairList() {
    const pairList = document.getElementById('pairList');
    pairList.innerHTML = '';
    fixedPairs.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = `${pair[0]} y ${pair[1]}`;
        pairList.appendChild(li);
    });
}

function togglePairOptions() {
    const mode = document.getElementById('matchMode').value;
    const fixedPairsSection = document.getElementById('fixedPairsSection');

    if (mode === 'fixed') {
        fixedPairsSection.style.display = 'block';
    } else {
        fixedPairsSection.style.display = 'none';
    }
}

function generateMatches() {
    const mode = document.getElementById('matchMode').value;
    matches = [];
    const matchContainer = document.getElementById('matches');
    matchContainer.innerHTML = '';

    if (mode === 'fixed') {
        if (fixedPairs.length < 2) {
            alert('Necesitas al menos 2 parejas para generar partidos.');
            return;
        }

        // Generar partidos con parejas fijas
        for (let i = 0; i < fixedPairs.length; i++) {
            for (let j = i + 1; j < fixedPairs.length; j++) {
                const match = {
                    team1: fixedPairs[i],
                    team2: fixedPairs[j],
                    goals: {} // Almacenar los goles de cada jugador
                };
                [...fixedPairs[i], ...fixedPairs[j]].forEach(player => {
                    match.goals[player] = 0;
                });
                matches.push(match);
            }
        }

    } else if (mode === 'combinations') {
        if (players.length < 4) {
            alert('Necesitas al menos 4 jugadores para generar partidos.');
            return;
        }

        // Generar todas las combinaciones posibles
        let pairs = getAllPairs(players);
        for (let i = 0; i < pairs.length; i++) {
            for (let j = i + 1; j < pairs.length; j++) {
                if (!haveCommonPlayers(pairs[i], pairs[j])) {
                    const match = {
                        team1: pairs[i],
                        team2: pairs[j],
                        goals: {} // Almacenar los goles de cada jugador
                    };
                    [...pairs[i], ...pairs[j]].forEach(player => {
                        match.goals[player] = 0;
                    });
                    matches.push(match);
                }
            }
        }
    }

    matches.forEach((match, index) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match-item';
        matchDiv.innerHTML = `
            <span>${match.team1[0]} y ${match.team1[1]} vs ${match.team2[0]} y ${match.team2[1]}</span>
            <input type="number" id="resultTeam1_${index}" placeholder="Puntaje equipo 1">
            <input type="number" id="resultTeam2_${index}" placeholder="Puntaje equipo 2">
            <div class="goals-container" id="playersGoals_${index}">
                ${generateGoalControls(index, match)}
            </div>
        `;
        matchContainer.appendChild(matchDiv);
    });
}

function generateGoalControls(index, match) {
    const players = [...match.team1, ...match.team2];
    let controlsHTML = '';

    players.forEach(player => {
        controlsHTML += `
            <div class="goal-controls">
                <span>${player}</span>
                <div class="buttons">
                    <button onclick="addGoal(${index}, '${player}')">+</button>
                    <button onclick="removeGoal(${index}, '${player}')">-</button>
                </div>
                <span class="score" id="goals_${player}_${index}">0</span>
            </div>
        `;
    });

    return controlsHTML;
}

function addGoal(matchIndex, player) {
    matches[matchIndex].goals[player]++;
    updateGoalDisplay(matchIndex, player);
}

function removeGoal(matchIndex, player) {
    if (matches[matchIndex].goals[player] > 0) {
        matches[matchIndex].goals[player]--;
        updateGoalDisplay(matchIndex, player);
    }
}

function updateGoalDisplay(matchIndex, player) {
    const goalElement = document.getElementById(`goals_${player}_${matchIndex}`);
    goalElement.textContent = matches[matchIndex].goals[player];
}

function getAllPairs(arr) {
    let pairs = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            pairs.push([arr[i], arr[j]]);
        }
    }
    return pairs;
}

function haveCommonPlayers(pair1, pair2) {
    return pair1.some(player => pair2.includes(player));
}

function calculateResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    let playerScores = {};
    let teamWins = {};
    let totalGoals = {}; // Almacenar los goles totales por jugador

    players.forEach(player => {
        playerScores[player] = 0;
        totalGoals[player] = 0;
    });

    matches.forEach((match, index) => {
        const team1Score = parseInt(document.getElementById(`resultTeam1_${index}`).value);
        const team2Score = parseInt(document.getElementById(`resultTeam2_${index}`).value);

        if (!isNaN(team1Score) && !isNaN(team2Score)) {
            let winningTeam, losingTeam;
            if (team1Score > team2Score) {
                winningTeam = match.team1;
                losingTeam = match.team2;
            } else {
                winningTeam = match.team2;
                losingTeam = match.team1;
            }

            // Sumar puntos a los jugadores del equipo ganador
            winningTeam.forEach(player => {
                playerScores[player]++;
            });

            // Registrar la victoria de la pareja ganadora
            const teamKey = `${winningTeam[0]} y ${winningTeam[1]}`;
            if (!teamWins[teamKey]) {
                teamWins[teamKey] = 0;
            }
            teamWins[teamKey]++;

            // Sumar goles de los jugadores en este partido al total
            Object.keys(match.goals).forEach(player => {
                totalGoals[player] += match.goals[player];
            });
        }
    });

    // Encontrar el jugador y la pareja con más victorias
    let maxScore = -1;
    let winnerPlayer = '';
    for (let player in playerScores) {
        if (playerScores[player] > maxScore) {
            maxScore = playerScores[player];
            winnerPlayer = player;
        }
    }

    let maxTeamWins = -1;
    let winningTeam = '';
    for (let team in teamWins) {
        if (teamWins[team] > maxTeamWins) {
            maxTeamWins = teamWins[team];
            winningTeam = team;
        }
    }

    // Encontrar el jugador con más goles
    let maxGoals = -1;
    let topScorer = '';
    for (let player in totalGoals) {
        if (totalGoals[player] > maxGoals) {
            maxGoals = totalGoals[player];
            topScorer = player;
        }
    }

    const winnerInfo = document.getElementById('winnerInfo');
    winnerInfo.innerHTML = `
        <h3>El jugador con más victorias es ${winnerPlayer} con ${maxScore} victorias.</h3>
        <h3>La pareja con más victorias es ${winningTeam} con ${maxTeamWins} victorias.</h3>
        <h3>El jugador con más goles es ${topScorer} con ${maxGoals} goles.</h3>
    `;
}
