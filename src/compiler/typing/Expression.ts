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
import {GenericsParameterExpression} from "./TypeExpression";

import SourceRange from "../common/SourceRange";
import CompilationError from "../common/CompilationError";

export default
class Expression {
  constructor(
    public range: SourceRange,
    public type: Type
  ) {}
}

export
class IdentifierExpression extends Expression {
  constructor(
    range: SourceRange,
    public name: Identifier,
    type: Type
  ) {
    super(range, type);
  }
}

export
class AssignmentExpression extends Expression {
  constructor(
    range: SourceRange,
    public assignable: AssignableExpression,
    public value: Expression
  ) {
    super(range, value.type);
  }
}

export
class NewVariableExpression extends Expression {
  constructor(
    range: SourceRange,
    public constness: Constness,
    public assignable: AssignableExpression,
    public value: Expression
  ) {
    super(range, value.type);
  }
}

export
class FunctionCallExpression extends Expression {
  function: Expression;
  arguments: Expression[];

  constructor(
    range: SourceRange,
    func: Expression,
    args: Expression[],
    public isNewCall: boolean,
    type: Type
  ) {
    super(range, type);
    this.function = func;
    this.arguments = args;
  }
}

export
class GenericsExpression extends Expression {
  constructor(
    range: SourceRange,
    public parameters: GenericsParameterExpression[],
    public genericsType: GenericsType,
    public expression: Expression
  ) {
    super(range, genericsType);
  }
}

export
class GenericsCallExpression extends Expression {
  arguments: Type[];
  type: Type;

  constructor(
    public range: SourceRange,
    public value: Expression,
    args: Type[]
  ) {
    super(range, voidType);
    this.arguments = args;

    const genericsType = this.value.type;
    if (genericsType instanceof GenericsType) {
      const paramLength = genericsType.parameters.length
      if (paramLength !== args.length) {
        throw CompilationError.typeError(
          args[0].range,
          `Number of generics arguments wrong (${args.length} for ${paramLength})`
        );
      }

      const types = new Map<GenericsParameterType, Type>();
      for (const [i, placeholder] of genericsType.parameters.entries()) {
        const reasons: string[] = [];
        const {constraint} = placeholder;
        if (!constraint.isAssignable(args[i], reasons)) {
          throw CompilationError.typeError(
            args[i].range,
            `Cannot assign '${args[i]}' to type '${constraint}'`,
            ...reasons
          );
        }
        types.set(placeholder, args[i]);
      }

      this.type = genericsType.template.resolveGenerics(types);
    } else {
      throw CompilationError.typeError(
        this.value.range,
        `The value is not generic`
      );
    }
  }
}

export
class LiteralExpression extends Expression {
  type: Type;

  constructor(
    public range: SourceRange,
    public value: any
  ) {
    super(range, (() => {
      switch (typeof value) {
        case "number":
          return numberType;
        case "string":
          return stringType;
        case "boolean":
          return booleanType;
        default:
          return voidType;
      }
    })());
  }
}

export
class ReturnExpression extends Expression {
  constructor(
    range: SourceRange,
    public expression: Expression
  ) {
    super(range, expression.type);
  }
}

export
class MemberAccessExpression extends Expression {
  constructor(
    range: SourceRange,
    public object: Expression,
    public member: Identifier
  ) {
    super(range, voidType);
    const objectType = object.type;

    if (!objectType.getMember(member.name)) {
      throw CompilationError.typeError(
        range,
        `Type '${objectType}' don't have member '${member.name}'`
      );
    }
    this.type = objectType.getMember(member.name).type.get();
  }
}

export
class OperatorAccessExpression extends Expression {
  operator: Operator;

  constructor(
    range: SourceRange,
    public object: Expression,
    operatorName: Identifier,
    arity: number
  ) {
    super(range, voidType);

    const objectType = object.type;
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
    this.type = this.operator.type;
  }
}

function blockType(block: Expression[]) {
  if (block.length > 0) {
    return block[block.length - 1].type;
  } else {
    return voidType;
  }
}

export
class IfExpression extends Expression {
  constructor(
    range: SourceRange,
    public environment: Environment,
    public condition: Expression,
    public ifTrue: Expression[],
    public ifFalse: Expression[],
    public tempVarName: string
  ) {
    super(range, new UnionType([blockType(ifTrue), blockType(ifFalse)], environment, range));
  }
}

export
class EmptyExpression extends Expression {
}

export
class DeclarationExpression extends Expression {
  constructor(
    range: SourceRange,
    public name: Identifier,
    type: Type
  ) {
    super(range, type);
  }
}
