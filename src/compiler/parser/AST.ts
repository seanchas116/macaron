import SourceRange from "../common/SourceRange";

export default
class AST {
  constructor(
    public range: SourceRange
  ) {}
}

export
class ExpressionAST extends AST {
}

export
class AssignableAST extends AST {
}

export
class IdentifierAssignableAST extends AssignableAST {
  constructor(
    range: SourceRange,
    public name: IdentifierAST,
    public type: ExpressionAST
  ) {
    super(range);
  }
}

export
class AssignmentAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public left: AssignableAST,
    public operator: OperatorAST,
    public right: ExpressionAST
  ) {
    super(range);
  }
}

export
class NewVariableAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public declaration: String,
    public type: ExpressionAST,
    public left: AssignableAST,
    public right: ExpressionAST
  ) {
    super(range);
  }
}

export
class TypeAliasAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public left: IdentifierAST,
    public right: ExpressionAST
  ) {
    super(range);
  }
}

export
class BinaryAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public left: ExpressionAST,
    public operator: OperatorAST,
    public right: ExpressionAST
  ) {
    super(range);
  }
}

export
class FunctionAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public name: IdentifierAST,
    public genericsParameters: GenericsParameterAST[],
    public parameters: AssignableAST[],
    public returnType: ExpressionAST,
    public expressions: ExpressionAST[],
    public addAsVariable = false
  ) {
    super(range);
  }
}

export
class FunctionCallAST extends ExpressionAST {
  function: AST;
  arguments: ExpressionAST[];

  constructor(
    range: SourceRange,
    func: ExpressionAST,
    args: ExpressionAST[],
    public isNewCall = false
  ) {
    super(range);
    this.function = func;
    this.arguments = args;
  }
}

export
class GenericsCallAST extends ExpressionAST {
  arguments: ExpressionAST[];

  constructor(
    range: SourceRange,
    public value: ExpressionAST,
    args: ExpressionAST[]
  ) {
    super(range);
    this.arguments = args;
  }
}

export
class IfAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public condition: ExpressionAST,
    public ifTrue: ExpressionAST[],
    public ifFalse: ExpressionAST[]
  ) {
    super(range);
  }
}

export
class IdentifierAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public name: string
  ) {
    super(range);
  }

  toString() {
    return this.name;
  }
}

export
class LiteralAST extends ExpressionAST {
  constructor(
    public range: SourceRange,
    public value: any
  ) {
    super(range);
  }
}

export
class MemberAccessAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public object: ExpressionAST,
    public member: IdentifierAST
  ) {
    super(range);
  }
}

export
class OperatorAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public name: string
  ) {
    super(range);
  }
}

export
class GenericsParameterAST extends AST {
  constructor(
    range: SourceRange,
    public name: IdentifierAST,
    public type: ExpressionAST
  ) {
    super(range);
  }
}

export
class UnaryAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public operator: OperatorAST,
    public expression: ExpressionAST
  ) {
    super(range);
  }
}

export
class ClassAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public name: IdentifierAST,
    public superclass: ExpressionAST,
    public members: FunctionAST[]
  ) {
    super(range);
  }
}

export
class InterfaceAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public name: IdentifierAST,
    public superTypes: ExpressionAST[],
    public members: FunctionAST[]
  ) {
    super(range);
  }
}
