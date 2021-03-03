import Card from './Card.js';

const suits = ["S", "H", "C", "D"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default class Deck {
    constructor(numberOfDecks) {
        this.cards = newDeck(numberOfDecks);
    }
    get deckLen() {
        return this.cards.length
    }
    pop() {
        return this.cards.shift()
    }
    shuffle() {
        for (let i = this.deckLen - 1; i > 0; i--) {
            const randIndex = Math.floor(Math.random() * (i + 1))
            const tempValue = this.cards[randIndex]
            this.cards[randIndex] = this.cards[i]
            this.cards[i] = tempValue
        }
    }
}

//Generate a deck of multiple decks (decks*52)
function newDeck(decks) {
    var deck = [];
    for (let i = 0; i < decks; i++) {
        for (let j in suits) {
            for (let k in values) {
                deck.push(new Card(suits[j], values[k]));
            }
        }
    }
    return deck;
}