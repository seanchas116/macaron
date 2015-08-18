import SourceLocation from "../common/SourceLocation";

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
  constructor(location: SourceLocation, public name: IdentifierAST, public parameters: ParameterAST[], public returnType: TypeExpressionAST, public expressions: ExpressionAST[], public addAsVariable = false) {
    super(location);
  }
}

export
class FunctionCallAST extends ExpressionAST {
  function: ExpressionAST;
  arguments: ExpressionAST[];

  constructor(location: SourceLocation, func: ExpressionAST, args: ExpressionAST[], public isNewCall = false) {
    super(location);
    this.function = func;
    this.arguments = args;
  }
}

export
class IfAST extends ExpressionAST {
  constructor(location: SourceLocation, public condition: ExpressionAST, public ifTrue: ExpressionAST[], public ifFalse: ExpressionAST[]) {
    super(location);
  }
}

export
class IdentifierAST extends ExpressionAST {
  constructor(location: SourceLocation, public name: string) {
    super(location);
  }
}

export
class LiteralAST extends ExpressionAST {
  constructor(location: SourceLocation, public value: any) {
    super(location);
  }
}

export
class MemberAccessAST extends ExpressionAST {
  constructor(location: SourceLocation, public object: ExpressionAST, public member: IdentifierAST) {
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
  // FIXME: support type more than Identifier
  constructor(location: SourceLocation, public name: IdentifierAST, public type: TypeExpressionAST) {
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
  constructor(location: SourceLocation, public name: IdentifierAST, public members: FunctionAST[]) {
    super(location);
  }
}

export
class TypeExpressionAST extends ExpressionAST {
}

export
class TypeIdentifierAST extends TypeExpressionAST {
  constructor(location: SourceLocation, public name: string) {
    super(location);
  }
}
