const state = {
  audio: {
    backgroundAudio: false,
  },
  score: {
    playerLifePoints: 4000,
    computerLifePoints: 4000,
    lifePointsBox: document.getElementById("life-points"),
  },
  cardSprites: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
    attack: document.getElementById("card-attack"),
    defense: document.getElementById("card-defense"),
  },
  playerSides: {
    player1: "player-monster-zone",
    player1Spell: "player-spell-zone",
    player2: "computer-monster-zone",
    player2Spell: "computer-spell-zone",
  },
  fieldCards: {
    player: [],
    computer: [],
  },
  actions: {
    button: document.getElementById("next-duel"),
  },
  battleMessage: document.getElementById("battle-message"),
  phase: "compra",
  turn: "player1",
  turnCount: 0,
};

const audioPlayer = document.getElementById("audio-player");
const bgm = document.getElementById("bgm");

audioPlayer.addEventListener("click", () => {
  state.audio.backgroundAudio = !state.audio.backgroundAudio;

  if (state.audio.backgroundAudio) {
    audioPlayer.classList.add("active");
    audioPlayer.classList.remove("inactive");
    bgm.play();
  } else {
    audioPlayer.classList.add("inactive");
    audioPlayer.classList.remove("active");
    bgm.pause();
  }
});

const pathImages = "./src/assets/icons/";

const cardData = [
  {
    id: 0,
    name: "Boitatá",
    type: "Fire Snake",
    attackPoints: 2400,
    defensePoints: 1800,
    img: `${pathImages}carta boitata.jpg`,
  },
  {
    id: 1,
    name: "Boto",
    type: "Water Spirit",
    attackPoints: 2500,
    defensePoints: 2000,
    img: `${pathImages}carta boto.jpg`,
  },
  {
    id: 2,
    name: "Curupira",
    type: "Forest Guardian",
    attackPoints: 2100,
    defensePoints: 1600,
    img: `${pathImages}carta curupira.jpg`,
  },
];

function init() {
  state.fieldCards.player = [];
  state.fieldCards.computer = [];
  drawCards(5, state.playerSides.player1);
  drawCards(5, state.playerSides.player2);
  updatePhaseDisplay();
}

async function drawCards(cardsNumber, fieldSide) {
  for (let i = 0; i < cardsNumber; i++) {
    const randomCard = await getRandomCard();
    const cardImage = createCardImage(randomCard, fieldSide);
    document.getElementById(fieldSide).appendChild(cardImage);
    if (fieldSide === state.playerSides.player1) {
      state.fieldCards.player.push(randomCard);
    } else {
      state.fieldCards.computer.push(randomCard);
    }
  }
}

function createCardImage(card, fieldSide) {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-container");

  const cardImage = document.createElement("img");
  cardImage.setAttribute("height", "150px");
  cardImage.setAttribute("data-id", card.id);
  cardImage.classList.add("card");

  cardImage.src = fieldSide === state.playerSides.player2 ? `${pathImages}card-back.jpg` : card.img;
  if (fieldSide === state.playerSides.player1) {
    cardImage.addEventListener("click", () => {
      if (state.phase === "main" && state.turn === "player1") {
        setCard(card, fieldSide);
      }
    });
  }

  const cardName = document.createElement("div");
  cardName.classList.add("card-name");
  cardName.innerText = fieldSide === state.playerSides.player1 ? card.name : "";

  cardContainer.appendChild(cardImage);
  cardContainer.appendChild(cardName);

  return cardContainer;
}

function setCard(card, fieldSide) {
  if (state.phase === "main" && state.turn === "player1") {
    const index = state.fieldCards.player.findIndex(c => c.id === card.id);
    if (index !== -1) {
      state.fieldCards.player.splice(index, 1);
      const monsterZone = document.getElementById(state.playerSides.player1);
      const cardElement = monsterZone.querySelector(`[data-id="${card.id}"]`);
      if (cardElement) {
        cardElement.parentElement.remove();
      }
      displayFieldCards();
    }
  }
}

function displayFieldCards() {
  const playerZone = document.getElementById(state.playerSides.player1);
  const computerZone = document.getElementById(state.playerSides.player2);
  
  playerZone.innerHTML = '';
  computerZone.innerHTML = '';
  
  state.fieldCards.player.forEach(card => {
    const cardImage = createCardImage(card, state.playerSides.player1);
    playerZone.appendChild(cardImage);
  });

  state.fieldCards.computer.forEach(card => {
    const cardImage = createCardImage(card, state.playerSides.player2);
    computerZone.appendChild(cardImage);
  });
}

function nextPhase() {
  if (state.phase === "compra") {
    state.phase = "main";
  } else if (state.phase === "main") {
    state.phase = "ataque";
  } else if (state.phase === "ataque") {
    state.phase = "compra";
    state.turnCount++;
  }
  updatePhaseDisplay();
  alternarTurno();
}

function updatePhaseDisplay() {
  const phaseMessages = {
    compra: "Compra de cartas",
    main: "Fase principal",
    ataque: "Fase de ataque",
  };
  state.battleMessage.textContent = phaseMessages[state.phase];
}

function alternarTurno() {
  if (state.phase === "ataque") {
    state.turn = state.turn === "player1" ? "computer" : "player1";
  }
}

async function setCardsField(cardId) {
  if (state.phase !== "ataque") {
    alert("Apenas na fase de batalha você pode atacar!");
    return;
  }
  const playerCard = cardData[cardId];
  const computerCard = await getRandomCard();

  state.fieldCards.player.push(playerCard);
  state.fieldCards.computer.push(computerCard);

  displayFieldCards();

  const duelResult = await checkDuelResult(playerCard, computerCard);
  await updateLifePoints();
  state.battleMessage.innerText = duelResult;

  alternarTurno();
}

async function resetDuel() {
  state.cardSprites.name.innerText = "Selecione";
  state.cardSprites.type.innerText = "uma carta";
  state.cardSprites.avatar.src = "";

  state.fieldCards.player = [];
  state.fieldCards.computer = [];

  init();
}

async function updateLifePoints() {
  state.score.lifePointsBox.innerText = `Player LP: ${state.score.playerLifePoints} | Opponent LP: ${state.score.computerLifePoints}`;
}

async function checkDuelResult(playerCard, computerCard) {
  let duelResult = "";
  const playerAttack = playerCard.attackPoints;
  const computerAttack = computerCard.attackPoints;

  if (state.fieldCards.computer.length === 0) {
    state.score.computerLifePoints -= playerAttack; // Dano direto
    duelResult = "Dano direto! Você causou " + playerAttack + " de dano.";
  } else if (playerAttack > computerAttack) {
    duelResult = "Vitória! Você causou " + (playerAttack - computerAttack) + " de dano.";
    state.score.computerLifePoints -= (playerAttack - computerAttack);
  } else if (computerAttack > playerAttack) {
    duelResult = "Derrota! Você recebeu " + (computerAttack - playerAttack) + " de dano.";
    state.score.playerLifePoints -= (computerAttack - playerAttack);
  } else {
    duelResult = "Empate!";
  }

  if (state.score.playerLifePoints <= 0) {
    duelResult = "Game Over! Você perdeu!";
  } else if (state.score.computerLifePoints <= 0) {
    duelResult = "Parabéns! Você venceu!";
  }

  return duelResult;
}

async function drawSelectedCard(cardId) {
  const selectedCard = cardData[cardId];

  state.cardSprites.avatar.src = selectedCard.img;
  state.cardSprites.name.innerText = selectedCard.name;
  state.cardSprites.type.innerText = `Attribute: ${selectedCard.type}`;
  state.cardSprites.attack.innerText = `ATK: ${selectedCard.attackPoints}`;
  state.cardSprites.defense.innerText = `DEF: ${selectedCard.defensePoints}`;
}

async function getRandomCard() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex];
}

// Inicializa o jogo
init();

// Adiciona o evento ao botão para avançar a fase
state.actions.button.addEventListener("click", nextPhase);








