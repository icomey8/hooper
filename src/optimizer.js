import * as core from "./core.js";

export default function optimize(node) {
	return optimizers?.[node.kind]?.(node) ?? node;
}

const optimizers = {
	Program(p) {
		p.statements = p.statements.flatMap(optimize);
		return p;
	},
	VariableDeclaration(d) {
		d.variable = optimize(d.variable);
		d.initializer = optimize(d.initializer);
		return d;
	},
	TypeDeclaration(d) {
		d.type = optimize(d.type);
		return d;
	},
	FunctionDeclaration(d) {
		d.fun = optimize(d.fun);
		return d;
	},
	Function(f) {
		if (f.body) f.body = f.body.flatMap(optimize);
		return f;
	},
	Increment(s) {
		s.variable = optimize(s.variable);
		return s;
	},
	Decrement(s) {
		s.variable = optimize(s.variable);
		return s;
	},
	Assignment(s) {
		s.source = optimize(s.source);
		s.target = optimize(s.target);
		if (s.source === s.target) {
			return [];
		}
		return s;
	},
	BreakStatement(s) {
		return s;
	},
	ReturnStatement(s) {
		s.expression = optimize(s.expression);
		return s;
	},
	ShortReturnStatement(s) {
		return s;
	},
	IfStatement(s) {
		s.test = optimize(s.test);
		s.consequent = s.consequent.flatMap(optimize);
		if (s.alternate?.kind?.endsWith?.("IfStatement")) {
			s.alternate = optimize(s.alternate);
		} else {
			s.alternate = s.alternate.flatMap(optimize);
		}
		if (s.test.constructor === Boolean) {
			return s.test ? s.consequent : s.alternate;
		}
		return s;
	},
	ShortIfStatement(s) {
		s.test = optimize(s.test);
		s.consequent = s.consequent.flatMap(optimize);
		if (s.test.constructor === Boolean) {
			return s.test ? s.consequent : [];
		}
		return s;
	},
	WhileStatement(s) {
		s.test = optimize(s.test);
		if (s.test === false) {
			return [];
		}
		s.body = s.body.flatMap(optimize);
		return s;
	},
	RepeatStatement(s) {
		s.count = optimize(s.count);
		if (s.count === 0) {
			return [];
		}
		s.body = s.body.flatMap(optimize);
		return s;
	},
	ForRangeStatement(s) {
		s.iterator = optimize(s.iterator);
		s.low = optimize(s.low);
		s.op = optimize(s.op);
		s.high = optimize(s.high);
		s.body = s.body.flatMap(optimize);
		if (s.low.constructor === Number) {
			if (s.high.constructor === Number) {
				if (s.low > s.high) {
					return [];
				}
			}
		}
		return s;
	},
	ForStatement(s) {
		s.iterator = optimize(s.iterator);
		s.collection = optimize(s.collection);
		s.body = s.body.flatMap(optimize);
		if (s.collection?.kind === "EmptyArray") {
			return [];
		}
		return s;
	},
	Conditional(e) {
		e.test = optimize(e.test);
		e.consequent = optimize(e.consequent);
		e.alternate = optimize(e.alternate);
		if (e.test.constructor === Boolean) {
			return e.test ? e.consequent : e.alternate;
		}
		return e;
	},
	BinaryExpression(e) {
		e.op = optimize(e.op);
		e.left = optimize(e.left);
		e.right = optimize(e.right);
		if (e.op === "??") {
			if (e.left?.kind === "EmptyOptional") {
				return e.right;
			}
		} else if (e.op === "&&") {
			if (e.left === true) return e.right;
			if (e.right === true) return e.left;
		} else if (e.op === "||") {
			if (e.left === false) return e.right;
			if (e.right === false) return e.left;
		} else if ([Number, BigInt].includes(e.left.constructor)) {
			if ([Number, BigInt].includes(e.right.constructor)) {
				if (e.op === "+") return e.left + e.right;
				if (e.op === "-") return e.left - e.right;
				if (e.op === "*") return e.left * e.right;
				if (e.op === "/") return e.left / e.right;
				if (e.op === "**") return e.left ** e.right;
				if (e.op === "<") return e.left < e.right;
				if (e.op === "<=") return e.left <= e.right;
				if (e.op === "==") return e.left === e.right;
				if (e.op === "!=") return e.left !== e.right;
				if (e.op === ">=") return e.left >= e.right;
				if (e.op === ">") return e.left > e.right;
			}
			if (e.left === 0 && e.op === "+") return e.right;
			if (e.left === 1 && e.op === "*") return e.right;
			if (e.left === 0 && e.op === "-")
				return core.unaryExpression("-", e.right);
			if (e.left === 1 && e.op === "**") return 1;
			if (e.left === 0 && ["*", "/"].includes(e.op)) return 0;
		} else if ([Number, BigInt].includes(e.right.constructor)) {
			if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
			if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
			if (e.op === "*" && e.right === 0) return 0;
			if (e.op === "**" && e.right === 0) return 1;
		}
		return e;
	},
	UnaryExpression(e) {
		e.op = optimize(e.op);
		e.operand = optimize(e.operand);
		if (e.operand.constructor === Number) {
			if (e.op === "-") {
				return -e.operand;
			}
		}
		return e;
	},
	SubscriptExpression(e) {
		e.array = optimize(e.array);
		e.index = optimize(e.index);
		return e;
	},
	ArrayExpression(e) {
		e.elements = e.elements.map(optimize);
		return e;
	},
	MemberExpression(e) {
		e.object = optimize(e.object);
		return e;
	},
	FunctionCall(c) {
		c.callee = optimize(c.callee);
		c.args = c.args.map(optimize);
		return c;
	},
	ConstructorCall(c) {
		c.callee = optimize(c.callee);
		c.args = c.args.map(optimize);
		return c;
	},
	Print(s) {
		s.args = s.args.map(optimize);
		return s;
	},
};
