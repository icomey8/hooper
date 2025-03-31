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
	["increment", "pick x = 10; x++;"],
	["assign arrays", "pick a: number[] = [2, 3]; pick b=[1]; a=b ;b=a;"],
	["assign to array element", "pick a = [1,2,3]; a[1]=100;"],
	["or", "log(true or 1<2 or false);"],
	["and", "log(true and 1<2 and false);"],
	["ok to == arrays", "log([2]==[8]);"],
	["ok to != arrays", "log([3]!=[24]);"],
	["arithmetic", "pick x = 1; log(2 * 3 + 5 ** 5);"],
	["subscript exp", "pick a = [1, 2]; log(a[0]);"],
	["array parameters", "define play f(x: number[]) {}"],
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
