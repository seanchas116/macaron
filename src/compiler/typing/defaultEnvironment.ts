import Environment from "./Environment";
import AssignType from "./AssignType";
import Identifier from "./Identifier";
import {
  numberType,
  booleanType,
  stringType,
  voidType,
  initNativeTypes
} from "./nativeTypes";
import {TypeThunk} from "./Thunk";

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new Environment();

  env.setType("number", numberType);
  env.setType("boolean", booleanType);
  env.setType("string", stringType);
  env.setType("void", voidType);
  env.setType("any", voidType);

  env.setVariable("true", {type: TypeThunk.resolve(booleanType), assignType: AssignType.Builtin});
  env.setVariable("false", {type: TypeThunk.resolve(booleanType), assignType: AssignType.Builtin});
  env.setVariable("null", {type: TypeThunk.resolve(voidType), assignType: AssignType.Builtin});
  env.setVariable("undefined", {type: TypeThunk.resolve(voidType), assignType: AssignType.Builtin});

  return env;
}
