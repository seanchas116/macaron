import {BlockEnvironment} from "./Environment";
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
import ConstValueType from "./type/ConstValueType";

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new BlockEnvironment();

  env.addVariable("number", new Member(Constness.Constant, new MetaValue(typeOnlyType, numberType)));
  env.addVariable("boolean", new Member(Constness.Constant, new MetaValue(typeOnlyType, booleanType)));
  env.addVariable("string", new Member(Constness.Constant, new MetaValue(typeOnlyType, stringType)));
  env.addVariable("void", new Member(Constness.Constant, new MetaValue(typeOnlyType, voidType)));
  env.addVariable("any", new Member(Constness.Constant, new MetaValue(typeOnlyType, voidType)));

  env.addVariable("true", new Member(Constness.Builtin, new MetaValue(new ConstValueType(booleanType, true))));
  env.addVariable("false", new Member(Constness.Builtin, new MetaValue(new ConstValueType(booleanType, false))));
  env.addVariable("null", new Member(Constness.Builtin, new MetaValue(voidType)));
  env.addVariable("undefined", new Member(Constness.Builtin, new MetaValue(voidType)));

  return env;
}
