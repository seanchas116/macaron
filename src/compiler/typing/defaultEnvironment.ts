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
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";

export default
function defaultEnvironment() {
  initNativeTypes();

  const env = new Environment();

  env.setType("number", numberType);
  env.setType("boolean", booleanType);
  env.setType("string", stringType);
  env.setType("void", voidType);
  env.setType("any", voidType);

  env.setVariable("true", new Member(Constness.Builtin, new MetaValue(booleanType, true)));
  env.setVariable("false", new Member(Constness.Builtin, new MetaValue(booleanType, false)));
  env.setVariable("null", new Member(Constness.Builtin, new MetaValue(voidType)));
  env.setVariable("undefined", new Member(Constness.Builtin, new MetaValue(voidType)));

  return env;
}
