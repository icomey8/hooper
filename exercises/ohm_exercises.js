import { describe, it } from "node:test";
import assert from "assert";
import * as ohm from "ohm-js";

const grammars = {
	canadianPostalCode: String.raw`
    code = firstletter digit nonfirstletter " " digit nonfirstletter digit
    nonfirstletter = "A".."C" | "E" | "G".."H" | "J".."N" | "P" | "R".."T" | "V".."Z" 
    firstletter = nonfirstletter | "D" | "W"
  `,

	visa: String.raw`
	    visa = "4" (digit15 | digit12)
        digit12 = d d d d d d d d d d d d
        digit15 = d d d d d d d d d d d d d d d
        d = digit
	  `,

	 	masterCard: String.raw`
	      masterCard = ("51".."55" digit{14}) | ("2221".."2720" digit{12})
	   `,

	 	notThreeEndingInOO: String.raw`
        word = letter+ ~("o" | "O") ("o" | "O") end

	   `,

    divisibleBy16: String.raw`
       binNum = zeroes | binaryWithFourZeros
     
       zeroes = "0"+
       binaryWithFourZeros = "1" binary* "0000"
       
       binary = "0" | "1"
     `,

	 	eightThroughThirtyTwo: String.raw`
       num = digit8_9         
           | oneToNineTeen    
           | twentyToTwentyNine   
           | thirtyToThirtyTwo   
   
       oneToNineTeen = "1" digit
       twentyToTwentyNine = "2" digit
       thirtyToThirtyTwo = "3" ("0" | "1" | "2")
   
       digit8_9 = "8" | "9"
	   `,

	 	notPythonPycharmPyc: String.raw`
    word = ~("python" | "pycharm" | "pyc") letter+

    float = number "." digit* "e" sign? exponent 
    number = digit+
    sign = "+" | "-"
    exponent = digit digit? digit? 	   `,

	 	restrictedFloats: String.raw`
 float = number "." digit* "e" sign? exponent  
    number = digit+
    sign = "+" | "-"
    exponent = digit (digit digit?)? 
	   `,

       palindromes2358: String.raw`
       palindrome = twoPal | threePal | fivePal | eightPal
     
       twoPal = letter letter
                &match2
     
       threePal = letter any letter
                  &match3
     
       fivePal = letter any any any letter
                 &match5
     
       eightPal = letter any any any any any any letter
                  &match8
     
       match2 = ~letter letter
       match3 = ~letter any letter
       match5 = ~letter any any any letter
       match8 = ~letter any any any any any any letter
     `
     

	 	pythonStringLiterals: String.raw`
string = singleQuotedString | doubleQuotedString | tripleQuotedString | fString

fString = ("f" | "F") (fSingleQuotedString | fDoubleQuotedString | fTripleQuotedString)

singleQuotedString = "'" singleChar* "'"  
doubleQuotedString = "\"" doubleChar* "\""  
tripleQuotedString = "'''" tripleChar* "'''" 
                   | "\"\"\"" tripleChar* "\"\"\""

fSingleQuotedString = "'" fChar* "'"  
fDoubleQuotedString = "\"" fChar* "\""  
fTripleQuotedString = "'''" fChar* "'''" 
                    | "\"\"\"" fChar* "\"\"\""

singleChar = ~"'" escapedChar | any
doubleChar = ~"\"" escapedChar | any
tripleChar = ~("'''" | "\"\"\"") (escapedChar | any)

fChar = ~"'" fEscapedChar | any
fEscapedChar = "\\" (
    "n" | "t" | "\"" | "'" | "\\" | validUnicodeEscape | incompleteUnicodeEscape
)

escapedChar = "\\" (
    "n" | "t" | "\"" | "'" | "\\" | validUnicodeEscape
)

validUnicodeEscape = "\\" ("u" hexGroup4 | "U" hexGroup8)

incompleteUnicodeEscape = "\\" ("u" | "U") ~hexDigit 

hexGroup4 = hexDigit hexDigit hexDigit hexDigit
hexGroup8 = hexDigit hexDigit hexDigit hexDigit hexDigit hexDigit hexDigit hexDigit
	   `,
};

function matches(name, string) {
	const grammar = `G {${grammars[name]}}`;
	return ohm.grammar(grammar).match(string).succeeded();
}

const testFixture = {
	canadianPostalCode: {
		good: ["A7X 2P8", "P8E 4R2", "K1V 9P2", "Y3J 5C0"],
		bad: [
			"A7X   9B2",
			"C7E 9U2",
			"",
			"Dog",
			"K1V\t9P2",
			" A7X 2P8",
			"A7X 2P8 ",
		],
	},
	visa: {
		good: ["4128976567772613", "4089655522138888", "4098562516243"],
		bad: [
			"43333",
			"42346238746283746823",
			"7687777777263211",
			"foo",
			"π",
			"4128976567772613 ",
		],
	},
	// masterCard: {
	// 	good: [
	// 		"5100000000000000",
	// 		"5294837679998888",
	// 		"5309888182838282",
	// 		"5599999999999999",
	// 		"2221000000000000",
	// 		"2720999999999999",
	// 		"2578930481258783",
	// 		"2230000000000000",
	// 	],
	// 	bad: [
	// 		"5763777373890002",
	// 		"513988843211541",
	// 		"51398884321108541",
	// 		"",
	// 		"OH",
	// 		"5432333xxxxxxxxx",
	// 	],
	// },
	// notThreeEndingInOO: {
	// 	good: ["", "fog", "Tho", "one", "a", "ab", "food"],
	// 	bad: ["fOo", "gOO", "HoO", "zoo", "MOO", "123", "A15"],
	// },
	// divisibleBy16: {
	// 	good: [
	// 		"0",
	// 		"00",
	// 		"000",
	// 		"00000",
	// 		"00000",
	// 		"000000",
	// 		"00000000",
	// 		"1101000000",
	// 	],
	// 	bad: ["1", "00000000100", "1000000001", "dog0000000"],
	// },
	// eightThroughThirtyTwo: {
	// 	good: Array(25)
	// 		.fill(0)
	// 		.map((x, i) => i + 8),
	// 	bad: ["1", "0", "00003", "dog", "", "361", "90", "7", "-11"],
	// },
	// notPythonPycharmPyc: {
	// 	good: [
	// 		"",
	// 		"pythons",
	// 		"pycs",
	// 		"PYC",
	// 		"apycharm",
	// 		"zpyc",
	// 		"dog",
	// 		"pythonpyc",
	// 	],
	// 	bad: ["python", "pycharm", "pyc"],
	// },
	// restrictedFloats: {
	// 	good: ["1e0", "235e9", "1.0e1", "1.0e+122", "55e20"],
	// 	bad: ["3.5E9999", "2.355e-9991", "1e2210"],
	// },
	// palindromes2358: {
	// 	good: [
	// 		"aa",
	// 		"bb",
	// 		"cc",
	// 		"aaa",
	// 		"aba",
	// 		"aca",
	// 		"bab",
	// 		"bbb",
	// 		"ababa",
	// 		"abcba",
	// 		"aaaaaaaa",
	// 		"abaaaaba",
	// 		"cbcbbcbc",
	// 		"caaaaaac",
	// 	],
	// 	bad: ["", "a", "ab", "abc", "abbbb", "cbcbcbcb"],
	// },
	// pythonStringLiterals: {
	// 	good: String.raw`''
	//   ""
	//   'hello'
	//   "world"
	//   'a\'b'
	//   "a\"b"
	//   '\n'
	//   "a\tb"
	//   f'\u'
	//   """abc"""
	//   '''a''"''"'''
	//   """abc\xdef"""
	//   '''abc\$def'''
	//   '''abc\''''`
	// 		.split("\n")
	// 		.map((s) => s.trim()),
	// 	bad: String.raw`
	//   'hello"
	//   "world'
	//   'a'b'
	//   "a"b"
	//   'a''
	//   "x""
	//   """"""""
	//   frr"abc"
	//   'a\'
	//   '''abc''''
	//   """`
	// 		.split("\n")
	// 		.map((s) => s.trim()),
	// },
};

for (let name of Object.keys(testFixture)) {
	describe(`when matching ${name}`, () => {
		for (let s of testFixture[name].good) {
			it(`accepts ${s}`, () => {
				assert.ok(matches(name, s));
			});
		}
		for (let s of testFixture[name].bad) {
			it(`rejects ${s}`, () => {
				assert.ok(!matches(name, s));
			});
		}
	});
}
