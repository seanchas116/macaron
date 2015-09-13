import Environment from "./Environment";
import {
  numberType,
  booleanType,
  stringType,
  voidType,
  initNativeTypes,
  typeOnlyType,
} from "./nativeTypes";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new Environment();

  env.addVariable("number", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, numberType)));
  env.addVariable("boolean", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, booleanType)));
  env.addVariable("string", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, stringType)));
  env.addVariable("void", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, voidType)));
  env.addVariable("any", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, voidType)));

  env.addVariable("true", new Member(Constness.Builtin, new MetaValue(booleanType, true)));
  env.addVariable("false", new Member(Constness.Builtin, new MetaValue(booleanType, false)));
  env.addVariable("null", new Member(Constness.Builtin, new MetaValue(voidType)));
  env.addVariable("undefined", new Member(Constness.Builtin, new MetaValue(voidType)));

  return env;
}
