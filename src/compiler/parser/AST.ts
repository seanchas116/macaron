import SourceRange from "../common/SourceRange";

interface AST {
  range: SourceRange;
}
export default AST;

export
class AssignmentAST implements AST {
  constructor(
    public range: SourceRange,
    public left: IdentifierAST,
    public operator: OperatorAST,
    public right: AST
  ) {}
}

export
class NewVariableAST implements AST {
  constructor(
    public range: SourceRange,
    public declaration: String,
    public type: AST,
    public left: IdentifierAST,
    public right: AST
  ) {}
}

export
class TypeAliasAST implements AST {
  constructor(
    public range: SourceRange,
    public left: IdentifierAST,
    public right: AST
  ) {}
}

export
class BinaryAST implements AST {
  constructor(
    public range: SourceRange,
    public left: AST,
    public operator: OperatorAST,
    public right: AST
  ) {}
}

export
class FunctionAST implements AST {
  constructor(
    public range: SourceRange,
    public name: IdentifierAST,
    public genericsParameters: ParameterAST[],
    public parameters: ParameterAST[],
    public returnType: AST,
    public expressions: AST[],
    public addAsVariable = false
  ) {}
}

export
class FunctionCallAST implements AST {
  function: AST;
  arguments: AST[];

  constructor(
    public range: SourceRange,
    func: AST,
    args: AST[],
    public isNewCall = false
  ) {
    this.function = func;
    this.arguments = args;
  }
}

export
class GenericsCallAST implements AST {
  arguments: AST[];

  constructor(
    public range: SourceRange,
    public value: AST,
    args: AST[]
  ) {
    this.arguments = args;
  }
}

export
class IfAST implements AST {
  constructor(
    public range: SourceRange,
    public condition: AST,
    public ifTrue: AST[],
    public ifFalse: AST[]
  ) {}
}

export
class IdentifierAST implements AST {
  constructor(
    public range: SourceRange,
    public name: string
  ) {}
  toString() {
    return this.name;
  }
}

export
class LiteralAST implements AST {
  constructor(
    public range: SourceRange,
    public value: any
  ) {}
}

export
class MemberAccessAST implements AST {
  constructor(
    public range: SourceRange,
    public object: AST,
    public member: IdentifierAST
  ) {}
}

export
class OperatorAST implements AST {
  constructor(
    public range: SourceRange,
    public name: string
  ) {}
}

export
class ParameterAST implements AST {
  // FIXME: support type more than Identifier
  constructor(
    public range: SourceRange,
    public name: IdentifierAST,
    public type: AST
  ) {}
}

export
class UnaryAST implements AST {
  constructor(
    public range: SourceRange,
    public operator: OperatorAST,
    public expression: AST
  ) {}
}

export
class ClassAST implements AST {
  constructor(
    public range: SourceRange,
    public name: IdentifierAST,
    public superclass: AST,
    public members: FunctionAST[]
  ) {}
}

export
class InterfaceAST implements AST {
  constructor(
    public range: SourceRange,
    public name: IdentifierAST,
    public superTypes: AST[],
    public members: FunctionAST[]
  ) {}
}
