import Type from "../Type";
import GenericsParameterType from "./GenericsParameterType";
import CallSignature from "../CallSignature";

function replaceGenericsArgsCallSignature(sig: CallSignature, args: Map<GenericsParameterType, Type>) {
  return new CallSignature(
    replaceGenericsArgs(sig.selfType, args),
    sig.params.map(p => replaceGenericsArgs(p, args)),
    replaceGenericsArgs(sig.returnType, args)
  );
}

function replaceGenericsArgs(type: Type, args: Map<GenericsParameterType, Type>): Type {
  if (type instanceof GenericsParameterType) {
    const arg = args.get(type);
    if (arg) {
      return arg;
    }
  }

  const superTypes = type.superTypes.map(t => replaceGenericsArgs(t, args));
  const newType = new Type(type.name, superTypes, type.location, type.expression);

  for (const [name, member] of type.selfMembers) {
    newType.addMember(name, member.mapType(t => replaceGenericsArgs(t, args)));
  }
  // TODO: operators

  newType.callSignatures = type.callSignatures.map(sig => replaceGenericsArgsCallSignature(sig, args));
  newType.newSignatures = type.newSignatures.map(sig => replaceGenericsArgsCallSignature(sig, args));

  return newType;
}

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
      if (restriction.isAssignable(arg)) {
        throw new Error(`Genrics argument '${arg}' is not compatible to '${restriction}'`);
      }
      argMap.set(param, arg);
    }

    return replaceGenericsArgs(this.template, argMap);
  }
}
