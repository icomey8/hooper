import { describe, it } from "node:test";
import assert from "node:assert/strict";
import optimize from "../src/optimizer.js";
import * as core from "../src/core.js";

const x = core.variable("x", true, core.intType);
const a = core.variable("a", true, core.arrayType(core.intType));
const neg = (x) => core.unaryExpression("-", x);
const xpp = core.incrementStatement(x);
const onePlusTwo = core.binaryExpression("+", 1, 2, core.intType);
const array = (...elements) => core.arrayExpression(elements);

const tests = [
	["optimizes +0", core.binaryExpression("+", x, 0), x],
	["optimizes -0", core.binaryExpression("-", x, 0), x],
	["optimizes *1", core.binaryExpression("*", x, 1), x],
	["optimizes /1", core.binaryExpression("/", x, 1), x],
	["optimizes *0", core.binaryExpression("*", x, 0), 0],
	["optimizes 0*", core.binaryExpression("*", 0, x), 0],
	["optimizes 0/", core.binaryExpression("/", 0, x), 0],
	["optimizes 0+", core.binaryExpression("+", 0, x), x],
	["optimizes 0-", core.binaryExpression("-", 0, x), neg(x)],
	["optimizes 1*", core.binaryExpression("*", 1, x), x],
	["optimizes 1**", core.binaryExpression("**", 1, x), 1],
	["optimizes **0", core.binaryExpression("**", x, 0), 1],
	["folds +", core.binaryExpression("+", 5, 8), 13],
	["folds -", core.binaryExpression("-", 5n, 8n), -3n],
	["folds *", core.binaryExpression("*", 5, 8), 40],
	["folds ==", core.binaryExpression("==", 5, 8), false],
	["folds <", core.binaryExpression("<", 5, 8), true],
	["folds <=", core.binaryExpression("<=", 5, 8), true],
	["folds ==", core.binaryExpression("==", 5, 8), false],
	["folds !=", core.binaryExpression("!=", 5, 8), true],
	["folds >=", core.binaryExpression(">=", 5, 8), false],
	["folds >", core.binaryExpression(">", 5, 8), false],
	["optimizes if-true", core.ifStatement(true, [xpp], []), [xpp]],
	["optimizes if-false", core.ifStatement(false, [], [xpp]), [xpp]],
	["optimizes short-if-true", core.shortIfStatement(true, [xpp]), [xpp]],
	["optimizes short-if-false", core.shortIfStatement(false, [xpp]), []],
	["optimizes left conditional true", core.conditional(true, 55, 89), 55],
	["optimizes left conditional false", core.conditional(false, 55, 89), 89],
	["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
];

describe("The optimizer", () => {
	for (const [scenario, before, after] of tests) {
		it(`${scenario}`, () => {
			assert.deepEqual(optimize(before), after);
		});
	}
});
