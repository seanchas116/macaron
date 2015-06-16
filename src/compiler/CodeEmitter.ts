import {
  Expression,
  IdentifierExpression,
  BinaryExpression,
  NumberExpression,
  FunctionExpression,
  FunctionCallExpression,
  AssignmentExpression,
  ReturnExpression
} from "./Expression";

import DeclarationType from "./DeclarationType";

function appendReturnType(expressions: Expression[]) {
  const len = expressions.length;
  if (len === 0) {
    return [];
  }
  const init = expressions.slice(0, len - 1);
  const last = expressions[len - 1];

  return init.concat([new ReturnExpression(last)]);
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
    else if (expr instanceof BinaryExpression) {
      return this.emitBinary(expr);
    }
    else if (expr instanceof NumberExpression) {
      return this.emitNumber(expr);
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
    else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }

  emitIdentifier(expr: IdentifierExpression) {
    return expr.name;
  }

  emitBinary(expr: BinaryExpression) {
    const left = this.emitExpression(expr.left);
    const right = this.emitExpression(expr.right);

    return `(${left} ${expr.operator} ${right})`;
  }

  emitNumber(expr: NumberExpression) {
    return expr.value.toString();
  }

  emitFunction(expr: FunctionExpression) {
    const params = expr.parameters
      .map(p => p.name)
      .join(", ");

    const bodyEmitter = new CodeEmitter(this.indentationWidth, this.indentationLevel + 1);
    const body = bodyEmitter.emitExpressions(expr.expressions, true);

    return `(${params}) => {\n${body}\n}`;
  }

  emitFunctionCall(expr: FunctionCallExpression) {
    const func = this.emitExpression(expr.function);
    const args = expr.arguments.map(expr => this.emitExpression(expr)).join(", ");
    return `${func}(${args})`;
  }

  emitAssignment(expr: AssignmentExpression) {
    // TODO: AssignmentExpression must be top-level

    const value = this.emitExpression(expr.value);
    const name = expr.ideitifier.name;

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
}
