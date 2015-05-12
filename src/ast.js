
export
class BinaryExpression {
  constructor(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export
class UnaryExpression {
  constructor(op, expr) {
    this.op = op;
    this.expr = expr;
  }
}

export
class NumberLiteral {
  constructor(value) {
    this.value = value;
  }
}
