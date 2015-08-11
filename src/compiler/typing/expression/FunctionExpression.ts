import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import Thunk, {ExpressionThunk, TypeThunk} from "../Thunk";
import {voidType} from "../nativeTypes";
import CompilationError from "../../common/CompilationError";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";

function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class FunctionExpression extends Expression {
  constructor(location: SourceLocation, public name: Identifier, public type: Type, public parameters: Identifier[], public body: Expression[]) {
    super(location);
  }

  static thunk(location: SourceLocation, name: Identifier, parameters: [Identifier, Type][], getBody: () => Expression[]) {
    const bodyThunk = new Thunk<Expression[]>(location, getBody);
    const type = new Type("function", voidType);
    const returnTypeThunk = new TypeThunk(location, () => {
      return returnType(bodyThunk.get());
    });
    const callSig = new CallSignature(voidType, parameters.map(pair => pair[1]), returnTypeThunk);
    type.callSignatures.push(callSig);

    return new ExpressionThunk(location, () => {
      return new FunctionExpression(location, name, type, parameters.map(pair => pair[0]), bodyThunk.get());
    });
  }
}
