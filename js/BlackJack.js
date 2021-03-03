import Deck from './Deck.js';

var deck = new Deck(6);;
var dealerCards = [];
var playerCards = [];
var splitCards = [];
var chips = 1000;
var betValue = 0;
var betValueSplit = 0;
var dealerValue = 0;
var playerValue = 0;
var splitValue = 0;
var splitClicked = false;
var leftHand = true;
var leftHandOver = false;
var rightHandOver = false;
var backCard;
var firstGame = true;

//Set HTML elements in variables
var betInput = document.getElementById('bet-input');
var dealerCardsValueEl = document.getElementById('dealer-cards-value');
var playerCardsValueEl = document.getElementById('player-cards-value');
var splitCardsValueEl = document.getElementById('split-cards-value');
var lStatusEl = document.getElementById('left-status');
var rStatusEl = document.getElementById('right-status');
var chipsEl = document.getElementById("chips");
var gameStatusEl = document.getElementById('game-status');
var playerBetEl = document.getElementById('player-bets');
var dealerCardsEl = document.getElementById('dealer-cards');
var playerCardsEl = document.getElementById('player-cards');
var splitCardsEl = document.getElementById('split-cards');
var splitEl = document.getElementById('split');
var leftHandEl = document.getElementById('left-Hand');
var rightHandEl = document.getElementById('right-Hand');
var playerBoxEl = document.getElementById('player-box');
var splitBoxEl = document.getElementById('split-box');

//Set buttons in variables
var startGameBtn = document.getElementById('button-startGame');
var betBtn = document.getElementById('button-bet');
var dealBtn = document.getElementById('button-deal');
var hitBtn = document.getElementById('button-hit');
var standBtn = document.getElementById('button-stand');
var doubleBtn = document.getElementById('button-double');
var splitBtn = document.getElementById('button-split');

//Set event listeners for buttons
startGameBtn.addEventListener('click', startGame);
betBtn.addEventListener('click', bet);
dealBtn.addEventListener('click', dealCards);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
doubleBtn.addEventListener('click', double);
splitBtn.addEventListener('click', split);

//Audio
const clickSound = new Audio('sounds/click.wav');
const chipsSound = new Audio('sounds/chipsSound.wav');
const cardSound = new Audio('sounds/card.wav');
const winSound = new Audio('sounds/win.wav');
const lostSound = new Audio('sounds/lost.wav');

//START GAME button
function startGame() {
    clickSound.play();
    startGameBtn.remove();
    betBtn.style.display = 'inline';
    betInput.style.display = 'inline';
    gameStatusEl.innerHTML = "Place your BET";
}

//BET button
function bet() {
    if (firstGame) {
        firstGame = false;
    } else {
        clearElements();
    }
    //Get bet's value
    betValue = parseInt(betInput.value);
    var status = "";

    //If bet's value is valid
    if (betValue > 0 && betValue <= chips) {
        chipsSound.play();
        chips -= betValue;
        chipsEl.innerHTML = chips;
        playerBetEl.innerHTML = betValue;
        dealBtn.style.display = 'inline';
        betBtn.style.display = 'none';
        betInput.style.display = 'none';
        status = "Click on Deal cards to start dealing";

        //No chips left
    } else if (chips < 1) {
        status = "GAME OVER - You lost all chips";
        //Bet is lower than player's chips
    } else if (betValue > chips) {
        status = `Your bet is higher than availvable chips: ${chips}`;
        //Bet isn't placed or bet==0
    } else {
        status = "Plase set your bet higher than 0";
    }
    //Update status
    gameStatusEl.innerHTML = status;
}

//DEAL CARDS button
function dealCards() {
    cardSound.play();

    //Shuffle deck
    deck.shuffle();

    //Start dealing cards
    startDealing();

    //Get cards value and update HTML
    playerValue = totalValue(playerCards);
    playerCardsValueEl.innerHTML = playerValue;
    dealerCardsValueEl.innerHTML = dealerCards[0].intValue();

    //BlackJack
    if (playerValue == 21) {
        gameOver();

    } else {
        //UPDATE HTML elements
        hitBtn.style.display = 'inline';
        doubleBtn.style.display = 'inline';
        standBtn.style.display = 'inline';
        dealBtn.style.display = 'none';
        gameStatusEl.innerHTML = "Hit, stand or double";

        //Check if SPLIT is possible
        if (playerCards[0].intValue() == playerCards[1].intValue() && chips >= betValue * 2) {
            splitBtn.style.display = 'inline';
        }
    }
}

//HIT button
function hit() {
    cardSound.play();
    splitBtn.style.display = 'none';

    //Get a card from deck
    var hitCard = deck.cards.pop();

    //NO SPLIT
    if (!splitClicked) {
        //Deal card to player and get cards total value
        playerValue = dealCard(playerCards, hitCard, playerCardsValueEl, "player-cards");
        if (playerValue >= 21 || leftHandOver) {
            gameOver();
        }
        //SPLIT
    } else {

        //LEFT HAND
        if (!leftHandOver && leftHand) {
            if (!rightHandOver) {
                leftHand = false;
                //Set status for next round
                gameStatusEl.innerHTML = "Hit, stand or double for <span style='color:red'>RIGHT</span> hand";
            }
            //Deal card to left hand and get cards total value
            playerValue = dealCard(playerCards, hitCard, playerCardsValueEl, "player-cards");
            if (playerValue >= 21) {
                leftHandOver = true;
            }

            //RIGHT HAND
        } else if (!rightHandOver && !leftHand) {
            if (!leftHandOver) {
                leftHand = true;
                gameStatusEl.innerHTML = "Hit, stand or double for <span style='color:yellow'>LEFT</span> hand";
            }
            //Deal card to right hand and get cards total value
            splitValue = dealCard(splitCards, hitCard, splitCardsValueEl, "split-cards");
            if (splitValue >= 21) {
                rightHandOver = true;
            }
        }
        //BOTH HANDS FINISHED
        if (rightHandOver && leftHandOver) {
            gameOver();
        }
    }
}

//DOUBLE button
function double() {
    splitBtn.style.display = 'none';

    //Check if player has enough chips to double
    if (chips >= betValue * 2) {
        chipsSound.play();
        cardSound.play();

        //NO SPLIT
        if (!splitClicked) {
            chips -= betValue;
            chipsEl.innerHTML = chips;
            betValue *= 2;
            playerBetEl.innerHTML = betValue;
            leftHandOver = true;
            hit();

            //SPLIT
        } else {
            //Get a card from deck
            var hitCard = deck.cards.pop();

            //LEFT HAND
            if (!leftHandOver && leftHand) {
                leftHandOver = true;
                //Deal card and update values
                dealCardUpdate(playerValue, betValue, playerCards, hitCard, rightHandOver, playerCardsValueEl, "player-cards", "RIGHT");
                betValue *= 2;

                //RIGHT HAND
            } else if (!rightHandOver && !leftHand) {
                rightHandOver = true;
                dealCardUpdate(splitValue, betValueSplit, splitCards, hitCard, leftHandOver, splitCardsValueEl, "split-cards", "LEFT");
                betValueSplit *= 2;
            }
            playerBetEl.innerHTML = betValue + betValueSplit;

            //BOTH HANDS FINISHED
            if (rightHandOver && leftHandOver) {
                gameOver();
            }
        }
    } else {
        gameStatusEl.innerHTML = "You don't have enough chips to double";
    }
}

//STAND button
function stand() {
    clickSound.play();
    splitBtn.style.display = 'none';

    //NO SPLIT
    if (!splitClicked) {
        gameOver();

        //SPLIT
    } else {
        //LEFT HAND
        if (!leftHandOver && leftHand) {
            if (!rightHandOver) {
                leftHand = false;
            }
            leftHandOver = true;
            gameStatusEl.innerHTML = "Hit, stand or double for <span style='color:red'>RIGHT</span> hand";

            //RIGHT HAND
        } else if (!rightHandOver && !leftHand) {
            if (!leftHandOver) {
                leftHand = true;
            }
            rightHandOver = true;
            gameStatusEl.innerHTML = "Hit, stand or double for <span style='color:yellow'>LEFT</span> hand";
        }
        //BOTH HANDS FINISHED
        if (rightHandOver && leftHandOver) {
            gameOver();
        }
    }
}

//SPLIT button
function split() {
    cardSound.play();
    splitClicked = true;

    //Update chips and bet
    chips -= betValue;
    betValueSplit = betValue;
    chipsEl.innerHTML = chips;
    playerBetEl.innerHTML = betValue * 2;

    //Update HTML elements
    splitEl.style.display = 'grid';
    leftHandEl.innerHTML = "LEFT HAND";
    rightHandEl.innerHTML = "RIGHT HAND";
    playerBoxEl.style.marginTop = "7px";
    splitBoxEl.style.marginTop = "7px";
    splitBtn.style.display = 'none';

    //Get a card from player's deck and push it to the splitCards (from left to right hand)
    splitCards.push(playerCards.pop());
    //Get a card from a DECK and push it to LEFT HAND
    playerCards.push(deck.cards.pop());
    //Get a card from a DECK and push it to RIGHT HAND
    splitCards.push(deck.cards.pop());

    //Clear player's old cards
    playerCardsEl.innerHTML = "";

    //Display player's new cards
    for (let i in playerCards) {
        playerCards[i].drawCard("player-cards");
    }

    //Display split cards
    for (let i in splitCards) {
        splitCards[i].drawCard("split-cards");
    }

    //Get cards values and update HTML
    playerValue = totalValue(playerCards);
    splitValue = totalValue(splitCards);
    playerCardsValueEl.innerHTML = playerValue;
    splitCardsValueEl.innerHTML = splitValue;
    gameStatusEl.innerHTML = "Hit, stand or double for <span style='color:yellow'>LEFT</span> hand";

    //BlackJack LEFT HAND
    if (playerValue == 21) {
        leftHandOver = true;
    }
    //BlackJack RIGHT HAND
    if (splitValue == 21) {
        rightHandOver = true;
    }
    if (leftHandOver && rightHandOver) {
        gameOver();
    }
}

//Display all cards and calculate earned chips
function gameOver() {

    //Dealer has to get minimum of 17 points
    while (totalValue(dealerCards) < 17) {
        dealerCards.push(deck.cards.pop());
    }

    //Get cards value and update HTML
    dealerValue = (totalValue(dealerCards));
    playerValue = (totalValue(playerCards));
    dealerCardsValueEl.innerHTML = dealerValue;
    playerCardsValueEl.innerHTML = playerValue;

    //CALCULATE EARNED CHIPS (left hand in case of split)
    var playerResult = getChips(playerValue, betValue, lStatusEl);
    var splitResult = 0;

    //SPLIT
    if (splitClicked) {
        //Get cards value for RIGHT HAND and update HTML
        splitValue = (totalValue(splitCards));
        splitCardsValueEl.innerHTML = splitValue;

        //Earned CHIPS for RIGHT HAND
        splitResult = getChips(splitValue, betValueSplit, rStatusEl);
    }

    //Remove back card
    backCard.remove();

    //Display dealer's cards (without first one)
    for (let i = 1; i < dealerCards.length; i++) {
        dealerCards[i].drawCard("dealer-cards");
    }

    //Set final variables
    var finalResult = playerResult + splitResult;
    var betTotal = betValue + betValueSplit;
    var status = "";
    chips += finalResult;

    //PUSH
    if (finalResult == betTotal) {
        status = "YOU GET YOUR BET BACK. SET YOUR BET TO PLAY AGAIN";
        //WON
    } else if (finalResult > betTotal) {
        status = `YOU WON ${finalResult} CHIPS!!! SET YOUR BET TO PLAY AGAIN`;
        winSound.play();
        //LOST and WON
    } else if (finalResult != 0) {
        status = `YOU LOST -${betTotal} AND WON +${finalResult} CHIPS. SET YOUR BET TO PLAY AGAIN`;
        //LOST
    } else {
        status = "YOU LOST YOUR BET. SET YOUR BET TO PLAY AGAIN";
        lostSound.play();
    }

    //Update HTML
    gameStatusEl.innerHTML = status;
    chipsEl.innerHTML = chips;
    betBtn.style.display = 'inline';
    betInput.style.display = 'inline';

    //Reset all variables
    resetGame();
}

//Calculate earned chips
function getChips(cardsValue, betValue, statusEl) {
    //BUST
    if (cardsValue > 21) {
        statusEl.innerHTML = "BUST"
        return 0;
        //WIN
    } else if (dealerValue > 21 || cardsValue > dealerValue) {
        statusEl.innerHTML = "WIN";
        return betValue * 1.5;
        //PUSH
    } else if (cardsValue == dealerValue) {
        statusEl.innerHTML = "PUSH / TIE";
        return betValue;
        //LOST
    } else {
        statusEl.innerHTML = "LOST";
        return 0;
    }
}

//Start dealing cards
function startDealing() {
    //Get 2 cards from a deck and push first to the dealer and second to player
    for (let i = 0; i < 2; i++) {
        dealerCards.push(deck.cards.pop());
        playerCards.push(deck.cards.pop());
    }
    //Display dealer's cards
    dealerCards[0].drawCard("dealer-cards");
    drawBackCard();

    //Display player's cards
    for (let i in playerCards) {
        playerCards[i].drawCard("player-cards");
    }
}

//Deal 1 card to player (left or right hand)
function dealCard(cards, card, element, div) {
    cards.push(card);
    var totalVal = (totalValue(cards) * 1 + 0);
    element.innerHTML = totalVal;
    card.drawCard(div);
    return totalVal;
}

//Display back card
function drawBackCard() {
    backCard = document.createElement("img");
    var div = document.getElementById("dealer-cards");
    backCard.src = `images/back.png`;
    backCard.setAttribute("width", "100px");
    backCard.setAttribute("id", "back");
    div.appendChild(backCard);
}

//Get total cards value
function totalValue(cardsArr) {
    var result = 0;
    var numbOfAces = 0;
    for (let i in cardsArr) {
        result += cardsArr[i].intValue();
        //Count number of aces
        if (cardsArr[i].value == "A") {
            numbOfAces++;
        }
    }
    if (result > 21) {
        //Check for aces
        while (numbOfAces > 0 && result > 21) {
            //Set their value from 11 to 1
            result -= 10;
            numbOfAces--;
        }
    }
    return result;
}

//Deal card (in case of double) and update chips and HTML
function dealCardUpdate(value, bet, cards, card, otherHandOver, element, div, hand) {
    if (!otherHandOver) {
        leftHand ^= true;
    }
    cards.push(card);
    value = totalValue(cards);
    chips -= bet;
    element.innerHTML = value;
    card.drawCard(div);
    chipsEl.innerHTML = chips;
    gameStatusEl.innerHTML = `Hit, stand or double for <span style='color:red'>${hand}</span> hand`;
}

//Reset all variables from previus game
function resetGame() {
    deck = new Deck(6);;
    dealerCards = [];
    playerCards = [];
    splitCards = [];
    betValue = 0;
    betValueSplit = 0;
    dealerValue = 0;
    playerValue = 0;
    splitValue = 0;
    splitClicked = false;
    leftHand = true;
    leftHandOver = false;
    rightHandOver = false;
    //HTML
    hitBtn.style.display = 'none';
    doubleBtn.style.display = 'none';
    standBtn.style.display = 'none';
    dealBtn.style.display = 'none';
}

//Clear HTML elements from previus game
function clearElements() {
    dealerCardsEl.innerHTML = '';
    playerCardsEl.innerHTML = '';
    splitCardsEl.innerHTML = '';
    dealerCardsValueEl.innerHTML = '';
    playerCardsValueEl.innerHTML = '';
    leftHandEl.innerHTML = '';
    rightHandEl.innerHTML = '';
    splitEl.style.display = "none";
    lStatusEl.innerHTML = '';
    playerBoxEl.style.marginTop = "37px";
    splitBoxEl.style.marginTop = "37px";
}