import {voidType, numberType, booleanType, stringType} from "./defaultEnvironment";
import Type from "./Type";
import MetaType from "./type/MetaType";
import UnionType from "./type/UnionType";
import GenericsType from "./type/GenericsType";
import GenericsParameterType from "./type/GenericsParameterType";
import Identifier from "./Identifier";
import Operator from "./Operator";
import {Constness} from "./Member";
import Environment from "./Environment";
import AssignableExpression from "./AssignableExpression";
import TypeExpression, {GenericsParameterExpression} from "./TypeExpression";
import Thunk from "./Thunk";

import SourceRange from "../common/SourceRange";
import CompilationError from "../common/CompilationError";

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
  valueType = this.value.valueType;
  constructor(
    public range: SourceRange,
    public assignable: AssignableExpression,
    public value: Expression
  ) {
  }
}

export
class NewVariableExpression implements Expression {
  valueType = this.value.valueType;
  constructor(
    public range: SourceRange,
    public constness: Constness,
    public assignable: AssignableExpression,
    public value: Expression
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
  valueType = (() => {
    switch (typeof this.value) {
      case "number":
        return numberType;
      case "string":
        return stringType;
      case "boolean":
        return booleanType;
      default:
        return voidType;
    }
  })();

  constructor(
    public range: SourceRange,
    public value: any
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
  valueType: Type;

  constructor(
    public range: SourceRange,
    public object: Expression,
    public member: Identifier
  ) {
    const objectType = object.valueType;

    if (!objectType.getMember(member.name)) {
      throw CompilationError.typeError(
        range,
        `Type '${objectType}' don't have member '${member.name}'`
      );
    }
    this.valueType = objectType.getMember(member.name).type.get();
  }
}

export
class OperatorAccessExpression implements Expression {
  operator: Operator;
  valueType: Type;

  constructor(
    public range: SourceRange,
    public object: Expression,
    operatorName: Identifier,
    arity: number
  ) {
    const objectType = object.valueType;
    if (arity === 1) {
      this.operator = objectType.getUnaryOperators().get(operatorName.name);
    } else if (arity === 2) {
      this.operator = objectType.getBinaryOperators().get(operatorName.name);
    } else {
      throw new Error("unsupported arity");
    }
    if (!this.operator) {
      throw CompilationError.typeError(
        operatorName.range,
        `No operator '${operatorName.name}' for type '${objectType}'`
      );
    }
    this.valueType = this.operator.type;
  }
}

function blockType(block: Expression[]) {
  if (block.length > 0) {
    return block[block.length - 1].valueType;
  } else {
    return voidType;
  }
}

export
class IfExpression implements Expression {
  valueType: Type;
  constructor(
    public range: SourceRange,
    public environment: Environment,
    public condition: Expression,
    public ifTrue: Expression[],
    public ifFalse: Expression[],
    public tempVarName: string
  ) {
    this.valueType = new UnionType([blockType(ifTrue), blockType(ifFalse)], environment, range);
  }
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
