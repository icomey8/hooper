export function program(statements) {
	return {
		kind: "Program",
		statements,
	};
}

export function variable(name, type, mutable) {
	return {
		kind: "Variable",
		name,
		mutable,
		type,
	};
}

export function variableDeclaration(variable, initializer) {
	return {
		kind: "VariableDeclaration",
		variable,
		initializer,
	};
}

export function callExpression(callee, args, type) {
	return {
		kind: "CallExpression",
		callee,
		args,
		type,
	};
}

export function incrementStatement(variable) {
	return {
		kind: "IncrementStatement",
		variable,
	};
}

export function breakStatement() {
	return {
		kind: "BreakStatement",
	};
}

export function printStatement(argument) {
	return {
		kind: "PrintStatement",
		argument,
	};
}

export function assignmentStatement(source, target) {
	return {
		kind: "AssignmentStatement",
		source,
		target,
	};
}

export function whileStatement(test, body) {
	return {
		kind: "WhileStatement",
		test,
		body,
	};
}

export function block(statements) {
	return {
		kind: "Block",
		statements,
	};
}

export function binaryExpression(op, left, right, type) {
	return {
		kind: "BinaryExpression",
		op,
		left,
		right,
		type,
	};
}

export function unaryExpression(op, operand, type) {
	return {
		kind: "UnaryExpression",
		op,
		operand,
		type,
	};
}

export function arrayExpression(elements, type) {
	return {
		kind: "ArrayExpression",
		elements,
		type,
	};
}

export function subscriptExpression(array, index, type) {
	return {
		kind: "SubscriptExpression",
		array,
		index,
		type,
	};
}

export function ifStatement(test, consequent, alternate) {
	return {
		kind: "IfStatement",
		test,
		consequent,
		alternate,
	};
}

export function shortIfStatement(test, consequent) {
	return {
		kind: "ShortIfStatement",
		test,
		consequent,
	};
}

export function functionDeclaration(fun, body) {
	return {
		kind: "FunctionDeclaration",
		fun,
		body,
	};
}

export function func(name, parameters, returnType) {
	return {
		kind: "Function",
		name,
		parameters,
		returnType,
	};
}

export function arrayType(baseType) {
	return { kind: "ArrayType", baseType };
}

export function functionType(paramTypes, returnType) {
	return { kind: "FunctionType", paramTypes, returnType };
}

export function returnStatement(expression) {
	return { kind: "ReturnStatement", expression };
}

export function conditional(test, consequent, alternate, type) {
	return { kind: "Conditional", test, consequent, alternate, type };
}

export function nilLiteral() {
	return {
		kind: "NilLiteral",
		type: "any?",
	};
}
