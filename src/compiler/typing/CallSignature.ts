import Type from "./Type";

export default
class CallSignature {
  constructor(public selfType: Type, public params: Type[], public returnType: Type) {
  }

  isCallable(selfType: Type, args: Type[]) {
    if (this.params.length !== args.length) {
      return false;
    }
    if (!selfType.isAssignableTo(this.selfType)) {
      return false;
    }
    for (let i = 0; i < args.length; ++i) {
      if (!args[i].isAssignableTo(this.params[i])) {
        return false;
      }
    }
    return true;
  }

  isCastableTo(other: CallSignature) {
    // OK: (Object)=>Array to (Array)=>Object
    // NG: (Array)=>Object to (Object)=>Array
    if (!this.isCallable(other.selfType, other.params)) {
      return false;
    }
    if (!this.returnType.isAssignableTo(other.returnType)) {
      return false;
    }
    return true;
  }

  static isCastableTo(fromSigs: CallSignature[], toSigs: CallSignature[]) {
    return toSigs.every(toSig => {
      return fromSigs.some(fromSig => fromSig.isCastableTo(toSig));
    });
  }
}
