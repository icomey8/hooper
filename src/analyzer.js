import * as core from "./core.js";

// The semantic analyzer exports a single function, analyze(match), that
// accepts a grammar match object (the CST) from Ohm and produces the
// internal representation of the program (pretty close to what is usually
// called the AST). This representation also includes entities from the
// standard library, as needed.

class Context {
	// Like most statically-scoped languages, hooper's contexts will contain a
	// map for their locally declared identifiers and a reference to the parent
	// context. The parent of the global context is null. In addition, the
	// context records whether analysis is current within a loop (so we can
	// properly check break statements), and reference to the current function
	// (so we can properly check return statements).

	constructor(parent = null, inLoop = false) {
		this.locals = new Map();
		this.inLoop = inLoop;
		this.parent = parent;
	}
	add(name, entity) {
		this.locals.set(name, entity);
	}
	has(name) {
		return this.locals.has(name);
	}
	lookup(name) {
		return this.locals.get(name) ?? (this.parent && this.parent.lookup(name));
	}
	newChildContext(inLoop = false) {
		return new Context(this, inLoop);
	}
}

export default function analyze(match) {
	// Track the context manually via a simple variable. The initial context
	// contains the mappings from the standard library. Add to this context
	// as necessary. When needing to descent into a new scope, create a new
	// context with the current context as its parent. When leaving a scope,
	// reset this variable to the parent context.

	const grammar = match.matcher.grammar;
	let context = new Context();
	const target = [];

	function check(condition, message, parseTreeNode) {
		if (!condition) {
			throw new Error(
				`${parseTreeNode.source.getLineAndColumnMessage()} ${message}`
			);
		}
	}

	function checkNumber(e, parseTreeNode) {
		check(e.type === "number", `Expected number`, parseTreeNode);
	}

	function checkBoolean(e, parseTreeNode) {
		check(e.type === "boolean", `Expected boolean`, parseTreeNode);
	}

	function checkSameTypes(x, y, parseTreeNode) {
		check(x.type === y.type, `Operands must have the same type`, parseTreeNode);
	}

	function checkAllElementsHaveSameType(elements, parseTreeNode) {
		if (elements.length > 0) {
			const type = elements[0].type;
			for (const e of elements) {
				check(
					e.type === type,
					`All elements must have the same type`,
					parseTreeNode
				);
			}
		}
	}

	function checkNumberOrString(e, parseTreeNode) {
		check(
			e.type === "number" || e.type === "string",
			`Expected number or string`,
			parseTreeNode
		);
	}

	function checkArrayOrString(e, parseTreeNode) {
		check(
			// TODO FIX DISGUSTING HACK BELOW
			e.type === "string" || e.type.endsWith("[]"),
			`Expected string or array`,
			parseTreeNode
		);
	}

	function checkArgumentCountAndTypes(parameters, args, parseTreeNode) {
		check(
			parameters.length === args.length,
			`Expected ${parameters.length} argument(s) but ${args.length} passed`,
			parseTreeNode
		);
		for (let i = 0; i < parameters.length; i++) {
			checkSameTypes(parameters[i], args[i], parseTreeNode);
		}
	}

	function checkNotDeclared(name, parseTreeNode) {
		check(
			!context.has(name),
			`Variable already declared: ${name}`,
			parseTreeNode
		);
	}

	function checkNotNil(e, parseTreeNode) {
		check(
			e.kind !== "NilLiteral",
			`Cannot use nil without a type`,
			parseTreeNode
		);
	}

	function checkAssignable(source, destType, parseTreeNode) {
		check(
			(source.kind === "NilLiteral" && destType.endsWith("?")) ||
				source.type === destType ||
				destType === `${source.type}?`,
			`Cannot assign ${source.type} to ${destType}`,
			parseTreeNode
		);
	}

	function isMutable(variable) {
		return (
			variable.mutable ||
			(variable.kind == "SubscriptExpression" && isMutable(variable.array))
		);
	}

	function checkIsMutable(variable, parseTreeNode) {
		check(
			isMutable(variable),
			`Assignment to immutable variable`,
			parseTreeNode
		);
	}

	const analyzer = grammar.createSemantics().addOperation("analyze", {
		Program(statements) {
			return core.program(statements.children.map((s) => s.analyze()));
		},
		VarDec_withtype(qualifier, id, _colon, type, _eq, exp, _semi) {
			checkNotDeclared(id.sourceString, id);
			const initializer = exp.analyze();
			const mutable = qualifier.sourceString === "pick";
			checkAssignable(initializer, type.sourceString, id);
			const variable = core.variable(
				id.sourceString,
				type.sourceString,
				mutable
			);
			context.add(id.sourceString, variable);
			return core.variableDeclaration(variable, initializer);
		},
		VarDec_inference(qualifier, id, _eq, exp, _semi) {
			checkNotDeclared(id.sourceString, id);
			const initializer = exp.analyze();
			checkNotNil(initializer, id);
			const mutable = qualifier.sourceString === "pick";
			const variable = core.variable(
				id.sourceString,
				initializer.type,
				mutable
			);
			context.add(id.sourceString, variable);
			return core.variableDeclaration(variable, initializer);
		},
		// TypeDec() {},
		IncrementStmt(_op, id, _semi) {
			const variable = id.analyze();
			checkNumber(variable, id);
			return core.incrementStatement(variable);
		},
		Stmt_break(breakKeyword, _semi) {
			check(context.inLoop, `Break can only appear in a loop`, breakKeyword);
			return core.breakStatement();
		},
		FunctionDec(_fun, id, params, _eq, exp, _semi) {
			checkNotDeclared(id.sourceString, id);
			context = context.newChildContext();
			const parameters = params.analyze();
			const body = exp.analyze();
			context = context.parent;
			const fun = core.función(id.sourceString, parameters, body.type);
			context.add(id.sourceString, fun);
			return core.functionDeclaration(fun, body);
		},
		Params(_open, params, _close) {
			return params
				.asIteration()
				.children()
				.map((p) => p.analyze());
		},
		Param(id, _colon, type) {
			checkNotDeclared(id.sourceString, id);
			const param = core.variable(id.sourceString, type.sourceString, false);
			context.add(id.sourceString, param);
			return param;
		},
		PrintStmt(_print, exp, _semi) {
			const argument = exp.analyze();
			return core.printStatement(argument);
		},
		AssignmentStmt(id, _eq, exp, _semi) {
			const source = exp.analyze();
			const target = id.analyze();
			checkSameTypes(source, target, id);
			checkIsMutable(target, id);
			return core.assignmentStatement(source, target);
		},
		IfStmt_long(_if, exp, block1, _else, block2) {
			const test = exp.analyze();
			checkBoolean(test, exp);
			const consequent = block1.analyze();
			const alternate = block2.analyze();
			return core.ifStatement(test, consequent, alternate);
		},
		IfStmt_elsif(_f, exp, block, _else, trailingIfStatement) {
			const test = exp.analyze();
			checkBoolean(test, exp);
			const consequent = block.analyze();
			const alternate = trailingIfStatement.analyze();
			return core.ifStatement(test, consequent, alternate);
		},
		IfStmt_short(_if, exp, block) {
			const test = exp.analyze();
			checkBoolean(test, exp);
			const body = block.analyze();
			return core.shortIfStatement(test, body);
		},
		WhileStmt(_while, exp, block) {
			const test = exp.analyze();
			checkBoolean(test, exp);
			context = context.newChildContext(context, true);
			const body = block.analyze();
			context = context.parent;
			return core.whileStatement(test, body);
		},
		Block(_open, statements, _close) {
			return statements.children.map((s) => s.analyze());
		},
		Exp1_or(exp, _ops, exps) {
			let left = exp.analyze();
			checkBoolean(left, exp);
			for (let e of exps.children) {
				let right = e.analyze();
				checkBoolean(right, exp);
				left = core.binaryExpression("or", left, right, "boolean");
			}
			return left;
		},
		Exp2_and(exp, _ops, exps) {
			let left = exp.analyze();
			checkBoolean(left, exp);
			for (let e of exps.children) {
				let right = e.analyze();
				checkBoolean(right, exp);
				left = core.binaryExpression("and", left, right, "boolean");
			}
			return left;
		},
		Exp3_test(left, op, right) {
			const x = left.analyze();
			const y = right.analyze();
			if (op.sourceString === "==" || op.sourceString === "!=") {
				check(x.type === y.type, `Type mismatch`, op);
			} else {
				checkNumberOrString(x, left);
				checkNumberOrString(y, right);
			}
			return core.binaryExpression(op.sourceString, x, y, "boolean");
		},
		Condition_add(left, _op, right) {
			const x = left.analyze();
			const y = right.analyze();
			checkNumberOrString(x, left);
			checkSameTypes(x, y, right);
			return core.binaryExpression("+", x, y, "number");
		},
		Condition_sub(left, _op, right) {
			const x = left.analyze();
			const y = right.analyze();
			checkNumber(x, left);
			checkNumber(y, right);
			return core.binaryExpression("-", x, y, "number");
		},
		Term_mult(left, _op, right) {
			const x = left.analyze();
			const y = right.analyze();
			checkNumberOrString(x, left);
			checkNumber(y, right);
			return core.binaryExpression("*", x, y, x.type);
		},
		Term_div(left, _op, right) {
			const x = left.analyze();
			const y = right.analyze();
			checkNumber(x, left);
			checkNumber(y, right);
			return core.binaryExpression("/", x, y, "number");
		},
		Term_mod(left, _op, right) {
			const x = left.analyze();
			const y = right.analyze();
			checkNumber(x, left);
			checkNumber(y, right);
			return core.binaryExpression("%", x, y, "number");
		},
		Primary_parens(_open, exp, _close) {
			return exp.analyze();
		},
		Factor_exp(left, _op, right) {
			const x = left.analyze();
			const y = right.analyze();
			checkNumber(x, left);
			checkNumber(y, right);
			return core.binaryExpression("**", x, y, "number");
		},
		Factor_neg(_op, operand) {
			checkNumber(operand.analyze(), operand);
			return core.unaryExpression("-", operand.analyze(), "number");
		},
		Primary_array(open, elements, _close) {
			const contents = elements.asIteration().children.map((e) => e.analyze());
			checkAllElementsHaveSameType(contents, open);
			const elementType = contents.length > 0 ? contents[0].type : "any";
			return core.arrayExpression(contents, `${elementType}[]`);
		},
		Primary_subscript(array, _open, index, _close) {
			const e = array.analyze();
			const i = index.analyze();
			checkNumber(i, index);
			checkArrayOrString(e, array);
			return core.subscriptExpression(e, index.analyze(), e.type.slice(0, -2));
		},
		Primary_call(id, _open, exps, _close) {
			const fun = context.lookup(id.sourceString);
			check(fun, `${id.sourceString} not declared`, id);
			check(fun.kind === "Function", `${id.sourceString} not a function`, id);
			const parameters = fun.parameters;
			const args = exps.asIteration().children.map((a) => a.analyze());
			checkArgumentCountAndTypes(parameters, args, id);
			return core.callExpression(fun, args, fun.returnType);
		},
		numeral(digits, _dot, _fractional, _e, _sign, _exponent) {
			return Number(this.sourceString);
		},
		id(_first, _rest) {
			const entity = context.lookup(this.sourceString);
			check(entity, `${this.sourceString} not declared`, this);
			return entity;
		},
		true(_) {
			return { value: true, type: "boolean" };
		},
		false(_) {
			return { value: false, type: "boolean" };
		},
		stringlit(_openQuote, chars, _closeQuote) {
			return { value: chars.sourceString, type: "string" };
		},
		nil(_nil) {
			return core.nilLiteral(); // Assuming core.nilLiteral() returns { kind: "NilLiteral", type: "any?" }
		},
	});

	return analyzer(match).analyze();
	// These are carefully named utility functions that keep the
	// analysis code clean and readable. Without these utilities, the analysis
	// code would be cluttered with if-statements and error messages. Each of
	// the utilities accept a parameter that should be an object with an "at"
	// property that is a parse tree node. This is used to provide contextual
	// information in the error message.
}

Number.prototype.type = "number";
Boolean.prototype.type = "boolean";
String.prototype.type = "string";
