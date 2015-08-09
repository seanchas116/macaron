import DeclarationType from "./DeclarationType";
import Environment from "./Environment";
import {
  numberType,
  stringType,
  voidType
} from "./nativeTypes";
import {
  Type,
  MetaType
} from "./Type";
import Identifier from "./Identifier";
import SourceLocation from "../common/SourceLocation";

export default
function defaultEnvironment() {
  const env = new Environment();

  function addType(name: string, type: Type) {
    env.addVariable(DeclarationType.Constant, new Identifier(new SourceLocation(1, 1, 0), name), new MetaType(type));
  }

  addType("number", numberType);
  addType("string", stringType);
  addType("void", voidType);

  return env;
}
