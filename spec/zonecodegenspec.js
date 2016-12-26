
describe("ZoneCodeGen", function() {
    const ZoneCodeGen = require('../app/zonecodegen')
    var codegen = new ZoneCodeGen()

    it("'B' is Syllable", function() {
        expect(codegen.isSyllable('B')).toBe(true);
    });

    it("'AEIOU' are Vowels", function() {
        var vowels = ['A', 'E', 'I', 'O', 'U'];
        for ( var i = 0; i < vowels.length; i++ ) {
            expect(codegen.isVowel(vowels[i])).toBe(true);
        }
    });

    it("'0123456789' are Digits", function() {
        var chcode0 = '0'.charCodeAt(0)

        for ( var i = 0; i < 10; i++ ) {
            expect(codegen.isDigit(String.fromCharCode(chcode0 + i))).toBe(true);
        }
    });

    it("'0' is a Digit", function() {
        expect(codegen.isDigit('0')).toBe(true);
    });

    it("returns 1 character string with gen(1)", function() {
        var code = codegen.gen(1)
        expect(code.length).toBe(1);
        expect(codegen.isSyllable(code[0])).toBe(true);
    });

    it("returns 2 characters string with gen(2)", function() {
        var code = codegen.gen(2)
        expect(code.length).toBe(2);
        expect(codegen.isVowel(code[1])).toBe(true);
    });
    it("returns 3 character string with gen(3)", function() {
        var code = codegen.gen(3)
        expect(code.length).toBe(3);
        expect(codegen.isDigit(code[2])).toBe(true);
    });
    it("returns 4 character string with gen(4)", function() {
        var code = codegen.gen(4);
        expect(code.length).toBe(4);
        expect(codegen.isSyllable(code[3])).toBe(true);
    });
    it("returns 6 character string with gen(6)", function() {
        var code = codegen.gen(6)
        expect(code.length).toBe(6);
        expect(codegen.isVowel(code[5])).toBe(true);
    });
    it("returns 7 character string with gen(7)", function() {
        var code = codegen.gen(7)
        expect(code.length).toBe(7);
        expect(codegen.isDigit(code[6])).toBe(true);
    });
    it("returns 8 character string with gen(8)", function() {
        var code = codegen.gen(8);
        expect(code.length).toBe(8);
        expect(codegen.isSyllable(code[7])).toBe(true);
    });
    
});