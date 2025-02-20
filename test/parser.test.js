import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
	["simplest syntactically correct program", "break;"],
	["variable declarations", "let e=99*1;\nconst z=false;"],
	["assignments", "a--; c++; abc=9*3; a=1;"],
];

const syntaxErrors = [
	["malformed number", "let x= 2.;", /Line 1, col 10:/],
	["a float with an E but no exponent", "let x = 5E * 11;", /Line 1, col 10:/],
	["a missing right operand", "print(5 -);", /Line 1, col 10:/],
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
