import Type from "./Type";

export default
class CallSignature {
  constructor(public selfType: Type, public params: Type[], public returnType: Type) {
  }

  isCallable(selfType: Type, args: Type[]) {
    if (this.params.length !== args.length) {
      return false;
    }
    if (!this.selfType.isAssignable(selfType)) {
      return false;
    }
    if (this.params.some((param, i) => !param.isAssignable(args[i]))) {
      return false;
    }
    return true;
  }

  isAssignable(other: CallSignature) {
    // OK: (Object)=>Array to (Array)=>Object
    // NG: (Array)=>Object to (Object)=>Array
    if (!other.isCallable(this.selfType, this.params)) {
      return false;
    }
    if (!this.returnType.isAssignable(other.returnType)) {
      return false;
    }
    return true;
  }

  static isAssignable(toSigs: CallSignature[], fromSigs: CallSignature[]) {
    return toSigs.every(toSig => {
      return fromSigs.some(fromSig => toSig.isAssignable(fromSig));
    });
  }
}
