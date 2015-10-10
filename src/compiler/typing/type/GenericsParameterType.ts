import Type from "../Type";

export default
class GenericsParameterType extends Type {
  constructor(name: string, public constraint: Type) {
    super(name, [constraint]);
  }

  isAssignable(other: Type): boolean {
    return other === this;
  }

  resolveGenerics(types: Map<GenericsParameterType, Type>): Type {
    return types.get(this) || this;
  }
}
