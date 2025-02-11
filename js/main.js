/*----- constants -----*/

const suits = ["s", "c", "d", "h"];
const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K", "A"];
const masterDeck = buildMasterDeck();

/*----- app"s state (variables) -----*/

let pHand, cHand, betVal, bankRoll, handStatus, deck;

/*----- cached element references -----*/

let msgEl = document.getElementById("msg");
let betEl = document.getElementById("bet");
let bankRollEl = document.getElementById("bankRoll");

let cValEl = document.getElementById("cScore");
let cHandEl = document.getElementById("cHand");


let pValEl = document.getElementById("pScore");
let pHandEl = document.getElementById("pHand");

let fiveButton = document.getElementById("five");
let quarterButton = document.getElementById("quarter");
let hundredButton = document.getElementById("hundred");
let fiveHunButton = document.getElementById("fiveHun");

let dealButton = document.getElementById("deal");
let hitButton = document.getElementById("hit");
let standButton = document.getElementById("stand");

/*----- event listeners -----*/

fiveButton.addEventListener("click", playerBet);
quarterButton.addEventListener("click", playerBet);
hundredButton.addEventListener("click", playerBet);
fiveHunButton.addEventListener("click", playerBet);

dealButton.addEventListener("click", dealCards);
hitButton.addEventListener("click", playerHit);
standButton.addEventListener("click", playerStand);

/*----- functions -----*/

init();

function init() {
    pHand = [];
    cHand = [];

    bankRoll = 1500;
    betVal = 0;

    deck = getNewShuffledDeck();
    render();
}

function render() {
    renderCards();
    pValEl.innerHTML = getHandVal(pHand);
    if (handStatus === null) {
        cValEl.innerHTML = "";
    } else {
        cValEl.innerHTML = getHandVal(cHand);
    }
    renderMsg();
    renderControls();
    renderMoney();
}

function playerHit() {
    let card = deck.shift();
    pHand.push(card);

    let pVal = getHandVal(pHand);
    if (pVal > 21) {
        handStatus = "c";
        betVal = 0;
    }
    render();
}

function playerStand() {
    let pVal = getHandVal(pHand);
    let cVal = getHandVal(cHand);

    while (cVal < 17) {
        let card = deck.shift();
        cHand.push(card);
        cVal = getHandVal(cHand);
    };
    if (cVal > 21) {
        handStatus = "p";
        bankRoll += betVal * 2;
        betVal = 0;
    } else if (cVal > pVal) {
        handStatus = "c";
        betVal = 0;
    } else if (cVal < pVal) {
        handStatus = "p";
        bankRoll += betVal * 2;
        betVal = 0;
    } else {
        handStatus = "t";
        bankRoll += betVal;
        betVal = 0;
    }
    render();
}

function renderCards() {
    let html = "";
    cHand.forEach(function (card, idx) {
        if (idx === 0 && handStatus === null) {
            html += `<div class="card back"></div>`;
        } else {
            html += `<div class="card ${card.face}"></div>`;
        }
    });
    cHandEl.innerHTML = html;

    html = "";
    pHand.forEach(function (card, idx) {
        html = html + `<div class="card ${card.face}"></div>`;
    });
    pHandEl.innerHTML = html;
}

function dealCards() {
    cHand = [];
    pHand = [];
    handStatus = null;
    let card = deck.shift();

    pHand.push(card);
    card = deck.shift();
    pHand.push(card);

    cHand.push(card);
    card = deck.shift();
    cHand.push(card);

    let pVal = getHandVal(pHand);
    let cVal = getHandVal(cHand);

    if (pVal === 21 && cVal === 21) {
        handStatus = "t";
        bankRoll += betVal;
        betVal = 0;
    } else if (pVal === 21) {
        handStatus = "pbj";
        bankRoll += betVal + (betVal * 1.5);
        betVal = 0;
    } else if (cVal === 21) {
        handStatus = "cbj";
        betVal = 0;
    }
    render();
}

function getHandVal(hand) {
    let total = 0;
    let totalAces = 0;
    
    hand.forEach(function (card) {
        total += card.value;
        if (card.value === 11) {
            totalAces++;
        }
    });
    while (total > 21 && totalAces > 0) {
        total -= 10;
        totalAces--;
    }
    return total;
}

function playerBet(evt) {
    let bet = parseInt(evt.target.textContent);
    if (bankRoll < bet) return;
    bankRoll -= bet;
    betVal += bet;
    render();
}

function renderMoney() {
    betEl.innerHTML = `Bet $${betVal}`;
    bankRollEl.innerHTML = `Bank Roll $${bankRoll}`;
}

function renderControls() {
    dealButton.style.display = betVal > 0 && handStatus !== null ? "inline-block" : "none";
    standButton.style.display = !handStatus && pHand.length ? "inline-block" : "none";
    hitButton.style.display = !handStatus && pHand.length ? "inline-block" : "none";

    fiveButton.style.display = handStatus !== null ? "inline-block" : "none";
    quarterButton.style.display = handStatus !== null ? "inline-block" : "none";
    hundredButton.style.display = handStatus !== null ? "inline-block" : "none";
    fiveHunButton.style.display = handStatus !== null ? "inline-block" : "none";
}

function renderMsg() {
    if (handStatus === "t") {
        msgEl.innerHTML = `<span style="color: blue">It’s a Tie!</span>`;
    } else if (handStatus === "pbj") {
        msgEl.innerHTML = `Player Has <span style="color: green">BlackJack!</span>`;
    } else if (handStatus === "cbj") {
        msgEl.innerHTML = `Dealer Has <span style="color: red">BlackJack!</span>`;
    } else if (handStatus === "p") {
        msgEl.innerHTML = `<span style="color: green">Player Wins!</span>`;
    } else if (handStatus === "c") {
        msgEl.innerHTML = `<span style="color: red">Dealer Wins!</span>`;
    } else if (handStatus === null) {
        msgEl.textContent = "Hit or Stand";
    }
}

function getNewShuffledDeck() {
    // Create a copy of the masterDeck (leave masterDeck untouched!)
    const tempDeck = [...masterDeck];
    const newShuffledDeck = [];
    // access event.listener and then use event listener
    while (tempDeck.length) {
        // Get a random index for a card still in the tempDeck
        const rndIdx = Math.floor(Math.random() * tempDeck.length);
        // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
        newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
    }
    return newShuffledDeck;
}

function buildMasterDeck() {
    const deck = [];
    // Use nested forEach to generate card objects
    suits.forEach(function (suit) {
        ranks.forEach(function (rank) {
            deck.push({
                // The "face" property maps to the library"s CSS classes for cards
                face: `${suit}${rank}`,
                // Setting the "value" property for game of blackjack, not war
                value: Number(rank) || (rank === "A" ? 11 : 10) //
            });
        });
    });
    return deck;
}