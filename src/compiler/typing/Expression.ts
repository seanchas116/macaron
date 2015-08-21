import {voidType, numberType, booleanType, stringType} from "./nativeTypes";
import Type from "./Type";
import UnionType from "./type/UnionType";
import Identifier from "./Identifier";
import Operator from "./Operator";
import {TypeThunk} from "./Thunk";
import MetaValue from "./MetaValue";
import {Constness} from "./Member";

import SourceLocation from "../common/SourceLocation";
import CompilationError from "../common/CompilationError";

export default
class Expression {
  metaValue = new MetaValue(voidType);

  constructor(public location: SourceLocation) {
  }

  getType() {
    return this.metaValue.type.get();
  }
}

export
class IdentifierExpression extends Expression {
  constructor(public name: Identifier, public metaValue: MetaValue) {
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
        selfType = func.object.getType();
      }
      if (func instanceof OperatorAccessExpression) {
        selfType = func.object.getType();
      }
    }

    const funcType = func.getType();
    const sigs = isNewCall ? funcType.newSignatures : funcType.callSignatures;
    const argTypes = args.map(a => a.getType());
    const sig = sigs.find(sig => sig.isCallable(selfType, argTypes));
    if (!sig) {
      throw CompilationError.typeError(
        `Type '${funcType}' cannot be called with ['${argTypes.join(",")}']`,
        location
      );
    }
    this.metaValue = new MetaValue(sig.returnType.get());
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
    this.metaValue = new MetaValue(type);
  }
}

export
class ReturnExpression extends Expression {
  constructor(location: SourceLocation, public expression: Expression) {
    super(location);
    this.metaValue = expression.metaValue;
  }
}

export
class MemberAccessExpression extends Expression {
  constructor(location: SourceLocation, public object: Expression , public member: Identifier) {
    super(location);
    const objectType = object.getType();

    if (!objectType.getMember(member.name)) {
      throw CompilationError.typeError(
        `Type '${objectType}' don't have member '${member.name}'`,
        location
      );
    }
    this.metaValue = objectType.getMember(member.name).metaValue;
  }
}

export
class OperatorAccessExpression extends Expression {
  operator: Operator;

  constructor(location: SourceLocation, public object: Expression, operatorName: Identifier, arity: number) {
    super(location);
    const objectType = object.getType();
    if (arity === 1) {
      this.operator = objectType.getUnaryOperators().get(operatorName.name);
    } else if (arity === 2) {
      this.operator = objectType.getBinaryOperators().get(operatorName.name);
    } else {
      throw new Error("unsupported arity");
    }
    if (!this.operator) {
      throw CompilationError.typeError(
        `No operator '${operatorName.name}' for type '${objectType}'`,
        operatorName.location
      );
    }
    this.metaValue = new MetaValue(this.operator.type.get());
  }
}

function blockType(block: Expression[]) {
  if (block.length > 0) {
    return block[block.length - 1].getType();
  } else {
    return voidType;
  }
}

export
class IfExpression extends Expression {
  constructor(location: SourceLocation, public condition: Expression, public ifTrue: Expression[], public ifFalse: Expression[], public tempVarName: string) {
    super(location);
    this.metaValue = new MetaValue(new UnionType([blockType(ifTrue), blockType(ifFalse)], location));
  }
}
