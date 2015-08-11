import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import Thunk, {ExpressionThunk, TypeThunk} from "../Thunk";
import {voidType} from "../nativeTypes";
import Environment from "../Environment";
import AssignType from "../AssignType";
import CompilationError from "../../common/CompilationError";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";

function returnType(expressions: Expression[]) {
  return expressions[expressions.length - 1].type;
}

interface NameType {
  name: Identifier;
  type: Identifier;
}

export default
class FunctionExpression extends Expression {
  constructor(location: SourceLocation, public name: Identifier, public type: Type, public parameters: Identifier[], public body: Expression[]) {
    super(location);
  }

  static thunk(location: SourceLocation, env: Environment, name: Identifier, thisType: Type, parameters: NameType[], getBody: (env: Environment) => Expression[]) {
    const paramTypes: Type[] = [];
    const subEnv = new Environment(env);

    for (const {name, type: typeName} of parameters) {
      const type = subEnv.getType(typeName.name).get();
      if (!type) {
        throw CompilationError.typeError(
          `Type '${typeName}' not in scope`,
          typeName.location
        );
      }
      subEnv.assignVariable(AssignType.Constant, name, type);
      paramTypes.push(type);
    }

    const bodyThunk = new Thunk<Expression[]>(location, () => getBody(subEnv));
    const type = new Type("function", voidType);
    const returnTypeThunk = new TypeThunk(location, () => {
      return returnType(bodyThunk.get());
    });
    const callSig = new CallSignature(thisType, paramTypes, returnTypeThunk);
    type.callSignatures.push(callSig);

    return new ExpressionThunk(location, () => {
      return new FunctionExpression(location, name, type, parameters.map(p => p.name), bodyThunk.get());
    });
  }
}
