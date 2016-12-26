// zonecodegen


function randomElement(array) {
    var index = Math.floor(Math.random() * array.length)
    return array[index];
}

function randomDigitCharacter() {
    return String.fromCharCode('0'.charCodeAt(0) + (Math.floor(Math.random() * 9)))
}

function ZoneCodeGen() {

}

ZoneCodeGen.prototype.SYLLABLES = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
ZoneCodeGen.prototype.VOWELS = ['A', 'E', 'I', 'O', 'U'];
ZoneCodeGen.prototype.gen = function (numLetters) {
    const syllables = this.SYLLABLES;
    const vowels = this.VOWELS;

    var result = [];

    var i = 0;
    while( numLetters > 0) {
        var seq = i % 4;
        var letters = syllables;
        if (seq == 1) {
            letters = vowels
        } else if ( seq == 2 ) {
            letters = null; // digit
        }
        if (letters) {
            result.push( randomElement(letters) );
        } else {
            result.push( randomDigitCharacter() );
        }
        i++;
        numLetters --;
    }

    return result;
}

ZoneCodeGen.prototype.isSyllable = function (char) {
    return (this.SYLLABLES.indexOf(char) !== -1)
}

ZoneCodeGen.prototype.isVowel = function (char) {
    return (this.VOWELS.indexOf(char) !== -1)
}

ZoneCodeGen.prototype.isDigit = function (char) {
    var chcode = char.charCodeAt(0);
    return ('0'.charCodeAt(0) <= chcode && chcode <= '9'.charCodeAt(0)) 
}


module.exports = ZoneCodeGen