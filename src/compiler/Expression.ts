import DeclarationType from "./DeclarationType";
import {numberType, stringType} from "./nativeTypes";
import {Type, FunctionType, ClassType} from "./Type";
import SourceLocation from "./SourceLocation";

export
class Expression {
  constructor(public location: SourceLocation, public type: Type) {
  }
}

export
class IdentifierExpression extends Expression {
  constructor(public name: string, location: SourceLocation, type: Type) {
    super(location, type);
  }
}

export
class AssignmentExpression extends Expression {
  constructor(public declarationType: DeclarationType, public ideitifier: IdentifierExpression, public value: Expression, location: SourceLocation) {
    super(location, ideitifier.type)
  }
}

export
class FunctionCallExpression extends Expression {
  function: Expression;
  arguments: Expression[];

  constructor(func: Expression, args: Expression[], location: SourceLocation) {
    super(location, (<FunctionType>func.type).returnType);
    this.function = func;
    this.arguments = args;
  }
}

export
class ConstructorCallExpression extends Expression {
  function: Expression;
  arguments: Expression[];

  constructor(func: Expression, args: Expression[], location: SourceLocation) {
    super(location, (<FunctionType>func.type).returnType);
    this.function = func;
    this.arguments = args;
  }
}

export
class FunctionExpression extends Expression {
  constructor(public parameters: IdentifierExpression[], public expressions: Expression[], location: SourceLocation, type: Type) {
    super(location, type);
  }
}

export
class NumberExpression extends Expression {
  constructor(public value: number, location: SourceLocation) {
    super(location, numberType);
  }
}

export
class StringExpression extends Expression {
  constructor(public value: string, location: SourceLocation) {
    super(location, stringType);
  }
}

export
class BinaryExpression extends Expression {
  constructor(public operator: string, public left: Expression, public right: Expression, location: SourceLocation) {
    super(location, left.type);
  }
}

export
class ReturnExpression extends Expression {
  constructor(public expression: Expression, location: SourceLocation) {
    super(location, expression.type);
  }
}

export
class ClassMemberExpression extends Expression {
  constructor(public name: IdentifierExpression, location: SourceLocation) {
    super(location, name.type);
  }
}

export
class ClassMethodExpression extends ClassMemberExpression {
  constructor(public parameters: IdentifierExpression[], public expressions: Expression[], name: IdentifierExpression, location: SourceLocation) {
    super(name, location);
  }
}

export
class ClassExpression extends Expression {
  constructor(public name: IdentifierExpression, public members: ClassMemberExpression[], location: SourceLocation, type: Type) {
    super(location, type);
  }
}
