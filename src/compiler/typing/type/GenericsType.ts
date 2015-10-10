import Type from "../Type";
import GenericsParameterType from "./GenericsParameterType";
import CallSignature from "../CallSignature";
import Environment from "../Environment";

export default
class GenericsType extends Type {
  constructor(name: string, public parameters: GenericsParameterType[], public template: Type, env: Environment) {
    super(name, [], env);
  }
}
