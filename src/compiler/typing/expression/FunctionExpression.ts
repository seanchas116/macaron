import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import {voidType} from "../nativeTypes";
import CompilationError from "../../common/CompilationError";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";

function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

export default
class FunctionExpression extends Expression {
  _type: Type;

  constructor(location: SourceLocation, public name: Identifier, public parameters: [Identifier, Type][], public body: Expression[]) {
    super(location);
    const type = this._type = new Type("function", voidType, this);
    const callSig = new CallSignature(voidType, parameters.map(pair => pair[1]), returnType(body));
    type.callSignatures.push(callSig);
  }

  get type() {
    return this._type;
  }
}
