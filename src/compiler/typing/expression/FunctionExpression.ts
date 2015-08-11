import Expression from "../Expression";
import Identifier from "../Identifier";
import Type from "../Type";
import Thunk, {ExpressionThunk, TypeThunk} from "../Thunk";
import {voidType} from "../nativeTypes";
import Environment from "../Environment";
import AssignType from "../AssignType";
import FunctionBodyExpression from "./FunctionBodyExpression";
import CompilationError from "../../common/CompilationError";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";

interface NameType {
  name: Identifier;
  type: Identifier;
}

export default
class FunctionExpression extends Expression {
  constructor(location: SourceLocation, public name: Identifier, public type: Type, public parameters: Identifier[], public body: FunctionBodyExpression) {
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

    subEnv.assignVariable(AssignType.Constant, new Identifier("this"), thisType);

    const bodyThunk = new ExpressionThunk(location, () => {
      return new FunctionBodyExpression(location, getBody(subEnv));
    });
    const type = new Type("function", voidType);
    const callSig = new CallSignature(thisType, paramTypes, bodyThunk.type);
    type.callSignatures.push(callSig);

    return new ExpressionThunk(location, () => {
      return new FunctionExpression(location, name, type, parameters.map(p => p.name), <FunctionBodyExpression>bodyThunk.get());
    });
  }
}
