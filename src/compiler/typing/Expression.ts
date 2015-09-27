import {voidType, numberType, booleanType, stringType} from "./nativeTypes";
import Type from "./Type";
import UnionType from "./type/UnionType";
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
    if (!isNewCall) {
      if (func instanceof MemberAccessExpression) {
        selfType = func.object.type;
      }
      if (func instanceof OperatorAccessExpression) {
        selfType = func.object.type;
      }
    }

    const funcType = func.type;
    const sigs = isNewCall ? funcType.getNewSignatures() : funcType.getCallSignatures();
    const argTypes = args.map(a => a.type);
    const sig = sigs.find(sig => sig.isCallable(selfType, argTypes));
    if (!sig) {
      throw CompilationError.typeError(
        location,
        `Type '${funcType}' cannot be called with [${argTypes.join(", ")}]`
      );
    }
    this.type = sig.returnType;
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

    if (!objectType.getMember(member.name)) {
      throw CompilationError.typeError(
        location,
        `Type '${objectType}' don't have member '${member.name}'`
      );
    }
    this.type = objectType.getMember(member.name).type.get();
  }
}

export
class OperatorAccessExpression extends Expression {
  operator: Operator;

  constructor(location: SourceLocation, public object: Expression, operatorName: Identifier, arity: number) {
    super(location);
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
  constructor(public location: SourceLocation, public type: Type) {
    super(location);
  }
}
