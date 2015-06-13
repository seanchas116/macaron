import SourceLocation from "./SourceLocation";
import Environment from "./Environment";

export
class AST {
  // TODO
  location = new SourceLocation(1, 1, 0);
}

export
class ExpressionAST extends AST {
}

export
class AssignmentAST extends ExpressionAST {
  constructor(public declaration: String, public left: IdentifierAST, public operator: OperatorAST, public right: ExpressionAST) {
    super()
  }
}

export
class BinaryAST extends ExpressionAST {
  constructor(public left: ExpressionAST, public operator: OperatorAST, public right: ExpressionAST) {
    super()
  }
}

export
class FunctionAST extends ExpressionAST {
  constructor(public parameters: ParameterAST[], public expressions: ExpressionAST[]) {
    super();
  }
}

export
class FunctionCallAST extends ExpressionAST {
  function: ExpressionAST;
  arguments: ExpressionAST[];

  constructor(func: ExpressionAST, args: ExpressionAST[]) {
    super();
    this.function = func;
    this.arguments = args;
  }
}

export
class IdentifierAST extends ExpressionAST {
  constructor(public name: string) {
    super();
  }
}

export
class NumberAST extends ExpressionAST {
  constructor(public value: number) {
    super();
  }
}

export
class OperatorAST extends AST {
  constructor(public name: string) {
    super();
  }
}

export
class ParameterAST extends AST {
  constructor(public name: IdentifierAST, public type: ExpressionAST) {
    super();
  }
}

export
class UnaryAST extends ExpressionAST {
  constructor(public operator: OperatorAST, public expression: ExpressionAST) {
    super();
  }
}
