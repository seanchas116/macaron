import Type from "./Type";

export default
class CallSignature {
  constructor(public selfType: Type, public params: Type[], public returnType: Type) {
  }

  isCallable(selfType: Type, args: Type[], reasons: string[], ignoreThis = false) {
    if (this.params.length !== args.length) {
      return false;
    }
    if (!ignoreThis && !this.selfType.isAssignable(selfType, reasons)) {
      return false;
    }
    if (this.params.some((param, i) => !param.isAssignable(args[i], reasons))) {
      return false;
    }
    return true;
  }

  isAssignable(other: CallSignature, reasons: string[], ignoreThis = false) {
    // OK: (Object)=>Array to (Array)=>Object
    // NG: (Array)=>Object to (Object)=>Array
    if (!other.isCallable(this.selfType, this.params, reasons, ignoreThis)) {
      return false;
    }
    if (!this.returnType.isAssignable(other.returnType, reasons)) {
      return false;
    }
    return true;
  }

  replaceTypes(types: Map<Type, Type>) {
    return new CallSignature(
      this.selfType.replaceTypes(types),
      this.params.map(p => p.replaceTypes(types)),
      this.returnType.replaceTypes(types)
    );
  }

  static isAssignable(toSigs: CallSignature[], fromSigs: CallSignature[], reasons: string[], ignoreThis = false) {
    return toSigs.every(toSig => {
      return fromSigs.some(fromSig => toSig.isAssignable(fromSig, reasons, ignoreThis));
    });
  }
}
