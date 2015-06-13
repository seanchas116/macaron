import DeclarationType from "./DeclarationType";
import Environment from "./Environment";
import {numberType} from "./nativeTypes";
import {Type} from "./Type";
import {IdentifierAST} from "./AST";

export default
function defaultEnvironment() {
  const env = new Environment();
  env.addVariable(DeclarationType.Constant, new IdentifierAST("number"), numberType);
  
  return env;
}
