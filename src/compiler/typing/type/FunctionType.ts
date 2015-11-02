import Type from "../Type";
import InterfaceType from "./InterfaceType";
import CallSignature from "../CallSignature";
import Environment from "../Environment";
import SourceRange from "../../common/SourceRange";
import {voidType} from "../defaultEnvironment";

export default
class FunctionType extends InterfaceType {
  constructor(
    public selfType: Type,
    public params: Type[],
    public optionalParams: Type[],
    public returnType: Type,
    env: Environment, range: SourceRange
  ) {
    // TODO: inherit Function type
    super("", [], env, range);

    {
      const funcName = (() => {
        if (optionalParams.length > 0) {
          return `(${params.join(", ")}[, ${optionalParams.join(", ")}]) => ${returnType}`;
        }
        else {
          return `(${params.join()}) => ${returnType}`
        }
      })();

      if (selfType == voidType) {
        this.name = funcName;
      }
      else {
        this.name = `(${selfType})${funcName}`;
      }
    }
    for (let i = 0; i <= optionalParams.length; ++i) {
      const signatureParams = params.concat(optionalParams.slice(0, optionalParams.length - i));
      const signature = new CallSignature(selfType, signatureParams, returnType);
      this.callSignatures.push(signature);
    }
  }

  mapTypes(mapper: (type: Type) => Type) {
    return new FunctionType(
      mapper(this.selfType),
      this.params.map(mapper),
      this.optionalParams.map(mapper),
      mapper(this.returnType),
      this.environment,
      this.range
    );
  }
}
