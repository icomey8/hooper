import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";

// Programs that are semantically correct
const semanticChecks = [
	["vardecl with types", 'pick y: string = "false";'],
	["vardecl with inference", 'pick x = 1; pick y = "false";'],
	["boolean literals", "pick b: boolean = true; pick c = false;"],
	["arithmetic expressions", "pick x = 5 + 3 * 2;"],
	["array declaration", "pick arr = [1, 2, 3];"],
	["conditional", "if true { log 42; }"],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
	// ["non-int increment", "let x=false;x++;", /an integer/],
	// ["undeclared id", "print(x);", /Identifier x not declared/],
	// ["assign to const", "const x = 1;x = 2;", /Cannot assign to immutable/],
];

describe("The analyzer", () => {
	for (const [scenario, source] of semanticChecks) {
		it(`recognizes ${scenario}`, () => {
			assert.ok(analyze(parse(source)));
		});
	}
	for (const [scenario, source, errorMessagePattern] of semanticErrors) {
		it(`throws on ${scenario}`, () => {
			assert.throws(() => analyze(parse(source)), errorMessagePattern);
		});
	}
});
