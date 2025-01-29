import * as fs from "fs";
import * as ohm from "ohm-js";

const grammar = ohm.grammar(fs.readFileSync("src/hooper.ohm", "utf-8"));
const sourceCode = process.argv[2];
const match = grammar.match(sourceCode);

if (match.succeeded()) {
	console.log("this program is syntactically correct");
} else {
	console.error("this program is syntactically incorrect");
	console.error(match.message);
}
