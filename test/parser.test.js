import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
	["simplest syntactically correct program", "break;"],
	["arithmetic", "log 2 * x + 3 / 5 - -1 % 7 ** 3 ** 3;"],
	["variable declarations", "let e=99*1;\nlet z=false;"],
	["assignments", "abc=9*3; a=1; a--; c++;"],
	["this is an valid comment", "// i am a hooper comment!"],
];

const syntaxErrors = [
	["malformed number", "let x= 2.;", /Line 1, col 10:/],
	["a float with an E but no exponent", "let x = 5E * 11;", /Line 1, col 10:/],
	["a missing right operand", "log(5 -);", /Line 1, col 10:/],
	["assignments", "abc=9*3; a=1; a--; c++;"], // change this to be invalid
	["this is an invalid comment", "# i am a python comment!;", /Line 1, col 1:/],
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
