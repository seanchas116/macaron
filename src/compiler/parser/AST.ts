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
    public type: AST
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
    public right: AST
  ) {
    super(range);
  }
}

export
class NewVariableAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public declaration: String,
    public type: AST,
    public left: AssignableAST,
    public right: AST
  ) {
    super(range);
  }
}

export
class TypeAliasAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public left: IdentifierAST,
    public right: AST
  ) {
    super(range);
  }
}

export
class BinaryAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public left: AST,
    public operator: OperatorAST,
    public right: AST
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
    public returnType: AST,
    public expressions: AST[],
    public addAsVariable = false
  ) {
    super(range);
  }
}

export
class FunctionCallAST extends ExpressionAST {
  function: AST;
  arguments: AST[];

  constructor(
    range: SourceRange,
    func: AST,
    args: AST[],
    public isNewCall = false
  ) {
    super(range);
    this.function = func;
    this.arguments = args;
  }
}

export
class GenericsCallAST extends ExpressionAST {
  arguments: AST[];

  constructor(
    range: SourceRange,
    public value: AST,
    args: AST[]
  ) {
    super(range);
    this.arguments = args;
  }
}

export
class IfAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public condition: AST,
    public ifTrue: AST[],
    public ifFalse: AST[]
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
    public object: AST,
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
    public type: AST
  ) {
    super(range);
  }
}

export
class UnaryAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public operator: OperatorAST,
    public expression: AST
  ) {
    super(range);
  }
}

export
class ClassAST extends ExpressionAST {
  constructor(
    range: SourceRange,
    public name: IdentifierAST,
    public superclass: AST,
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
    public superTypes: AST[],
    public members: FunctionAST[]
  ) {
    super(range);
  }
}
