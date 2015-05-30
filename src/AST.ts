export
class AST {
}

export
class ExpressionAST extends AST {
}

export
class AssignmentAST extends ExpressionAST {
  declaration: String;
  left: IdentifierAST;
  op: OperatorAST;
  right: ExpressionAST;

  constructor(declaration: String, left: IdentifierAST, op: OperatorAST, right: ExpressionAST) {
    super()
    this.declaration = declaration;
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export
class BinaryAST extends ExpressionAST {
  left: ExpressionAST;
  op: OperatorAST;
  right: ExpressionAST;

  constructor(left: ExpressionAST, op: OperatorAST, right: ExpressionAST) {
    super()
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export
class FunctionAST extends ExpressionAST {
  params: ParameterAST[];
  expressions: ExpressionAST[];

  constructor(parameters: ParameterAST[], expressions: ExpressionAST[]) {
    super();
    this.params = parameters;
    this.expressions = expressions;
  }
}

export
class FunctionCallAST {
  func: IdentifierAST[];
  args: ExpressionAST[];

  constructor(func: IdentifierAST[], args: ExpressionAST[]) {
    this.func = func;
    this.args = args;
  }
}

export
class IdentifierAST {
  name: String;

  constructor(name: String) {
    this.name = name;
  }
}

export
class NumberAST {
  value: Number;

  constructor(value: Number) {
    this.value = value;
  }
}

export
class OperatorAST {
  name: String;

  constructor(name: String) {
    this.name = name;
  }
}

export
class ParameterAST {
  name: IdentifierAST;
  type: ExpressionAST;

  constructor(name: IdentifierAST, type: ExpressionAST) {
    this.name = name;
    this.type = type;
  }
}

export
class UnaryAST {
  op: OperatorAST;
  expr: ExpressionAST;

  constructor(op: OperatorAST, expr: ExpressionAST) {
    this.op = op;
    this.expr = expr;
  }
}
