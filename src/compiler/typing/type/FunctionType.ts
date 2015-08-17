import Type from "../Type";
import CallSignature from "../CallSignature";
import SourceLocation from "../../common/SourceLocation";

export default
class FunctionType extends Type {
  constructor(public selfType: Type, public params: Type[], public optionalParams: Type[], public returnType: Type, loc: SourceLocation) {
    // TODO: add Function type
    super("", null, loc);

    {
      const funcName = (() => {
        if (optionalParams.length > 0) {
          return `(${params.join()}[, ${optionalParams.join()}])=>${returnType}`;
        }
        else {
          return `(${params.join()})=>${returnType}`
        }
      })();

      if (selfType) {
        this.name = `(${selfType})${funcName}`;
      }
      else {
        this.name = funcName;
      }
    }

    for (let i = 0; i <= optionalParams.length; ++i) {
      const signatureParams = params.concat(optionalParams.slice(0, optionalParams.length - i));
      const signature = new CallSignature(selfType, signatureParams, returnType);
      this.callSignatures.push(signature);
    }
  }
}
