import SourceLocation from "../common/SourceLocation";

export
abstract class AST {
  location: SourceLocation;
}

export
abstract class ExpressionAST extends AST {
}

export
class AssignmentAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public left: IdentifierAST,
    public operator: OperatorAST,
    public right: ExpressionAST
  ) {
    super();
  }
}

export
class NewVariableAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public declaration: String,
    public type: ExpressionAST,
    public left: IdentifierAST,
    public right: ExpressionAST
  ) {
    super();
  }
}

export
class TypeAliasAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public left: IdentifierAST,
    public right: ExpressionAST
  ) {
    super();
  }
}

export
class BinaryAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public left: ExpressionAST,
    public operator: OperatorAST,
    public right: ExpressionAST
  ) {
    super();
  }
}

export
class FunctionAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public name: IdentifierAST,
    public genericsParameters: ParameterAST[],
    public parameters: ParameterAST[],
    public returnType: ExpressionAST,
    public expressions: ExpressionAST[],
    public addAsVariable = false
  ) {
    super();
  }
}

export
class FunctionCallAST extends ExpressionAST {
  function: ExpressionAST;
  arguments: ExpressionAST[];

  constructor(
    public location: SourceLocation,
    func: ExpressionAST,
    args: ExpressionAST[],
    public isNewCall = false
  ) {
    super();
    this.function = func;
    this.arguments = args;
  }
}

export
class GenericsCallAST extends ExpressionAST {
  arguments: ExpressionAST[];

  constructor(
    public location: SourceLocation,
    public value: ExpressionAST,
    args: ExpressionAST[]
  ) {
    super();
    this.arguments = args;
  }
}

export
class IfAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public condition: ExpressionAST,
    public ifTrue: ExpressionAST[],
    public ifFalse: ExpressionAST[]
  ) {
    super();
  }
}

export
class IdentifierAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public name: string
  ) {
    super();
  }
  toString() {
    return this.name;
  }
}

export
class LiteralAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public value: any
  ) {
    super();
  }
}

export
class MemberAccessAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public object: ExpressionAST,
    public member: IdentifierAST
  ) {
    super();
  }
}

export
class OperatorAST extends AST {
  constructor(
    public location: SourceLocation,
    public name: string
  ) {
    super();
  }
}

export
class ParameterAST extends AST {
  // FIXME: support type more than Identifier
  constructor(
    public location: SourceLocation,
    public name: IdentifierAST,
    public type: ExpressionAST
  ) {
    super();
  }
}

export
class UnaryAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public operator: OperatorAST,
    public expression: ExpressionAST
  ) {
    super();
  }
}

export
class ClassAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public name: IdentifierAST,
    public superclass: ExpressionAST,
    public members: FunctionAST[]
  ) {
    super();
  }
}

export
class InterfaceAST extends ExpressionAST {
  constructor(
    public location: SourceLocation,
    public name: IdentifierAST,
    public superTypes: ExpressionAST[],
    public members: FunctionAST[]
  ) {
    super();
  }
}
