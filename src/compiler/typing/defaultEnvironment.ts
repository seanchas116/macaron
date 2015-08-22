import Environment from "./Environment";
import Identifier from "./Identifier";
import {
  numberType,
  booleanType,
  stringType,
  voidType,
  initNativeTypes,
  typeOnlyType,
} from "./nativeTypes";
import TypeThunk from "./thunk/TypeThunk";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new Environment();

  env.setVariable("number", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, numberType)));
  env.setVariable("boolean", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, booleanType)));
  env.setVariable("string", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, stringType)));
  env.setVariable("void", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, voidType)));
  env.setVariable("any", new Member(Constness.Constant, new MetaValue(typeOnlyType, null, voidType)));

  env.setVariable("true", new Member(Constness.Builtin, new MetaValue(booleanType, true)));
  env.setVariable("false", new Member(Constness.Builtin, new MetaValue(booleanType, false)));
  env.setVariable("null", new Member(Constness.Builtin, new MetaValue(voidType)));
  env.setVariable("undefined", new Member(Constness.Builtin, new MetaValue(voidType)));

  return env;
}
