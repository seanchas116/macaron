import {
  Expression,
  OperatorExpression,
  NumberExpression
} from "./Expression";

export default
class CodeEmitter {

  emitCode(expr: Expression): string {
    if (expr instanceof OperatorExpression) {
      const left = this.emitCode(expr.left);
      const right = this.emitCode(expr.right);

      return `(${left} ${expr.operator} ${right})`;
    }
    else if (expr instanceof NumberExpression) {
      return expr.value.toString();
    }
    else {
      throw new Error(`Not supported expression: ${expr.constructor.name}`);
    }
  }
}
