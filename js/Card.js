const cardsMap = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 10,
    "Q": 10,
    "K": 10,
    "A": 11
}

export default class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    intValue() {
        return cardsMap[this.value];
    }

    drawCard(DivId) {
        var cardImg = document.createElement("img");
        var div = document.getElementById(DivId);
        cardImg.src = `images/${this.value}${this.suit}.png`;
        cardImg.setAttribute("width", "100px");
        div.appendChild(cardImg);
        return cardImg;
    }
}