import Environment from "./Environment";
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

  env.addType("number", numberType);
  env.addType("boolean", booleanType);
  env.addType("string", stringType);
  env.addType("void", voidType);
  env.addType("any", voidType);
  env.addVariable("this", voidType, true);

  return env;
}
