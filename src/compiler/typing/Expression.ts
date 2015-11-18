import Type from "./Type";
import GenericsType from "./type/GenericsType";
import Identifier from "./Identifier";
import Operator from "./Operator";
import {Constness} from "./Member";
import Environment from "./Environment";
import AssignableExpression from "./AssignableExpression";
import TypeExpression, {GenericsParameterExpression} from "./TypeExpression";
import Thunk from "./Thunk";
import SourceRange from "../common/SourceRange";

export
interface Expression {
  range: SourceRange;
  valueType: Type;
}

export default Expression;

export
class IdentifierExpression implements Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public valueType: Type
  ) {
  }
}

export
class AssignmentExpression implements Expression {
  constructor(
    public range: SourceRange,
    public assignable: AssignableExpression,
    public value: Expression,
    public valueType: Type
  ) {
  }
}

export
class NewVariableExpression implements Expression {
  constructor(
    public range: SourceRange,
    public constness: Constness,
    public assignable: AssignableExpression,
    public value: Expression,
    public valueType: Type
  ) {
  }
}

export
class FunctionCallExpression implements Expression {
  function: Expression;
  arguments: Expression[];

  constructor(
    public range: SourceRange,
    func: Expression,
    args: Expression[],
    public isNewCall: boolean,
    public valueType: Type
  ) {
    this.function = func;
    this.arguments = args;
  }
}

export
class GenericsExpression implements Expression {
  constructor(
    public range: SourceRange,
    public parameters: GenericsParameterExpression[],
    public valueType: GenericsType,
    public expression: Expression
  ) {
  }
}

export
class GenericsCallExpression implements Expression {
  arguments: TypeExpression[];

  constructor(
    public range: SourceRange,
    public value: Expression,
    args: TypeExpression[],
    public valueType: Type
  ) {
    this.arguments = args;
  }
}

export
class LiteralExpression implements Expression {
  constructor(
    public range: SourceRange,
    public value: any,
    public valueType: Type
  ) {
  }
}

export
class ReturnExpression implements Expression {
  valueType = this.expression.valueType;
  constructor(
    public range: SourceRange,
    public expression: Expression
  ) {
  }
}

export
class MemberAccessExpression implements Expression {
  constructor(
    public range: SourceRange,
    public object: Expression,
    public member: Identifier,
    public valueType: Type
  ) {
  }
}

export
class OperatorAccessExpression implements Expression {
  constructor(
    public range: SourceRange,
    public object: Expression,
    public operator: Operator,
    public valueType: Type
  ) {
  }
}

export
class IfExpression implements Expression {
  constructor(
    public range: SourceRange,
    public environment: Environment,
    public condition: Expression,
    public ifTrue: Expression[],
    public ifFalse: Expression[],
    public tempVarName: string,
    public valueType: Type
  ) {
  }
}

export
class FunctionBodyExpression implements Expression {
  constructor(
    public range: SourceRange,
    public expressions: Expression[],
    public valueType: Type
  ) {}
}

export
class FunctionExpression implements Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public valueType: Type,
    public parameters: AssignableExpression[],
    public body: FunctionBodyExpression
  ) {}
}

export
class DeclarationExpression implements Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public valueType: Type
  ) {
  }
}

export
class LazyExpression implements Expression {
  constructor(
    public range: SourceRange,
    public valueThunk: Thunk<Expression>,
    public valueTypeThunk: Thunk<Type>
  ) {}

  get valueType() {
    return this.valueTypeThunk.get();
  }
  get value() {
    return this.valueThunk.get();
  }
}

export
class TypeOnlyExpression implements Expression {
  constructor(
    public range: SourceRange,
    public typeExpression: TypeExpression,
    public valueType: Type
  ) {}
}
