import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
	["simplest syntactically correct program", "break;"],
	["arithmetic", "log 2 * x + 3 / 5 - -1 % 7 ** 3 ** 3;"],
	["variable declarations", "pick e = 99*1;\npick z = false;"],
	[
		"variable declarations with types",
		"pick e: number = 99*1;\npick z: boolean = false;",
	],
	["assignments", "abc=9*3; a=1; c++;"],
	["this is an valid comment", "# i am a hooper comment!"],
	["short if", "if x == 2 { log(2); }"],
	[
		"if with an elseif statement",
		"if x == 2 { log(2); } putback if x != 2 { log(3);} ",
	],
	["if with an else statement", "if x == 2 { log(2); } putback { log(3);} "],
	["assignment to array element", "c[2] = 100;"],
	["array element increment", "c[2]++;"],
	["function with no params, no return type", "define play f() {}"],
	[
		"function with typed params",
		"define play add_nums(x: number, y: boolean) {}",
	],
	[
		"function with return type",
		"define play add_nums(x: number, y: boolean) -> number {}",
	],
	["array type for param", "define play arrays(x: boolean[]) {}"],
	["array type returned", "define play f() -> string[] {}"],
	["call in exp", "log(5 * f(x, y, 2 * y));"],
	["while with empty block", "while true {}"],
	["while with one statement block", "while true { pick x = 1; }"],
	["ors can be chained", "log(2 or 8 or 90);"],
	["ands can be chained", "log(1 and 2 and 6);"],
];

const syntaxErrors = [
	["malformed number", "pick x= 2.;", /Line 1, col 11:/],
	["a float with an E but no exponent", "pick x = 5E * 11;", /Line 1, col 12:/],
	["a missing right operand", "log(5 -);", /Line 1, col 8:/],
	["assignments with missing value", "abc=9*3; a=; a--;", /Line 1, col 12:/],
	["this is an invalid comment", "// i am a js comment!;", /Line 1, col 1:/],
	["invalid short if", "if { log(2); }", /Line 1, col 4:/],
	["if as identifier", "if x = 3;", /Line 1, col 6:/],
	["booleans are not incrementable", "true--;", /Line 1, col 5:/],
	["booleans do not have subscripts", "true[];", /Line 1, col 5:/],
	["true is not assignable", "true = 1;", /Line 1, col 5/],
	["array subscript with no index", "c[] = 100;", /Line 1, col 3:/],
	[
		"incorrect array type for param",
		"define play arrays(x: [boolean]) {}",
		/Line 1, col 23:/,
	],
	[
		"incorrect array return structure",
		"define play f(): string[] {}",
		/Line 1, col 16:/,
	],
	["mixing ands and ors", "log('dog' and 'cat or 'mouse);", /Line 1, col 5:/],
	["unbalanced brackets", "define play x(): boolean[;", /Line 1, col 16/],
	["empty subscript", "log(a[]);", /Line 1, col 7/],
	["numbers cannot be subscripted", "log(143[x]);", /Line 1, col 8/],
	["numbers cannot be called", "log(20(a));", /Line 1, col 7/],
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
