import Environment from "./Environment";
import {
  numberType,
  stringType,
  voidType
} from "./nativeTypes";

export default
function defaultEnvironment() {
  const env = new Environment();

  env.addType("number", numberType);
  env.addType("string", stringType);
  env.addType("void", voidType);
  env.addType("any", voidType);

  return env;
}
