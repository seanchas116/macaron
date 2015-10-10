import Type from "../Type";
import GenericsParameterType from "./GenericsParameterType";
import CallSignature from "../CallSignature";

export default
class GenericsType extends Type {
  constructor(name: string, public parameters: GenericsParameterType[], public template: Type) {
    super(name, []);
  }
}
