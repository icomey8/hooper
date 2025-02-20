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

export function incrementStatement(variable) {
	return {
		kind: "Increment",
		variable,
	};
}

export function breakStatement() {
	return {
		kind: "break",
	};
}

export function variableDeclaration(variable, initializer) {
	return {
		kind: "VariableDeclaration",
		variable,
		initializer,
	};
}

export function printStatement(argument) {
	return {
		kind: "Print",
		argument,
	};
}

export function assignmentStatement(source, target) {
	return {
		kind: "Assignment",
		source,
		target,
	};
}

export function whileStatement(test, body) {
	return {
		kind: "While",
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

export function expressionStatement() {}

export function arrayExpression(elements, type) {
	return {
		kind: "ArrayExpression",
		elements,
		type,
	};
}

export function subscriptExpression(array, index) {
	return {
		kind: "SubscriptExpression",
		array,
		index,
	};
}
