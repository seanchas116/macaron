import {
  Expression,
  BinaryExpression,
  NumberExpression
} from "./Expression";

export default
class CodeEmitter {

  emitCode(expr: Expression): string {
    if (expr instanceof BinaryExpression) {
      return this.emitBinary(expr);
    }
    else if (expr instanceof NumberExpression) {
      return this.emitNumber(expr);
    }
    else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }

  emitBinary(expr: BinaryExpression) {
    const left = this.emitCode(expr.left);
    const right = this.emitCode(expr.right);

    return `(${left} ${expr.operator} ${right})`;
  }

  emitNumber(expr: NumberExpression) {
    return expr.value.toString();
  }
}
