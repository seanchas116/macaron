import {voidType, numberType, booleanType, stringType} from "./nativeTypes";
import Type from "./Type";
import MetaType from "./type/MetaType";
import UnionType from "./type/UnionType";
import GenericsType from "./type/GenericsType";
import GenericsParameterType from "./type/GenericsParameterType";
import Identifier from "./Identifier";
import Operator from "./Operator";
import {Constness} from "./Member";

import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

export default
class Expression {
  type = voidType;

  constructor(public location: SourceLocation) {
  }
}

export
class TypeExpression extends Expression {
  metaType = MetaType.typeOnly(voidType);
  type = this.metaType;
}

export
class EmptyTypeExpression extends TypeExpression {
  constructor(type: Type) {
    super(SourceLocation.empty());
    this.type = this.metaType = MetaType.typeOnly(type);
  }
}

export
class IdentifierExpression extends Expression {
  constructor(public name: Identifier, public type: Type) {
    super(name.location);
  }
}

export
class AssignmentExpression extends Expression {
  constructor(location: SourceLocation, public assignable: Identifier, public value: Expression) {
    super(location);
  }
}

export
class NewVariableExpression extends Expression {
  constructor(location: SourceLocation, public constness: Constness, public assignable: Identifier, public value: Expression) {
    super(location);
  }
}

export
class FunctionCallExpression extends Expression {
  function: Expression;
  arguments: Expression[];
  isNewCall: boolean;

  constructor(location: SourceLocation, func: Expression, args: Expression[], isNewCall = false) {
    super(location);
    this.isNewCall = isNewCall;
    this.function = func;
    this.arguments = args;

    let selfType = voidType;
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
    const sigs = isNewCall ? funcType.newSignatures : funcType.callSignatures;
    const argTypes = args.map(a => a.type);
    const reasons: string[] = [];
    const sig = sigs.find(sig => sig.isCallable(selfType, argTypes, reasons, hasSelf)); // ignore self type check on method call
    if (!sig) {
      throw CompilationError.typeError(
        location,
        `Type '${funcType}' cannot be called with [${argTypes.join(", ")}]`,
        ...reasons
      );
    }
    this.type = sig.returnType;
  }
}

export
class GenericsExpression extends Expression {
  constructor(location: SourceLocation, public genericsType: GenericsType, public expression: Expression) {
    super(location);
    this.type = genericsType;
  }
}

export
class GenericsCallExpression extends Expression {
  arguments: Type[];

  constructor(location: SourceLocation, public value: Expression, args: Type[]) {
    super(location);
    this.arguments = args;

    const genericsType = this.value.type;
    if (genericsType instanceof GenericsType) {
      const paramLength = genericsType.parameters.length
      if (paramLength !== args.length) {
        throw CompilationError.typeError(
          args[0].location,
          `Number of generics arguments wrong (${args.length} for ${paramLength})`
        );
      }

      const types = new Map<GenericsParameterType, Type>();
      for (const [i, placeholder] of genericsType.parameters.entries()) {
        const reasons: string[] = [];
        const {constraint} = placeholder;
        if (!constraint.isAssignable(args[i], reasons)) {
          throw CompilationError.typeError(
            args[i].location,
            `Cannot assign '${args[i]}' to type '${constraint}'`,
            ...reasons
          );
        }
        types.set(placeholder, args[i]);
      }

      this.type = genericsType.resolveGenerics(types);
    } else {
      throw CompilationError.typeError(
        this.value.location,
        `The value is not generic`
      );
    }
  }
}

export
class LiteralExpression extends Expression {
  constructor(location: SourceLocation, public value: any) {
    super(location);
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
class ReturnExpression extends Expression {
  constructor(location: SourceLocation, public expression: Expression) {
    super(location);
    this.type = expression.type;
  }
}

export
class MemberAccessExpression extends Expression {
  constructor(location: SourceLocation, public object: Expression , public member: Identifier) {
    super(location);
    const objectType = object.type;

    if (!objectType.members.get(member.name)) {
      throw CompilationError.typeError(
        location,
        `Type '${objectType}' don't have member '${member.name}'`
      );
    }
    this.type = objectType.members.get(member.name).type.get();
  }
}

export
class OperatorAccessExpression extends Expression {
  operator: Operator;

  constructor(location: SourceLocation, public object: Expression, operatorName: Identifier, arity: number) {
    super(location);
    const objectType = object.type;
    if (arity === 1) {
      this.operator = objectType.unaryOperators.get(operatorName.name);
    } else if (arity === 2) {
      this.operator = objectType.binaryOperators.get(operatorName.name);
    } else {
      throw new Error("unsupported arity");
    }
    if (!this.operator) {
      throw CompilationError.typeError(
        operatorName.location,
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
  constructor(location: SourceLocation, public condition: Expression, public ifTrue: Expression[], public ifFalse: Expression[], public tempVarName: string) {
    super(location);
    this.type = new UnionType([blockType(ifTrue), blockType(ifFalse)], location);
  }
}

export
class EmptyExpression extends Expression {
  constructor(location: SourceLocation, public type: Type) {
    super(location);
  }
}
