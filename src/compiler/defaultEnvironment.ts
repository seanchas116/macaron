import DeclarationType from "./DeclarationType";
import Environment from "./Environment";
import {numberType} from "./nativeTypes";
import {MetaType} from "./Type";
import {IdentifierAST} from "./AST";
import SourceLocation from "./SourceLocation";

export default
function defaultEnvironment() {
  const env = new Environment();
  env.addVariable(DeclarationType.Constant, new IdentifierAST(new SourceLocation(1, 1, 0), "number"), new MetaType(numberType));

  return env;
}
