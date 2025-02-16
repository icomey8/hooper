export default function interpret(match) {
	const grammar = match.matcher.grammar;
	const interpeter = grammar.createSemantics().addOperation("eval", {
		Program(statements) {
			for (const statement of statements.children) {
				statement.eval();
			}
		},
		Stmt_increment(_op, id, _semi) {
			memoryUsage.set(id.sourceString, value + 1);
		},
		VarDec(_let, id, _eq, exp, _semi) {
			memoryUsage.set(id.sourceString, exp.eval());
		},
		PrintStmt() {},
		AssignStmt(id, _eq, exp, _semi) {
			const value = exp.evalIO;
			const variable = id.eval();
			memoryUsage.set(id.eval().sourceString, value);
		},
		numeral(digits, _dot, _fractional, _e, _sign, _exponent) {},
		id(_first, _rest) {
			const name = this.sourceString;
			if (!memoryUsage.has(name)) {
				throw new Error(`Variable ${name} is not defined`);
			}
		},
	});
}

// make this into a translator
