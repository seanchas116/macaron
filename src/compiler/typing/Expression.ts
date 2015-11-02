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

import SourceRange from "../common/SourceRange";
import CompilationError from "../common/CompilationError";

interface Expression {
  type: Type;
  range: SourceRange;
}
export default Expression;

export
class IdentifierExpression implements Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public type: Type
  ) {}
}

export
class AssignmentExpression implements Expression {
  type = this.value.type;
  constructor(
    public range: SourceRange,
    public assignable: Identifier,
    public value: Expression
  ) {}
}

export
class NewVariableExpression implements Expression {
  type = this.value.type;
  constructor(
    public range: SourceRange,
    public constness: Constness,
    public assignable: Identifier,
    public value: Expression
  ) {}
}

export
class FunctionCallExpression implements Expression {
  function: Expression;
  arguments: Expression[];
  isNewCall: boolean;
  type: Type;

  constructor(
    public range: SourceRange,
    func: Expression,
    args: Expression[],
    isNewCall = false
  ) {
    this.isNewCall = isNewCall;
    this.function = func;
    this.arguments = args;

    let selfType: Type = voidType;
    let hasSelf = false;
    if (!isNewCall) {
      if (func instanceof MemberAccessExpression) {
        selfType = func.object.type;
        hasSelf = true;
      }
      if (func instanceof OperatorAccessExpression) {
        selfType = func.object.type;
        hasSelf = true;
      }
    }

    const funcType = func.type;
    const sigs = isNewCall ? funcType.getNewSignatures() : funcType.getCallSignatures();
    const argTypes = args.map(a => a.type);
    const reasons: string[] = [];
    const sig = sigs.find(sig => sig.isCallable(selfType, argTypes, reasons, hasSelf)); // ignore self type check on method call
    if (!sig) {
      throw CompilationError.typeError(
        range,
        `Type '${funcType}' cannot be called with [${argTypes.join(", ")}]`,
        ...reasons
      );
    }
    this.type = sig.returnType;
  }
}

export
class GenericsExpression implements Expression {
  type = this.genericsType;
  constructor(
    public range: SourceRange,
    public genericsType: GenericsType,
    public expression: Expression
  ) {}
}

export
class GenericsCallExpression implements Expression {
  arguments: Type[];
  type: Type;

  constructor(
    public range: SourceRange,
    public value: Expression,
    args: Type[]
  ) {
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
class LiteralExpression implements Expression {
  type: Type;

  constructor(
    public range: SourceRange,
    public value: any
  ) {
    const type = (() => {
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
    })();
    this.type = type;
  }
}

export
class ReturnExpression implements Expression {
  type = this.expression.type;
  constructor(
    public range: SourceRange,
    public expression: Expression
  ) {}
}

export
class MemberAccessExpression implements Expression {
  type: Type;

  constructor(
    public range: SourceRange,
    public object: Expression,
    public member: Identifier
  ) {
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
class OperatorAccessExpression implements Expression {
  operator: Operator;
  type: Type;

  constructor(
    public range: SourceRange,
    public object: Expression,
    operatorName: Identifier,
    arity: number
  ) {
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
class IfExpression implements Expression {
  type: Type;

  constructor(
    public range: SourceRange,
    public environment: Environment,
    public condition: Expression,
    public ifTrue: Expression[],
    public ifFalse: Expression[],
    public tempVarName: string
  ) {
    this.type = new UnionType([blockType(ifTrue), blockType(ifFalse)], environment, range);
  }
}

export
class EmptyExpression implements Expression {
  constructor(
    public range: SourceRange,
    public type: Type
  ) {}
}

export
class DeclarationExpression implements Expression {
  constructor(
    public range: SourceRange,
    public name: Identifier,
    public type: Type
  ) {}
}
