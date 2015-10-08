import Type from "../Type";
import GenericsParameterType from "./GenericsParameterType";
import CallSignature from "../CallSignature";

export
class GenericsParameter {
  constructor(public placeholder: GenericsParameterType, public constraint: Type) {}
}

export default
class GenericsType extends Type {
  constructor(name: string, public parameters: GenericsParameter[], public template: Type) {
    super(name);
  }
}
