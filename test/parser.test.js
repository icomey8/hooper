import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

// ADD MORE PARSER TESTS

const syntaxChecks = [
	["simplest syntactically correct program", "break;"],
	["arithmetic", "log 2 * x + 3 / 5 - -1 % 7 ** 3 ** 3;"],
	["variable declarations", "pick e=99*1;\npick z=false;"],
	["assignments", "abc=9*3; a=1; c++;"],
	["this is an valid comment", "# i am a hooper comment!"],
	["short if", "if x == 2 { log(2); }"],
	["if with an else statement", "if x == 2 { log(2); } putback { log(3);} "],
	["short if statement", "if x == 2 { log(2); }"],
	["assignment to array element", "c[2] = 100;"], // add to other
	["array element increment", "c[2]++;"], // add to other
];

const syntaxErrors = [
	["malformed number", "pick x= 2.;", /Line 1, col 11:/],
	["a float with an E but no exponent", "pick x = 5E * 11;", /Line 1, col 12:/],
	["a missing right operand", "log(5 -);", /Line 1, col 8:/],
	["assignments with missing value", "abc=9*3; a=; a--;", /Line 1, col 12:/],
	["this is an invalid comment", "// i am a js comment!;", /Line 1, col 1:/],
	["invalid short if", "if { log(2); }", /Line 1, col 4:/],
	["if as identifier", "if x = 3;", /Line 1, col 6:/],
	["booleans are not incrementable", "true--;", /Line 1, col 5:/], // add to other
	["booleans do not have subscripts", "true[];", /Line 1, col 5:/], // add to other
	["true is not assignable", "true = 1;", /Line 1, col 5/], // add to other
];

describe("The parser", () => {
	for (const [scenario, source] of syntaxChecks) {
		it(`matches ${scenario}`, () => {
			assert(parse(source).succeeded());
		});
	}
	for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
		it(`throws on ${scenario}`, () => {
			assert.throws(() => parse(source), errorMessagePattern);
		});
	}
});
