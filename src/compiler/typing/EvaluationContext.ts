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
        `Variable '${name.name}' not found`,
        name.location
      );
    }
    return variable;
  }

  assignVariable(name: Identifier, typeOrOrThunk: Type|TypeThunk) {
    const type = TypeThunk.resolve(typeOrOrThunk);
    const {member} = this.getVariable(name);

    if (member.constness === Constness.Constant) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is constant and cannot be reassigned`,
        name.location
      );
    }
    if (member.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is builtin and cannot be reassigned`,
        name.location
      );
    }
    if (!member.type.get().isAssignable(type.get())) {
      throw CompilationError.typeError(
        `Cannot assign '${type.get()}' to type '${member.type.get()}'`,
        name.location
      );
    }
  }

  addVariable(constness: Constness, name: Identifier, type: Type|TypeThunk) {
    const variable = this.environment.getVariable(name.name);
    if (variable && variable.member.constness === Constness.Builtin) {
      throw CompilationError.typeError(
        `Variable '${name.name}' is builtin and cannot be redefined`,
        name.location
      );
    }
    if (this.environment.getOwnVariable(name.name)) {
      throw CompilationError.typeError(
        `Variable '${name.name}' already defined`,
        name.location
      );
    }
    this.environment.addVariable(name.name, new Member(constness, type));
  }
}
