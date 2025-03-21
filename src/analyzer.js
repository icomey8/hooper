import * as core from "./core.js";

class Context {
    constructor({ parent = null, locals = new Map(), inLoop = false, func = null }) {
        Object.assign(this, { parent, locals, inLoop, func });
    }

    add(name, entity) {
        this.locals.set(name, entity);
    }

    lookup(name) {
        return this.locals.get(name) || this.parent?.lookup(name);
    }

    static root() {
        return new Context({
            locals: new Map(Object.entries(core.standardLibrary)),
        });
    }

    newChildContext(props) {
        return new Context({ ...this, ...props, parent: this, locals: new Map() });
    }
}

export default function analyze(match) {
    const grammar = match.matcher.grammar;
    const globals = Context.root();


    function check(condition, message, node) {
        if (!condition) {
            throw new Error(`${node.source.getLineAndColumnMessage()} ${message}`);
        }
    }

    function checkDeclared(context, name, node) {
        check(context.lookup(name), `Undeclared variable: ${name}`, node);
    }

    function checkType(expected, actual, node) {
        check(expected === actual, `Type mismatch: expected ${expected}, found ${actual}`, node);
    }

    function checkFunctionCall(context, name, args, node) {
        const func = context.lookup(name);
        check(func, `Undefined function: ${name}`, node);
        check(func.params.length === args.length, `Function ${name} expects ${func.params.length} arguments, got ${args.length}`, node);
        func.params.forEach((param, i) => checkType(param.type, args[i].type, node));
    }

    function checkReturnType(context, returnType, node) {
        check(context.func !== null, "Return statement outside function", node);
        checkType(context.func.returnType, returnType, node);
    }

    // === Ohm Semantics Object ===
    const analyzer = grammar.createSemantics().addOperation("analyze", {
        Program(statements) {
            return statements.children.map(stmt => stmt.analyze(globals));
        },

        VarDec(_pick, id, _eq, exp, _semi) {
            const initializer = exp.analyze(this.args.context);
            this.args.context.add(id.sourceString, { type: initializer.type, isConstant: false });
            return core.variableDeclaration(id.sourceString, initializer);
        },

        ConstDec(_const, id, _eq, exp, _semi) {
            const initializer = exp.analyze(this.args.context);
            this.args.context.add(id.sourceString, { type: initializer.type, isConstant: true });
            return core.variableDeclaration(id.sourceString, initializer);
        },

        AssignmentStmt(id, _eq, exp, _semi) {
            checkDeclared(this.args.context, id.sourceString, id);
            const source = exp.analyze(this.args.context);
            const target = this.args.context.lookup(id.sourceString);
            check(!target.isConstant, `Cannot assign to immutable variable: ${id.sourceString}`, id);
            checkType(target.type, source.type, id);
            return core.assignmentStatement(target, source);
        },

        FunctionDec(_play, id, _open, params, _close, block) {
            const paramList = params.asIteration().children.map(p => ({ name: p.sourceString, type: "unknown" }));
            this.args.context.add(id.sourceString, { params: paramList, returnType: "unknown" });

            const functionContext = this.args.context.newChildContext({ func: { name: id.sourceString, returnType: "unknown", params: paramList } });
            block.analyze(functionContext);
            
            return core.functionDeclaration(id.sourceString, paramList, block);
        },

        FunctionCall(id, _open, args, _close) {
            const evaluatedArgs = args.asIteration().children.map(arg => arg.analyze(this.args.context));
            checkFunctionCall(this.args.context, id.sourceString, evaluatedArgs, id);
            return core.functionCall(id.sourceString, evaluatedArgs);
        },

        ReturnStmt(_dunk, exp, _semi) {
            const returnValue = exp.analyze(this.args.context);
            checkReturnType(this.args.context, returnValue.type, exp);
            return core.returnStatement(returnValue);
        },

        WhileStmt(_dribble, exp, block) {
            const condition = exp.analyze(this.args.context);
            checkType("boolean", condition.type, exp);
            const loopContext = this.args.context.newChildContext({ inLoop: true });
            return core.whileStatement(condition, block.analyze(loopContext));
        },

        BreakStmt(_turnover, _semi) {
            check(this.args.context.inLoop, "Break statement outside loop", this);
            return core.breakStatement();
        },

        IfStmt(_shoot, exp, block, _reb, elseBlock, _putback) {
            const condition = exp.analyze(this.args.context);
            checkType("boolean", condition.type, exp);
            return core.ifStatement(condition, block.analyze(this.args.context), elseBlock?.analyze(this.args.context));
        },

        Exp_test(left, op, right) {
            const x = left.analyze(this.args.context);
            const y = right.analyze(this.args.context);
            
            if (op.sourceString === "==" || op.sourceString === "!=") {
                checkType(x.type, y.type, op);
            } else {
                checkType("number", x.type, left);
                checkType("number", y.type, right);
            }
            
            return core.binaryExpression(op.sourceString, x, y, "boolean");
        }
    });

    return analyzer(match).analyze();
}

Number.prototype.type = "number";
Boolean.prototype.type = "boolean";
String.prototype.type = "string";
