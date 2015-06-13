import {
  Expression,
  IdentifierExpression,
  BinaryExpression,
  NumberExpression,
  FunctionExpression,
  FunctionCallExpression
} from "./Expression";

export default
class CodeEmitter {

  constructor(public indentationWidth = 2, public indentationLevel = 0) {
  }

  emitExpressions(expressions: Expression[]) {
    const indentation = " ".repeat(this.indentationWidth * this.indentationLevel);
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

    const bodyEmitter = new CodeEmitter(this.indentationWidth, this.indentationLevel);
    const body = bodyEmitter.emitExpressions(expr.expressions);

    return `(${params}) {\n${body}\n}`;
  }

  emitFunctionCall(expr: FunctionCallExpression) {
    const func = this.emitExpression(expr.function);
    const args = expr.arguments.map(expr => this.emitExpression(expr)).join(", ");
    return `${func}(${args})`;
  }
}
