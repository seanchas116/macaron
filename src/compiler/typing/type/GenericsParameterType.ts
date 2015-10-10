import Type from "../Type";
import Environment from "../Environment";

export default
class GenericsParameterType extends Type {
  constructor(name: string, public constraint: Type, env: Environment) {
    super(name, [constraint], env);
  }

  isAssignable(other: Type): boolean {
    return other === this;
  }

  resolveGenerics(types: Map<GenericsParameterType, Type>): Type {
    return types.get(this) || this;
  }
}
