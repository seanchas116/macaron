import {BlockEnvironment} from "./Environment";
import {
  numberType,
  booleanType,
  stringType,
  voidType,
  initNativeTypes,
} from "./nativeTypes";
import Member, {Constness} from "./Member";
import MetaType from "./type/MetaType";
import ConstValueType from "./type/ConstValueType";

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new BlockEnvironment();

  env.addVariable("number", new Member(Constness.Constant, MetaType.typeOnly(numberType)));
  env.addVariable("boolean", new Member(Constness.Constant, MetaType.typeOnly(booleanType)));
  env.addVariable("string", new Member(Constness.Constant, MetaType.typeOnly(stringType)));
  env.addVariable("void", new Member(Constness.Constant, MetaType.typeOnly(voidType)));
  env.addVariable("any", new Member(Constness.Constant, MetaType.typeOnly(voidType)));

  env.addVariable("true", new Member(Constness.Builtin, new ConstValueType(booleanType, true)));
  env.addVariable("false", new Member(Constness.Builtin, new ConstValueType(booleanType, false)));
  env.addVariable("null", new Member(Constness.Builtin, voidType));
  env.addVariable("undefined", new Member(Constness.Builtin, voidType));

  return env;
}
