// The code generator exports a single function, generate(program), which
// accepts a program representation and returns the JavaScript translation
// as a string.

// import { voidType, standardLibrary } from "./core.js";

export default function generate(program) {
	// When generating code for statements, we'll accumulate the lines of
	// the target code here. When we finish generating, we'll join the lines
	// with newlines and return the result.
	const output = [];

	// Variable and function names in JS will be suffixed with _1, _2, _3,
	// etc. This is because "switch", for example, is a legal name in Carlos,
	// but not in JS. So, the Carlos variable "switch" must become something
	// like "switch_1". We handle this by mapping each name to its suffix.
	const targetName = ((mapping) => {
		return (entity) => {
			if (!mapping.has(entity)) {
				mapping.set(entity, mapping.size + 1);
			}
			return `${entity.name}_${mapping.get(entity)}`;
		};
	})(new Map());

	const gen = (node) => generators?.[node?.kind]?.(node) ?? node;

	const generators = {
		// Key idea: when generating an expression, just return the JS string; when
		// generating a statement, write lines of translated JS to the output array.
		Program(p) {
			p.statements.forEach(gen);
		},
		VariableDeclaration(d) {
			// We don't care about const vs. let in the generated code! The analyzer has
			// already checked that we never updated a const, so let is always fine.
			output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
		},
		FunctionDeclaration(d) {
			output.push(
				`function ${gen(d.fun)}(${d.fun.params.map(gen).join(", ")}) {`
			);
			d.fun.body.forEach(gen);
			output.push("}");
		},
		Variable(v) {
			return targetName(v);
		},
		Function(f) {
			return targetName(f);
		},
		Increment(s) {
			output.push(`${gen(s.variable)}++;`);
		},
		BreakStatement(s) {
			output.push("break;");
		},
		ShortIfStatement(s) {
			output.push(`if (${gen(s.test)}) {`);
			s.consequent.forEach(gen);
			output.push("}");
		},
		WhileStatement(s) {
			output.push(`while (${gen(s.test)}) {`);
			s.body.forEach(gen);
			output.push("}");
		},
		BinaryExpression(e) {
			const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op;
			return `(${gen(e.left)} ${op} ${gen(e.right)})`;
		},
		SubscriptExpression(e) {
			return `${gen(e.array)}[${gen(e.index)}]`;
		},
		PrintStatement(s) {
			output.push(`console.log(${gen(s.argument)});`);
		},
		AssignmentStatement(s) {
			// Emit assignment for variable or subscript targets
			output.push(`${gen(s.target)} = ${gen(s.source)};`);
		},
		IncrementStatement(s) {
			output.push(`${gen(s.variable)}++;`);
		},
		BooleanLiteral(e) {
			return e.value.toString(); // Converts true/false to the string "true"/"false"
		},
		NumericLiteral(e) {
			return e.value.toString();
		},
		StringLiteral(e) {
			return JSON.stringify(e.value); // Adds quotes around strings
		},
		ArrayExpression(e) {
			return `[${e.elements.map(gen).join(", ")}]`;
		},
		FunctionCall(c) {
			const targetCode = `${gen(c.callee)}(${c.args.map(gen).join(", ")})`;
			// Calls in expressions vs in statements are handled differently
			if (c.callee.type.returnType !== voidType) {
				return targetCode;
			}
			output.push(`${targetCode};`);
		},
	};

	gen(program);
	return output.join("\n");
}

// need type declaration, return, long if statement,
