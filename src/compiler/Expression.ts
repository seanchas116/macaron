import DeclarationType from "./DeclarationType";
import {numberType} from "./nativeTypes";
import {Type, FunctionType} from "./Type";
import SourceLocation from "./SourceLocation";

export
class Expression {
  constructor(public type: Type) {
  }
}

export
class IdentifierExpression extends Expression {
  constructor(public name: string, public location: SourceLocation, type: Type) {
    super(type);
  }
}

export
class AssignmentExpression extends Expression {
  constructor(public declarationType: DeclarationType, public ideitifier: IdentifierExpression, public value: Expression) {
    super(ideitifier.type)
  }
}

export
class FunctionCallExpression extends Expression {
  function: Expression;
  arguments: Expression[];

  constructor(func: Expression, args: Expression[]) {
    super((<FunctionType>func.type).returnType);
    this.function = func;
    this.arguments = args;
  }
}

export
class FunctionExpression extends Expression {
  constructor(public parameters: IdentifierExpression[], public expressions: Expression[], type: Type) {
    super(type);
  }
}

export
class NumberExpression extends Expression {
  constructor(public value: number, public location: SourceLocation) {
    super(numberType);
  }
}

export
class BinaryExpression extends Expression {
  constructor(public operator: string, public location: SourceLocation, public left: Expression, public right: Expression) {
    super(left.type);
  }
}
