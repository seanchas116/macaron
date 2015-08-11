import DeclarationType from "./DeclarationType";
import {voidType, numberType, stringType} from "./nativeTypes";
import Type from "./Type";
import SourceLocation from "../common/SourceLocation";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";
import Operator from "./Operator";

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
  constructor(location: SourceLocation, public declarationType: DeclarationType, public assignable: Identifier, public value: Expression) {
    super(location);
    this.type = value.type;
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

    const sigs = isNewCall ? func.type.newSignatures : func.type.callSignatures;
    const argTypes = args.map(a => a.type);
    const sig = sigs.find(sig => sig.isCallable(selfType, argTypes));
    if (!sig) {
      throw CompilationError.typeError(
        `Type '${func.type}' cannot be called with ['${argTypes.join(",")}']`,
        location
      );
    }
    this.type = sig.returnType.get();
  }
}

export
class LiteralExpression extends Expression {
  constructor(location: SourceLocation, public value: number|string) {
    super(location);
    if (typeof value === "number") {
      this.type = numberType;
    } else {
      this.type = stringType;
    }
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

    if (!object.type.getMember(member.name)) {
      throw CompilationError.typeError(
        `Type '${object.type}' don't have member '${member.name}'`,
        location
      );
    }
    this.type = object.type.getMember(member.name).get();
  }
}

export
class OperatorAccessExpression extends Expression {
  operator: Operator;

  constructor(location: SourceLocation, public object: Expression, operatorName: Identifier, arity: number) {
    super(location);
    if (arity === 1) {
      this.operator = object.type.getUnaryOperators().get(operatorName.name);
    } else if (arity === 2) {
      this.operator = object.type.getBinaryOperators().get(operatorName.name);
    } else {
      throw new Error("unsupported arity");
    }
    if (!this.operator) {
      throw CompilationError.typeError(
        `No operator '${operatorName.name}' for type '${object.type}'`,
        operatorName.location
      );
    }
    this.type = this.operator.type;
  }
}
