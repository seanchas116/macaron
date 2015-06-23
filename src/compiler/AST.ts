import SourceLocation from "./SourceLocation";
import Environment from "./Environment";

export
class AST {
  constructor(public location: SourceLocation) {
  }
}

export
class ExpressionAST extends AST {
}

export
class AssignmentAST extends ExpressionAST {
  constructor(location: SourceLocation, public declaration: String, public left: IdentifierAST, public operator: OperatorAST, public right: ExpressionAST) {
    super(location);
  }
}

export
class BinaryAST extends ExpressionAST {
  constructor(location: SourceLocation, public left: ExpressionAST, public operator: OperatorAST, public right: ExpressionAST) {
    super(location);
  }
}

export
class FunctionAST extends ExpressionAST {
  constructor(location: SourceLocation, public parameters: ParameterAST[], public expressions: ExpressionAST[]) {
    super(location);
  }
}

export
class FunctionCallAST extends ExpressionAST {
  function: ExpressionAST;
  arguments: ExpressionAST[];

  constructor(location: SourceLocation, func: ExpressionAST, args: ExpressionAST[]) {
    super(location);
    this.function = func;
    this.arguments = args;
  }
}

export
class IdentifierAST extends ExpressionAST {
  constructor(location: SourceLocation, public name: string) {
    super(location);
  }
}

export
class NumberAST extends ExpressionAST {
  constructor(location: SourceLocation, public value: number) {
    super(location);
  }
}

export
class StringAST extends ExpressionAST {
  constructor(location: SourceLocation, public value: string) {
    super(location);
  }
}

export
class OperatorAST extends AST {
  constructor(location: SourceLocation, public name: string) {
    super(location);
  }
}

export
class ParameterAST extends AST {
  constructor(location: SourceLocation, public name: IdentifierAST, public type: ExpressionAST) {
    super(location);
  }
}

export
class UnaryAST extends ExpressionAST {
  constructor(location: SourceLocation, public operator: OperatorAST, public expression: ExpressionAST) {
    super(location);
  }
}

export
class ClassAST extends ExpressionAST {
  constructor(location: SourceLocation, public name: IdentifierAST, public members: ClassMemberAST[]) {
    super(location);
  }
}

export
class ClassMemberAST extends AST {
}

export
class ClassMethodAST extends ClassMemberAST {
  constructor(location: SourceLocation, public parameters: ParameterAST[], public expressions: ExpressionAST[]) {
    super(location);
  }
}
