// Cassowary compiler

export default function translate(match) {
	const grammar = match.matcher.grammar;

	const locals = new Map(); // string -> entity
	const target = [];

	function emit(line) {
		target.push(line);
	}

	function check(condition, message, parseTreeNode) {
		if (!condition) {
			throw new Error(
				`${parseTreeNode.source.getLineAndColumnMessage()} ${message}`
			);
		}
	}

	const translator = grammar.createSemantics().addOperation("translate", {});
}
