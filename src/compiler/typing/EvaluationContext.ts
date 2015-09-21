import Environment, {BlockEnvironment, ThisEnvironment} from "./Environment";
import Type from "./Type";
import MetaValueThunk from "./thunk/MetaValueThunk";
import Identifier from "./Identifier";
import CompilationError from "../common/CompilationError";
import Member, {Constness} from "./Member";
import MetaValue from "./MetaValue";
import {typeOnlyType} from "./nativeTypes";

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

  assignVariable(name: Identifier, metaValueOrThunk: MetaValue|MetaValueThunk) {
    const metaValue = MetaValueThunk.resolve(metaValueOrThunk);
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
    const type = metaValue.get().valueType;
    const variableType = member.metaValue.get().valueType;
    if (!type.isAssignableTo(variableType)) {
      throw CompilationError.typeError(
        `Cannot assign '${type}' to type '${variableType}'`,
        name.location
      );
    }
  }

  addVariable(constness: Constness, name: Identifier, metaValue: MetaValue|MetaValueThunk) {
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
    this.environment.addVariable(name.name, new Member(constness, metaValue));
  }
}
