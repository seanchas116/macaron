import Expression, {
  IdentifierExpression,
  LiteralExpression,
  FunctionCallExpression,
  AssignmentExpression,
  ReturnExpression,
  MemberAccessExpression,
  OperatorAccessExpression
} from "../typing/Expression";

import {NativeOperator, MethodOperator} from "../typing/Operator";

import FunctionExpression from "../typing/expression/FunctionExpression";
import ClassExpression from "../typing/expression/ClassExpression";

import DeclarationType from "../typing/DeclarationType";

function appendReturnType(expressions: Expression[]) {
  const len = expressions.length;
  if (len === 0) {
    return [];
  }
  const init = expressions.slice(0, len - 1);
  const last = expressions[len - 1];

  return init.concat([new ReturnExpression(last.location, last)]);
}

export default
class CodeEmitter {

  constructor(public indentationWidth = 2, public indentationLevel = 0) {
  }

  emitExpressions(expressions: Expression[], implicitReturn = false) {
    const indentation = " ".repeat(this.indentationWidth * this.indentationLevel);
    if (implicitReturn) {
      expressions = appendReturnType(expressions);
    }
    return expressions
      .map(e => this.emitExpression(e))
      .map(line => `${indentation}${line};\n`)
      .join("");
  }

  emitExpression(expr: Expression): string {
    if (expr instanceof IdentifierExpression) {
      return this.emitIdentifier(expr);
    }
    else if (expr instanceof LiteralExpression) {
      return this.emitLiteral(expr);
    }
    else if (expr instanceof FunctionExpression) {
      return this.emitFunction(expr);
    }
    else if (expr instanceof FunctionCallExpression) {
      return this.emitFunctionCall(expr);
    }
    else if (expr instanceof AssignmentExpression) {
      return this.emitAssignment(expr);
    }
    else if (expr instanceof ReturnExpression) {
      return this.emitReturn(expr);
    }
    else if (expr instanceof ClassExpression) {
      return this.emitClass(expr);
    }
    else if (expr instanceof MemberAccessExpression) {
      return this.emitMemberAccess(expr);
    }
    else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }

  emitIdentifier(expr: IdentifierExpression) {
    return expr.name.name;
  }

  emitLiteral(expr: LiteralExpression) {
    if (typeof expr.value === "number") {
      return String(expr.value);
    } else {
      return JSON.stringify(expr.value);
    }
  }

  emitFunction(expr: FunctionExpression) {
    const params = expr.parameters
      .map(p => p[0].name)
      .join(", ");

    const bodyEmitter = new CodeEmitter(this.indentationWidth, this.indentationLevel + 1);
    const body = bodyEmitter.emitExpressions(expr.body, true);

    return `(${params}) => {\n${body}\n}`;
  }

  emitClassMethod(expr: FunctionExpression) {
    const params = expr.parameters
      .map(p => p[0].name)
      .join(", ");

    const bodyEmitter = this.indented();
    const body = bodyEmitter.emitExpressions(expr.body, true);

    return `${expr.name.name}(${params}) {\n${body}\n}`;
  }

  emitClass(expr: ClassExpression) {
    const emitter = this.indented();
    const body = expr.members
      .map(member => emitter.emitClassMethod(member))
      .join("\n");

    return `class ${expr.name.name} {\n${body}\n}`;
  }

  emitFunctionCall(expr: FunctionCallExpression) {
    const args = expr.arguments.map(expr => this.emitExpression(expr)).join(", ");
    const func = this.emitExpression(expr.function);

    if (expr.isNewCall) {
      return `new ${func}(${args})`;
    } else {
      return `${func}(${args})`;
    }
  }

  emitAssignment(expr: AssignmentExpression) {
    // TODO: AssignmentExpression must be top-level

    const value = this.emitExpression(expr.value);
    const name = expr.assignable.name;

    switch (expr.declarationType) {
    case DeclarationType.Variable:
      return `let ${name} = ${value}`;
    case DeclarationType.Constant:
      return `const ${name} = ${value}`;
    default:
      return `${name} = ${value}`;
    }
  }

  emitReturn(expr: ReturnExpression) {
    return `return ${this.emitExpression(expr.expression)}`;
  }

  emitMemberAccess(expr: MemberAccessExpression) {
    const obj = this.emitExpression(expr.object);
    return `${obj}.${expr.member.name}`;
  }

  indented() {
    return new CodeEmitter(this.indentationWidth, this.indentationLevel + 1);
  }
}
