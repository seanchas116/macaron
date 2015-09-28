import Environment, {BlockEnvironment, ThisEnvironment} from "./Environment";
import Type from "./Type";
import Identifier from "./Identifier";
import TypeThunk from "./thunk/TypeThunk";
import Member, {Constness} from "./Member";
import {typeOnlyType} from "./nativeTypes";
import CompilationError from "../common/CompilationError";

export default
class EvaluationContext {

  constructor(public environment: Environment) {
  }

  newChild(thisType: Type = null) {
    if (thisType) {
      return new EvaluationContext(new BlockEnvironment(new ThisEnvironment(this.environment, thisType)));
    }
    else {
      return new EvaluationContext(new BlockEnvironment(this.environment));
    }
  }

  getVariable(name: Identifier) {
    const variable = this.environment.getVariable(name.name);
    if (!variable) {
      throw CompilationError.typeError(
        name.location,
        `Variable '${name.name}' not found`
      );
    }
    return variable;
  }

  assignVariable(name: Identifier, typeOrOrThunk: Type|TypeThunk, firstAssign = false) {
    const type = TypeThunk.resolve(typeOrOrThunk);
    const {member} = this.getVariable(name);

    if (member.constness === Constness.Constant && !firstAssign) {
      throw CompilationError.typeError(
        name.location,
        `Variable '${name.name}' is constant and cannot be reassigned`
      );
    }
    if (member.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        name.location,
        `Variable '${name.name}' is builtin and cannot be reassigned`
      );
    }
    const reasons: string[] = [];
    const assignable = member.settingType.get().isAssignable(type.get(), reasons);
    if (!assignable) {
      throw CompilationError.typeError(
        name.location,
        `Cannot assign '${type.get()}' to type '${member.type.get()}'`,
        ...reasons
      );
    }
  }

  addVariable(constness: Constness, name: Identifier, type: Type|TypeThunk) {
    const variable = this.environment.getVariable(name.name);
    if (variable && variable.member.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        name.location,
        `Variable '${name.name}' is builtin and cannot be redefined`
      );
    }
    if (this.environment.getOwnVariable(name.name)) {
      throw CompilationError.typeError(
        name.location,
        `Variable '${name.name}' already defined`
      );
    }
    this.environment.addVariable(name.name, new Member(constness, type));
  }
}
