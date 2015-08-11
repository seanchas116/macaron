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

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new Environment();

  env.addType(new Identifier("number"), numberType);
  env.addType(new Identifier("boolean"), booleanType);
  env.addType(new Identifier("string"), stringType);
  env.addType(new Identifier("void"), voidType);
  env.addType(new Identifier("any"), voidType);

  return env;
}
