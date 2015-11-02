import Type from "../Type";
import InterfaceType from "./InterfaceType";
import Environment from "../Environment";
import SourceRange from "../../common/SourceRange";

export default
class GenericsParameterType extends InterfaceType {
  constructor(
    name: string,
    public constraint: Type,
    env: Environment,
    range: SourceRange
  ) {
    super(name, [constraint], env, range);
  }

  isAssignable(other: Type): boolean {
    return other === this;
  }

  resolveGenerics(types: Map<GenericsParameterType, Type>): Type {
    return types.get(this) || this;
  }
}
