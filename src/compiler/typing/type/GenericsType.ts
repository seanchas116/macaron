import Type from "../Type";
import GenericsParameterType from "./GenericsParameterType";
import Environment from "../Environment";
import SourceRange from "../../common/SourceRange";

export default
class GenericsType extends Type {
  constructor(
    name: string,
    public parameters: GenericsParameterType[],
    public template: Type,
    env: Environment,
    range: SourceRange
  ) {
    super(name, env, range);
  }
}
