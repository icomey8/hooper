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
	["call non-function", "pick f = 1; pick x = f(5);", /not a function/],
  	["duplicate variable in same scope", "pick x = 1; pick x = 2;", /already declared/],
  	["shadowing variable", "pick x = 1; if true { pick x = 2; }", /already declared/],
	["bad index type", 'pick a = [1, 2]; pick i = "0"; pick x = a[i];', /Expected number/],
  	["non-subscriptable", "pick a = 42; pick x = a[0];", /Expected string or array/],
  	["nil without type", "pick x = nil;", /Cannot use nil without a type/],
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
