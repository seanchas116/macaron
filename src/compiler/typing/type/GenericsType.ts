import Type from "../Type";
import GenericsParameterType from "./GenericsParameterType";
import CallSignature from "../CallSignature";

export default
class GenericsType extends Type {
  constructor(name: string, public parameters: GenericsParameterType[], public template: Type) {
    super(name);
  }

  resolveGenerics(args: Type[]) {
    if (args.length !== this.parameters.length) {
      throw new Error("Generics argument count wrong");
    }

    const argMap = new Map<GenericsParameterType, Type>();
    for (const [i, arg] of args.entries()) {
      const param = this.parameters[i];
      const {restriction} = param;
      if (restriction.isAssignable(arg, [])) {
        throw new Error(`Genrics argument '${arg}' is not compatible to '${restriction}'`);
      }
      argMap.set(param, arg);
    }

    return this.template.replaceTypes(argMap);
  }
}
